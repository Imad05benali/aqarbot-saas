import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare, User, Send, Bot, Shield, Search, Terminal, Info, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import TakeoverToggle from '../components/TakeoverToggle';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Chat() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedPhone) return;
    const loadMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('phone', selectedPhone)
        .eq('agency_id', user.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();
    
    // Quick polling for realtime experience during demos
    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, [selectedPhone]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeSession || isSending) return;

    setIsSending(true);
    const currentMessage = messageText;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication missing for lead dispatch.");
        return;
      }

      // 1. Persist to backend via /api/chatbot/simulate (ensures lead + conversation + agency_id binding)
      try {
        await fetch(`${API_BASE_URL}/api/chatbot/simulate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Agency-Id': user.id
          },
          body: JSON.stringify({
            agency_id: user.id,
            phone: activeSession.phone,
            message: currentMessage,
            sender: 'agency',
            name: activeSession.name || 'Prospect'
          })
        });
      } catch (syncErr) {
        console.error("Backend sync error (falling back to direct insert):", syncErr);
        // Fallback: direct Supabase insert if backend is unreachable
        await supabase.from('conversations').insert([{
          agency_id: user.id,
          phone: activeSession.phone,
          message: currentMessage,
          sender: 'agency',
          created_at: new Date().toISOString()
        }]);
      }

      setMessageText('');

      // 2. Dispatch the message out to the actual Meta Graph API
      try {
        await fetch(`${API_BASE_URL}/api/chat/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: activeSession.phone,
            message: currentMessage
          })
        });
      } catch (err) {
        console.error("Meta API transmission error:", err);
      }

      // 3. Instantly append to UI for responsive feel
      setMessages(prev => [...prev, {
        id: Math.random(),
        phone: activeSession.phone,
        message: currentMessage,
        sender: 'agency',
        created_at: new Date().toISOString()
      }]);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('agency_id', user.id)
          .order('created_at', { ascending: false });

        const mapped = (leadsData || []).map((l: any) => ({
          phone: l.phone || l.phone_number,
          name: l.name || l.full_name || 'Prospect',
          city: l.sector || l.Nighberd || 'Casablanca',
          is_ai_paused: l.is_ai_paused || false
        }));
        setSessions(mapped);
        if (mapped.length > 0) setSelectedPhone(mapped[0].phone);
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  const activeSession = sessions.find(s => s.phone === selectedPhone);

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
        <Zap className="w-10 h-10 text-accent animate-pulse" />
        <span className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-500">Chargement des Conversations en cours...</span>
    </div>
  );

  return (
    <div className="h-[calc(100vh-180px)] flex gap-10 overflow-hidden px-2 pb-2">
      {/* Sidebar: Conversations List */}
      <div className="w-96 flex flex-col gap-6">
        <div className="glacier-card p-5 rounded-3xl border-white/40 shadow-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest focus:border-accent/40 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
          {sessions.map(session => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              key={session.phone}
              onClick={() => setSelectedPhone(session.phone)}
              className={`w-full p-6 glacier-card rounded-[2.5rem] transition-all text-left group ${
                selectedPhone === session.phone 
                  ? 'bg-white dark:bg-slate-900 ring-2 ring-primary border-transparent' 
                  : 'bg-white/30 dark:bg-slate-900/10 border-transparent opacity-80 hover:opacity-100 hover:bg-white/50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-sm font-black tracking-tighter ${selectedPhone === session.phone ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{session.name}</span>
                <div className={`w-3 h-3 rounded-full ${session.is_ai_paused ? 'bg-rose-500 animate-pulse' : 'bg-primary'} shadow-[0_0_10px_currentColor]`} />
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-lg bg-accent/10 text-accent font-black text-[9px] uppercase tracking-widest">{session.phone}</span>
                <span className="text-[9px] font-bold text-slate-400">DONNÉES LIVE</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Container: Chat Terminal */}
      <div className="flex-1 flex flex-col glacier-card rounded-[4rem] border-white/40 border-2 shadow-2xl relative">
        {activeSession ? (
          <>
            <header className="p-8 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 glacier-card rounded-[2rem] flex items-center justify-center border-white/40 shadow-inner">
                    <User className="text-accent w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{activeSession.name}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-black text-primary tracking-[0.2em] uppercase mt-1">
                    <Shield className="w-4 h-4" /> Canal de Communication Direct
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-50">Prise de Main Manuelle</span>
                    <TakeoverToggle 
                        phone={activeSession.phone} 
                        initialPaused={activeSession.is_ai_paused}
                        onStatusChange={(status) => {
                            setSessions(sessions.map(s => s.phone === activeSession.phone ? {...s, is_ai_paused: status} : s));
                        }}
                    />
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-gradient-to-b from-transparent to-accent/5">
                <div className="flex justify-center mb-4">
                    <span className="flex items-center gap-2 px-6 py-2 glacier-card border-white/20 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <Info className="w-4 h-4 text-accent" /> HISTORIQUE DES ÉCHANGES WHATSAPP
                    </span>
                </div>

                {messages.length === 0 && (
                    <div className="flex justify-center mt-10">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Aucun historique disponible</span>
                    </div>
                )}

                {messages.map(msg => (
                    msg.sender === 'client' ? (
                        <div key={msg.id} className="flex flex-col items-start max-w-[70%] gap-2 group">
                            <div className="p-6 bg-white dark:bg-slate-800/80 glacier-card rounded-[2rem] rounded-tl-none border-white/50 text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed shadow-lg">
                                {msg.message}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 ml-4 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Client</span>
                        </div>
                    ) : (
                        <div key={msg.id} className="flex flex-col items-end ml-auto max-w-[70%] gap-2 group">
                            <motion.div 
                                animate={msg.sender === 'ai' ? { x: [0, 2, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className={`p-6 text-slate-950 font-black rounded-[2rem] rounded-tr-none shadow-2xl text-sm leading-relaxed border relative overflow-hidden ${
                                    msg.sender === 'ai' 
                                        ? 'bg-primary shadow-primary/20 border-white/20' 
                                        : 'bg-accent/90 shadow-accent/20 border-white/20 text-white'
                                }`}
                            >
                                <div className="absolute inset-0 bg-white/10 animate-shimmer" />
                                {msg.message}
                            </motion.div>
                            <div className={`flex items-center gap-2 mr-4 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black text-[10px] tracking-widest ${
                                msg.sender === 'ai' ? 'text-primary' : 'text-accent'
                            }`}>
                                {msg.sender === 'ai' ? (
                                    <><Bot className="w-4 h-4" /> IA AqarBot (Automatique)</>
                                ) : (
                                    <><Shield className="w-4 h-4" /> Vous (Agent)</>
                                )}
                            </div>
                        </div>
                    )
                ))}
          </div>

            <footer className="p-10 border-t border-white/10 bg-white/20 dark:bg-black/20">
                <form onSubmit={handleSendMessage} className={`flex items-center gap-3 p-3 rounded-[2.5rem] transition-all border-2 ${activeSession.is_ai_paused ? 'bg-white dark:bg-slate-950 border-rose-500/40 shadow-rose-500/10' : 'bg-slate-200/50 dark:bg-black/40 border-transparent opacity-40 grayscale pointer-events-none'}`}>
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Terminal className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={!activeSession.is_ai_paused || isSending}
                        className="flex-1 px-4 py-3 bg-transparent outline-none text-sm font-bold placeholder:text-slate-500"
                        placeholder={activeSession.is_ai_paused ? "Répondre au client via WhatsApp..." : "L'IA est en contrôle · Reprendre la main pour écrire"}
                    />
                    <button 
                        type="submit"
                        disabled={!activeSession.is_ai_paused || isSending || !messageText.trim()}
                        className={`w-14 h-14 rounded-full transition-all flex items-center justify-center shrink-0 ${activeSession.is_ai_paused && messageText.trim() && !isSending ? 'bg-accent text-white shadow-2xl shadow-accent/40 active:scale-90 hover:bg-blue-600' : 'bg-slate-500 opacity-20'}`}
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </form>
                {activeSession.is_ai_paused && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <div className="h-px flex-1 bg-rose-500/20" />
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">CONTRÔLE MANUEL : L'IA EST EN PAUSE</span>
                        <div className="h-px flex-1 bg-rose-500/20" />
                    </div>
                )}
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center filter saturate-0 opacity-20">
            <MessageSquare className="w-32 h-32 mb-8 animate-float" />
            <h4 className="text-4xl font-black uppercase italic tracking-tighter">Console de Live Takeover</h4>
            <p className="text-xs font-bold uppercase tracking-[0.4em] mt-2">Sélectionnez une conversation pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}
