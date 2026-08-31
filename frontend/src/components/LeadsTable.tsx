import { useState } from 'react';
import { Mail, Phone, MapPin, Zap, Pause, Play, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyStateComponent from './EmptyStateComponent';

interface LeadRow {
  id: number;
  name?: string;
  full_name?: string;
  phone?: string;
  phone_number?: string;
  City?: string;
  sector?: string;
  Nighberd?: string;
  Type?: string;
  budget?: string | number;
  is_ai_paused?: boolean;
  status?: string;
  created_at: string;
  [key: string]: any;
}

interface LeadsTableProps {
  data: LeadRow[];
  onToggleBot?: (phone: string, status: boolean) => void;
}

export default function LeadsTable({ data, onToggleBot }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || data.length === 0) {
    return <EmptyStateComponent type="leads" />;
  }

  const filteredData = data.filter(row => {
    const rName = row.name || row.full_name || '';
    const rPhone = row.phone || row.phone_number || '';
    const rCity = row.City || '';
    return rName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           rPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
           rCity.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Lead Search & Metrics Row */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-[450px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Rechercher par Nom, WhatsApp ou Ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-3xl glacier-card bg-white/40 dark:bg-black/40 border-white/10 text-sm font-bold outline-none focus:border-accent/40 shadow-2xl transition-all"
          />
        </div>
        
        <div className="flex items-center gap-4">
            <div className="px-5 py-3 glacier-card rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{data.length} Leads Actifs</span>
            </div>
            <button className="p-4 glacier-card rounded-2xl text-slate-400 hover:text-accent border-white/10 active:scale-90 transition-all">
                <Filter className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Leads Data Grid */}
      <div className="glacier-card rounded-[3rem] overflow-hidden border-white/20 shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase">
              <tr>
                <th className="px-8 py-7">Identité Lead</th>
                <th className="px-8 py-7">Localisation Cible</th>
                <th className="px-8 py-7">Critères & Budget</th>
                <th className="px-8 py-7">Statut Bot</th>
                <th className="px-8 py-7 text-right">Date d'Entrée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-700 dark:text-slate-300">
              <AnimatePresence mode="popLayout">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-6 opacity-20 grayscale"
                      >
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <Mail className="w-10 h-10 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-2xl font-black uppercase tracking-tighter italic">AUCUN PROSPECT DÉTECTÉ</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">En attente de nouvelles extractions WhatsApp</span>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-accent/5 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black shadow-lg border border-white/20">
                            {(row.name || row.full_name)?.charAt(0) || <Zap className="w-5 h-5" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{row.name || row.full_name || 'Prospect Anonyme'}</span>
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3 text-accent" /> {row.phone || row.phone_number}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-rose-500" /> {row.City || 'Maroc'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {row.sector || row.Nighberd || 'Secteur Non Défini'}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-black text-[9px] uppercase tracking-widest border border-primary/20 w-fit">
                            {row.Type || 'Type Inconnu'}
                          </span>
                          {row.budget && (
                            <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">
                                {row.budget} MAD
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <button 
                            onClick={() => onToggleBot?.((row.phone || row.phone_number || ''), !row.is_ai_paused)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
                                !row.is_ai_paused 
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                : 'bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                            }`}
                        >
                            {!row.is_ai_paused ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">IA ACTIVE</span>
                                    <Pause className="w-3 h-3" />
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">MANUEL</span>
                                    <Play className="w-3 h-3" />
                                </>
                            )}
                        </button>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                            {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-4 opacity-50">
        <div className="h-px w-20 bg-gradient-to-r from-transparent to-slate-300 dark:to-white/10" />
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACCRÉDITATION ADMINISTRATIVE AQARBOT
        </span>
        <div className="h-px w-20 bg-gradient-to-l from-transparent to-slate-300 dark:to-white/10" />
      </div>
    </div>
  );
}
