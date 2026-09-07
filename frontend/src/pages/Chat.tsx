import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare, Send, Bot, Shield, Search, Terminal, Info, Zap } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedPhone) return;
    const load = async () => {
      if (!agencyId) return;
      const { data: conv } = await supabase.from('conversations').select('*').eq('phone', selectedPhone).eq('agency_id', agencyId).order('created_at', { ascending: true });
      const mapped = (conv || []).map(c => ({ id: c.id, phone: c.phone, message: c.message, sender: c.sender, created_at: c.created_at }));
      const { data: hist } = await supabase.from('conversation_history').select('*').eq('phone_number', selectedPhone).order('created_at', { ascending: true });
      const seen = new Set(mapped.map(c => (c.message || '').trim()));
      const fromHist = (hist || []).filter(h => !seen.has((h.content || '').trim())).map(h => ({ id: h.id, phone: selectedPhone, message: h.content, sender: h.role === 'model' ? 'ai' : 'client', created_at: h.created_at }));
      setMessages([...mapped, ...fromHist].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))));
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [selectedPhone, agencyId]);

  const send = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!msgText.trim() || !activeSession || sending) return;
    setSending(true);
    setSendError(null);
    const msg = msgText;
    // Clear the input immediately so a sent message never lingers.
    setMsgText('');
    try {
      if (!agencyId) return;
      try {
        await api.post('/api/chatbot/simulate', { agency_id: agencyId, phone: activeSession.phone, message: msg, sender: 'agency', name: activeSession.name || 'Prospect' }, { headers: { 'X-Agency-Id': agencyId } });
      } catch (syncErr) {
        console.error('Backend sync error, fallback insert', syncErr);
        await supabase.from('conversations').insert([{ agency_id: agencyId, phone: activeSession.phone, message: msg, sender: 'agency', created_at: new Date().toISOString() }]);
      }
      try {
        await sendManualChat(activeSession.phone, msg);
      } catch (err) {
        setSendError(err instanceof Error ? err.message : 'Backend injoignable');
      }
      setMessages(prev => [...prev, { id: Math.random(), phone: activeSession.phone, message: msg, sender: 'agency', created_at: new Date().toISOString() }]);
    } catch (e) { console.error(e); } finally { setSending(false); }
  };

  useEffect(() => {
    const load = async () => {
      if (!agencyId) { setLoading(false); return; }
      const { data } = await supabase.from('leads').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
      const mapped = (data || []).map(l => ({ phone: l.phone_number || l.phone, name: l.full_name || l.name || 'Prospect', city: l.sector || l.city || 'Casablanca', is_ai_paused: l.is_ai_paused || false }));
      setSessions(mapped);
      if (mapped.length > 0) setSelectedPhone(p => p && mapped.some(s => s.phone === p) ? p : mapped[0].phone);
      else setSelectedPhone(null);
      setLoading(false);
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [agencyId]);

  const activeSession = sessions.find(s => s.phone === selectedPhone);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Chargement des Conversations...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4 overflow-hidden bg-[#0B1120]">
      {/* Session list */}
      <div className="w-72 flex flex-col gap-3 shrink-0">
        {/* Search */}
        <div className="card-glass p-3 rounded-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input type="text" placeholder="Rechercher un client..." className="input-modern w-full pl-9 pr-3 py-2.5 text-xs" />
          </div>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {sessions.map(s => (
            <motion.button whileHover={{ scale: 1.01 }} key={s.phone} onClick={() => setSelectedPhone(s.phone)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${selectedPhone === s.phone ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/30' : 'bg-slate-800/30 border-slate-800/50 hover:border-slate-700/50'}`}>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="avatar-initial">{(s.name || '?')[0]}</div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate leading-none ${selectedPhone === s.phone ? 'text-white' : 'text-slate-400'}`}>{s.name}</p>
                  <span className={`text-sm font-bold leading-none ${selectedPhone === s.phone ? 'text-emerald-400' : 'text-slate-500'}`}>{s.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={s.is_ai_paused ? 'dot-paused' : 'dot-live'} />
                <span className="text-[9px] font-black uppercase text-slate-600">LIVE</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col card-glass rounded-2xl border-slate-800/50 overflow-hidden">
        {activeSession ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="avatar-initial w-9 h-9 rounded-xl bg-emerald-500/10 border-emerald-500/20">{(activeSession.name || '?')[0]}</div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{activeSession.name}</h3>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3 h-3" /> Canal Direct
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TakeoverToggle phone={activeSession.phone} initialPaused={activeSession.is_ai_paused} onStatusChange={status => setSessions(s => s.map(x => x.phone === activeSession.phone ? { ...x, is_ai_paused: status } : x))} />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent via-transparent to-emerald-500/3">
              <div className="flex justify-center mb-1">
                <span className="chip-emerald flex items-center gap-1.5 px-3 py-1">
                  <Info className="w-3 h-3 text-emerald-400" /> HISTORIQUE WHATSAPP
                </span>
              </div>

              {messages.length === 0 && (
                <div className="flex justify-center py-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Aucun historique disponible</span>
                </div>
              )}

              {messages.map(msg => (
                msg.sender === 'client' ? (
                  <div key={msg.id} className="flex flex-col items-start gap-1 max-w-[75%]">
                    <div className="px-4 py-2.5 rounded-2xl rounded-tl-none bg-slate-800/70 border border-slate-700/40 text-sm text-slate-300 leading-relaxed shadow-sm">
                      {msg.message}
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider ml-1 opacity-0 group-hover:opacity-100 transition-opacity">Client</span>
                  </div>
                ) : (
                  <div key={msg.id} className="flex flex-col items-end gap-1 max-w-[75%]">
                    <motion.div animate={msg.sender === 'ai' ? { x: [0, 2, 0] } : {}} transition={{ repeat: Infinity, duration: 3 }} className={`px-4 py-2.5 rounded-2xl rounded-tr-none text-sm leading-relaxed border relative overflow-hidden ${msg.sender === 'ai' ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-lg shadow-emerald-500/10' : 'bg-amber-500/10 border-amber-500/30 text-white shadow-lg shadow-amber-500/10'}`}>
                      <div className="absolute inset-0 bg-white/5 animate-shimmer" />
                      {msg.message}
                    </motion.div>
                    <span className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${msg.sender === 'ai' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {msg.sender === 'ai' ? <><Bot className="w-3 h-3" /> IA AqarBot</> : <><Shield className="w-3 h-3" /> Agent</>}
                    </span>
                  </div>
                )
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-800/50">
              <form onSubmit={send} className={`flex items-center gap-2 p-2 rounded-2xl transition-all border ${activeSession.is_ai_paused ? 'bg-white border-rose-500/30 shadow-rose-500/10' : 'bg-slate-800/30 border-slate-700/30 opacity-40 grayscale pointer-events-none'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activeSession?.is_ai_paused ? 'bg-slate-100 text-slate-600' : 'bg-slate-700 text-slate-400'}`}>
                  <Terminal className="w-4 h-4" />
                </div>
                <input value={msgText} onChange={e => setMsgText(e.target.value)} disabled={!activeSession?.is_ai_paused || sending} className={`flex-1 px-3 py-2 bg-transparent border-none outline-none text-sm font-bold transition-colors ${activeSession?.is_ai_paused ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-600'}`} placeholder={activeSession?.is_ai_paused ? 'Répondre au client...' : "L'IA en contrôle · Reprendre la main"} />
                <button type="submit" disabled={!activeSession?.is_ai_paused || sending || !msgText.trim()} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${activeSession?.is_ai_paused && msgText.trim() && !sending ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 active:scale-90 hover:bg-emerald-400' : 'bg-slate-600 text-slate-500'}`}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {activeSession?.is_ai_paused && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="h-px flex-1 bg-rose-500/20" />
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em] animate-pulse">CONTRÔLE MANUEL — L'IA EN PAUSE</span>
                  <div className="h-px flex-1 bg-rose-500/20" />
                </div>
              )}
              {sendError && (
                <p className="mt-2 text-center text-[9px] font-black uppercase tracking-widest text-rose-400">
                  ⚠ Envoi WhatsApp échoué : {sendError}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
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
