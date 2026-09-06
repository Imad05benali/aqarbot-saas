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
    <div className="space-y-8 pb-20">
      {/* CRM Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 card-modern rounded-2xl flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-2xl" />
            <Database className="w-7 h-7 text-emerald-400 relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase text-white">CRM &amp; Gestion d&apos;Actifs</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                <Activity className="w-3 h-3 text-emerald-400" /> Synchronisation Cloud Live
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 flex">
            {[
                { id: 'leads', label: 'Gestion Leads', icon: Users },
                { id: 'inventory', label: 'Inventaire Actifs', icon: Home }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as CRMTab)}
                    className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
                        activeTab === tab.id 
                            ? 'text-white'
                            : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-600'}`} />
                    {tab.label}
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="crmActiveTab"
                            className="absolute inset-0 bg-emerald-500/10 rounded-2xl shadow-xl z-[-1] border border-emerald-500/20"
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
                                <div key={i} className="h-24 w-full card-modern animate-pulse rounded-2xl" />
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
      <div className="fixed bottom-6 right-6 z-50">
          <div className="card-modern px-5 py-3 rounded-xl flex items-center gap-3 shadow-xl animate-float">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34D399]" />
              <Zap className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Serveur Connecté</span>
                  <span className="text-[8px] font-bold text-slate-500 opacity-60 uppercase">Flux Live Opérationnel</span>
              </div>
          </div>
      </div>
    </div>
  );
}
