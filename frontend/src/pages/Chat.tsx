import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare, User, Send, Bot, Shield, Search, Terminal, Info, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import TakeoverToggle from '../components/TakeoverToggle';
import { supabase } from '../lib/supabase';
import { useProfile } from '../context/ProfileContext';
import api from '../api/axios';
import { sendManualChat } from '../services/api';

export default function Chat() {
  const { profile } = useProfile();
  const agencyId = profile?.agency_id ?? null;
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedPhone) return;
    const loadMessages = async () => {
      if (!agencyId) return;

      // Primary source: conversations (client / ai / agency bubbles)
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('phone', selectedPhone)
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: true });
      const conv = (data || []).map((c: any) => ({
        id: c.id,
        phone: c.phone,
        message: c.message,
        sender: c.sender,
        created_at: c.created_at,
      }));

      // Backfill from conversation_history (user/model roles) for exchanges
      // that predate the lead/conversation rows (e.g. before agency existed).
      const { data: hist } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('phone_number', selectedPhone)
        .order('created_at', { ascending: true });
      const seen = new Set(conv.map((c: any) => (c.message || '').trim()));
      const fromHist = (hist || [])
        .filter((h: any) => !seen.has((h.content || '').trim()))
        .map((h: any) => ({
          id: h.id,
          phone: selectedPhone,
          message: h.content,
          sender: h.role === 'model' ? 'ai' : 'client',
          created_at: h.created_at,
        }));

      setMessages([...conv, ...fromHist].sort((a: any, b: any) =>
        String(a.created_at).localeCompare(String(b.created_at))));
    };
    loadMessages();

    // Quick polling for realtime experience during demos
    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, [selectedPhone, agencyId]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeSession || isSending) return;

    setIsSending(true);
    const currentMessage = messageText;
    try {
      if (!agencyId) {
        console.error("Agency not configured for lead dispatch.");
        return;
      }

      // 1. Persist to backend via /api/chatbot/simulate (ensures lead + conversation + agency_id binding)
      try {
        await api.post('/api/chatbot/simulate', {
          agency_id: agencyId,
          phone: activeSession.phone,
          message: currentMessage,
          sender: 'agency',
          name: activeSession.name || 'Prospect'
        }, {
          headers: {
            'X-Agency-Id': agencyId
          }
        });
      } catch (syncErr) {
        console.error("Backend sync error (falling back to direct insert):", syncErr);
        // Fallback: direct Supabase insert if backend is unreachable
        await supabase.from('conversations').insert([{
          agency_id: agencyId,
          phone: activeSession.phone,
          message: currentMessage,
          sender: 'agency',
          created_at: new Date().toISOString()
        }]);
      }

      // Keep the draft in the box so the agent can retry after seeing the error.
      // (don't clear the input on a failed send)

      // 2. Dispatch the message out to the actual Meta Graph API via the backend
      try {
        await sendManualChat(activeSession.phone, currentMessage);
      } catch (err) {
        console.error("Meta API transmission error:", err);
        // Surface it to the user so they know why the reply didn't go out.
        setMessageText((m) => m + "\n\n[Erreur d'envoi: " + (err instanceof Error ? err.message : 'backend unreachable') + "]");
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
        if (!agencyId) {
          setIsLoading(false);
          return;
        }

        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('agency_id', agencyId)
          .order('created_at', { ascending: false });

        const mapped = (leadsData || []).map((l: any) => ({
          phone: l.phone_number || l.phone,
          name: l.full_name || l.name || 'Prospect',
          city: l.sector || l.city || 'Casablanca',
          is_ai_paused: l.is_ai_paused || false
        }));
        setSessions(mapped);
        if (mapped.length > 0) {
          setSelectedPhone(prev => prev && mapped.some(s => s.phone === prev) ? prev : mapped[0].phone);
        } else {
          setSelectedPhone(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();

    // Live refresh: surface new inbound clients without a page reload
    const timer = setInterval(loadSessions, 5000);
    return () => clearInterval(timer);
  }, [agencyId]);

  const activeSession = sessions.find(s => s.phone === selectedPhone);

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <span className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-500">Chargement des Conversations...</span>
    </div>
  );

  return (
    <div className="h-[calc(100vh-180px)] flex gap-10 overflow-hidden px-2 pb-2">
      {/* Sidebar: Conversations List */}
      <div className="w-80 flex flex-col gap-4">
        <div className="card-modern p-4 rounded-2xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-[10px] uppercase font-bold tracking-widest text-slate-400 placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
          {sessions.map(session => (
            <motion.button
              whileHover={{ scale: 1.01 }}
              key={session.phone}
              onClick={() => setSelectedPhone(session.phone)}
              className={`w-full p-4 rounded-xl transition-all text-left group border ${
                selectedPhone === session.phone 
                  ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/30' 
                  : 'bg-slate-800/30 border-slate-800/50 opacity-80 hover:opacity-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold tracking-tight ${selectedPhone === session.phone ? 'text-white' : 'text-slate-400'}`}>{session.name}</span>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${session.is_ai_paused ? 'bg-rose-500 animate-pulse shadow-[0_0_6px_#F43F5E]' : 'bg-emerald-400 shadow-[0_0_6px_#34D399]'}`} />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-black text-[9px] uppercase tracking-widest">{session.phone}</span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">LIVE</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Container: Chat Terminal */}
      <div className="flex-1 flex flex-col card-modern rounded-2xl border-slate-700/50 relative">
        {activeSession ? (
          <>
            <header className="p-5 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl card-modern flex items-center justify-center border-emerald-500/20">
                    <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase">{activeSession.name}</h3>
                  <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-wider mt-0.5">
                    <Shield className="w-3 h-3" /> Canal Direct
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 opacity-50">Prise de Main Manuelle</span>
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

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-transparent to-emerald-500/3">
                <div className="flex justify-center mb-3">
                    <span className="flex items-center gap-2 px-4 py-1.5 card-modern rounded-full text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        <Info className="w-3.5 h-3.5 text-emerald-400" /> HISTORIQUE WHATSAPP
                    </span>
                </div>

                {messages.length === 0 && (
                    <div className="flex justify-center mt-10">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Aucun historique disponible</span>
                    </div>
                )}

                {messages.map(msg => (
                    msg.sender === 'client' ? (
                        <div key={msg.id} className="flex flex-col items-start max-w-[75%] gap-1.5 group">
                            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/50 text-sm text-slate-300 leading-relaxed shadow-sm">
                                {msg.message}
                            </div>
                            <span className="text-[9px] font-black text-slate-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Client</span>
                        </div>
                    ) : (
                        <div key={msg.id} className="flex flex-col items-end ml-auto max-w-[75%] gap-1.5 group">
                            <motion.div 
                                animate={msg.sender === 'ai' ? { x: [0, 2, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className={`px-4 py-3 rounded-2xl rounded-tr-none text-sm leading-relaxed border relative overflow-hidden ${
                                    msg.sender === 'ai' 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-lg shadow-emerald-500/10' 
                                        : 'bg-amber-500/10 border-amber-500/30 text-white shadow-lg shadow-amber-500/10'
                                }`}
                            >
                                <div className="absolute inset-0 bg-white/5 animate-shimmer" />
                                {msg.message}
                            </motion.div>
                            <div className={`flex items-center gap-1.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase tracking-wider ${
                                msg.sender === 'ai' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                                {msg.sender === 'ai' ? (
                                    <><Bot className="w-3 h-3" /> IA AqarBot</>
                                ) : (
                                    <><Shield className="w-3 h-3" /> Agent</>
                                )}
                            </div>
                        </div>
                    )
                ))}
          </div>                <footer className="p-4 border-t border-slate-700/50">
                <form onSubmit={handleSendMessage} className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all border-2 ${activeSession.is_ai_paused ? 'bg-white border-rose-500/30 shadow-rose-500/10' : 'bg-slate-800/30 border-slate-700/30 opacity-40 grayscale pointer-events-none'}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                        <Terminal className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        disabled={!activeSession.is_ai_paused || isSending}
                        className="flex-1 px-3 py-2 bg-transparent outline-none text-sm font-bold text-white placeholder:text-slate-600"
                        placeholder={activeSession.is_ai_paused ? "Répondre au client..." : "L'IA en contrôle · Reprendre la main"}
                    />
                    <button 
                        type="submit"
                        disabled={!activeSession.is_ai_paused || isSending || !messageText.trim()}
                        className={`w-11 h-11 rounded-full transition-all flex items-center justify-center shrink-0 ${activeSession.is_ai_paused && messageText.trim() && !isSending ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 active:scale-90 hover:bg-emerald-400' : 'bg-slate-600 text-slate-500'}`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                {activeSession.is_ai_paused && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="h-px flex-1 bg-rose-500/20" />
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em] animate-pulse">CONTRÔLE MANUEL — L'IA EN PAUSE</span>
                        <div className="h-px flex-1 bg-rose-500/20" />
                    </div>
                )}</footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5">
              <MessageSquare className="w-8 h-8 text-emerald-400/50 animate-float" />
            </div>
            <h4 className="text-2xl font-bold uppercase tracking-tight text-white mb-2">Console Live Takeover</h4>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
