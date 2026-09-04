import { useState, useEffect } from 'react';
import { Database, Zap, Activity, Users, Home } from 'lucide-react';
import LeadsTable from '../components/LeadsTable';
import CRMDataTable from '../components/CRMDataTable';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleAIPause, deleteProperty, ingestCSV } from '../services/api';
import { supabase } from '../lib/supabase';

type CRMTab = 'leads' | 'inventory';

export default function CRM() {
  const [activeTab, setActiveTab] = useState<CRMTab>('leads');
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [leadsRes, propsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('morocco_properties').select('*').limit(100)
      ]);
      
      setLeads(leadsRes.data || []);
      setProperties(propsRes.data || []);
      
    } catch (err) {
      console.error(`❌ [CRM Sync Failure]:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleBot = async (phone: string, status: boolean) => {
    try {
      await toggleAIPause(phone, status);
      await fetchData();
    } catch (err) {
      console.error("Failed to toggle bot status", err);
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      setIsLoading(true);
      await ingestCSV(file);
      await fetchData();
    } catch (err) {
      alert("Error: " + (err as any).message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* CRM Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 glacier-card rounded-[2rem] flex items-center justify-center shadow-primary/20 border-primary/30 relative">
            <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-[2rem]" />
            <Database className="w-8 h-8 text-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">CRM & Gestion d'Actifs</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-500" /> Synchronisation Cloud Live
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-1.5 bg-slate-100 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 flex">
            {[
                { id: 'leads', label: 'Gestion Leads', icon: Users },
                { id: 'inventory', label: 'Inventaire Actifs', icon: Home }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as CRMTab)}
                    className={`relative flex items-center gap-3 px-8 py-3.5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
                        activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-400'
                    }`}
                >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="crmActiveTab"
                            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl z-[-1] border border-white/20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Main CRM Workspace */}
      <div className="px-4">
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'leads' ? (
                    isLoading && leads.length === 0 ? (
                        <div className="space-y-6 py-10">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-24 w-full glacier-card animate-pulse rounded-[2.5rem] border-white/5" />
                            ))}
                        </div>
                    ) : (
                        <LeadsTable 
                            data={leads} 
                            onToggleBot={handleToggleBot}
                        />
                    )
                ) : (
                    <CRMDataTable 
                        data={properties} 
                        onDelete={async (id) => { await deleteProperty(id); fetchData(); }}
                        onBulkUpload={handleBulkUpload}
                    />
                )}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Synchronicity Footer */}
      <div className="fixed bottom-10 right-10 z-50">
          <div className="glacier-card px-8 py-4 rounded-2xl flex items-center gap-4 bg-primary text-slate-950 border-primary/20 shadow-2xl animate-float">
              <Zap className="w-5 h-5 fill-current" />
              <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">Serveur Supabase Connecté</span>
                  <span className="text-[8px] font-bold opacity-60 uppercase">Flux Temps Réel Opérationnel</span>
              </div>
          </div>
      </div>
    </div>
  );
}
