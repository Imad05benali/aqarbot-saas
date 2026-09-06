import { useState, useEffect } from 'react';
import { Database, Zap, Activity, Users, Home } from 'lucide-react';
import LeadsTable from '../components/LeadsTable';
import CRMDataTable from '../components/CRMDataTable';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleAIPause, deleteProperty, ingestCSV } from '../services/api';
import { supabase } from '../lib/supabase';

type Tab = 'leads' | 'inventory';

export default function CRM() {
  const [tab, setTab] = useState<Tab>('leads');
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [l, p] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('morocco_properties').select('*').limit(100),
      ]);
      setLeads(l.data || []);
      setProperties(p.data || []);
    } catch (e) {
      console.error('CRM sync failure', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleBot = async (phone: string, status: boolean) => {
    try { await toggleAIPause(phone, status); await fetchData(); } catch (e) { console.error('Toggle failed', e); }
  };

  const bulkUpload = async (file: File) => {
    try { setLoading(true); await ingestCSV(file); await fetchData(); } catch (e) { alert('Error: ' + (e as any).message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="card-glass w-13 h-13 rounded-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-2xl" />
              <Database className="w-6 h-6 text-emerald-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">CRM &amp; Gestion d&apos;Actifs</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                <Activity className="w-3 h-3 text-emerald-400" /> Synchronisation Cloud Live
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/40">
            {[
              { id: 'leads', label: 'Gestion Leads', icon: Users },
              { id: 'inventory', label: 'Inventaire Actifs', icon: Home },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`relative flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${tab === t.id ? 'text-white shadow-lg shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? 'text-emerald-400' : 'text-slate-600'}`} />
                {t.label}
                {tab === t.id && (
                  <motion.div layoutId="crmTab" className="absolute inset-0 bg-emerald-500/10 rounded-xl shadow-xl z-[-1] border border-emerald-500/20" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="px-1">
            {tab === 'leads' ? (
              loading && leads.length === 0 ? (
                <div className="space-y-3 py-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 card-glass animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : (
                <LeadsTable data={leads} onToggleBot={toggleBot} />
              )
            ) : (
              <CRMDataTable data={properties} onDelete={async (id) => { await deleteProperty(id); fetchData(); }} onBulkUpload={bulkUpload} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Live status badge */}
      <div className="fixed bottom-4 right-4 card-glass px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-lg animate-float">
        <div className="dot-live" />
        <Zap className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Serveur Connecté</span>
      </div>
    </div>
  );
}
