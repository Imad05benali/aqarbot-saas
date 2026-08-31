import { useState, useEffect } from 'react';
import { Users, MessageCircle, Flame, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getForecastData } from '../services/api';
import EmptyStateComponent from '../components/EmptyStateComponent';
import { supabase } from '../lib/supabase';
import { useProfile } from '../context/ProfileContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jan', requetes: 40, qualification: 24 },
  { month: 'Fév', requetes: 30, qualification: 13 },
  { month: 'Mar', requetes: 60, qualification: 48 },
  { month: 'Avr', requetes: 50, qualification: 39 },
  { month: 'Mai', requetes: 95, qualification: 68 },
  { month: 'Jun', requetes: 110, qualification: 90 },
];

export default function Dashboard() {
  const { profile } = useProfile();
  const [stats, setStats] = useState({ total_leads: 0, hot_leads: 0, ai_conversations: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [forecast, setForecast] = useState({ percentage: 24.5, sector: 'Al-Maarif', trend: 'uptick' });
  const [isForecastLoading, setIsForecastLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Fetch strict isolated tenant stats
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', user.id);
          
        const { count: manualInteractions } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', user.id)
          .eq('is_ai_paused', true);

        const { count: aiMessageCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', user.id)
          .eq('sender', 'ai');

        setStats({
          total_leads: totalLeads || 0,
          hot_leads: Math.max(0, (totalLeads || 0) - (manualInteractions || 0)), // Leads NOT paused
          ai_conversations: aiMessageCount || 0 // Accurate real-world messaging output
        });
        
        // Ensure recent leads are strictly filtered as well
        const { data: filteredLeads } = await supabase
          .from('leads')
          .select('*')
          .eq('agency_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        setLeads(filteredLeads || []);
        
      } catch (err) {
        console.error("Dashboard multi-tenancy sync error", err);
      } finally {
        setIsLoading(false);
      }
    };

    const loadForecast = async () => {
      try {
        const data = await getForecastData();
        setForecast(data);
      } finally {
        setIsForecastLoading(false);
      }
    };

    loadSessionData();
    loadForecast();
  }, []);

  const kpis = [
    { label: 'Total Clients / Leads', value: stats.total_leads, icon: Users, color: 'from-blue-500 to-cyan-400' },
    { label: 'Active AI Chats', value: stats.hot_leads, icon: Flame, color: 'from-rose-500 to-amber-400' },
    { label: 'Total Bot Messages', value: stats.ai_conversations, icon: MessageCircle, color: 'from-emerald-500 to-teal-400' },
  ];

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
        <div className="h-16 w-16 relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <Activity className="w-full h-full text-primary animate-spin" />
        </div>
        <span className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-400">Synchronisation des Cœurs Arctiques</span>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Dynamic Profile Greeting */}
      <div className="flex flex-col gap-1 px-4">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
          Bienvenue, <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">{profile?.full_name?.split(' ')[0] || 'Partenaire'}</span> 👋
        </h1>
        <p className="text-slate-500 font-medium tracking-wide">
          Voici un aperçu en temps réel des performances de l'agence <span className="text-emerald-500 font-bold">{profile?.agency_name || 'Vôtre Agence'}</span>.
        </p>
      </div>

      {/* Arctic KPI Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kpis.map((kpi, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
            key={kpi.label} 
            className="glacier-card p-10 rounded-[3rem] group cursor-pointer"
          >
            <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-all duration-700`} />
            
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{kpi.label}</span>
                <h3 className="text-6xl font-black tracking-tighter drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">
                    {kpi.value}
                </h3>
              </div>
              <div className={`p-4 rounded-3xl bg-gradient-to-br ${kpi.color} text-white shadow-xl`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Temps Réel</span>
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Massive Performance Graph Area */}
      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glacier-card p-10 rounded-[3rem] w-full"
      >
          <div className="flex flex-col mb-8">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic text-slate-800 dark:text-white">Croissance & Acquisition</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Conversions vs Requêtes (6 derniers mois)</span>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequetes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQualif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '16px', border: 'none', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="requetes" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRequetes)" />
                <Area type="monotone" dataKey="qualification" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorQualif)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </motion.div>

      {/* Analytics Visualization Space */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 glacier-card p-10 rounded-[3rem]"
        >
          <div className="flex flex-col mb-10">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic">Market Insights</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regional Density</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { city: 'Casablanca', rate: 72, color: 'bg-accent' },
              { city: 'Marrakech', rate: 48, color: 'bg-emerald-500' },
              { city: 'Rabat', rate: 35, color: 'bg-teal-500' },
              { city: 'Tanger', rate: 22, color: 'bg-blue-400' },
            ].map(item => (
              <div key={item.city} className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-slate-600 dark:text-slate-400">{item.city}</span>
                  <span className="text-slate-900 dark:text-white">{item.rate}%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.rate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${item.color} rounded-full relative shadow-[0_0_10px_rgba(255,255,255,0.2)]`} 
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 glacier-card p-10 rounded-[3rem] overflow-hidden flex flex-col justify-center items-center relative"
        >
            <div className="absolute inset-0 bg-dot-grid opacity-10" />
            <BarChart3 className="w-24 h-24 text-accent/10 mb-6 animate-float" />
            <h4 className="text-xl font-black uppercase tracking-tight mb-2">Prédiction Neurale</h4>
            {isForecastLoading ? (
                <div className="space-y-2 flex flex-col items-center">
                    <div className="h-4 w-48 bg-slate-200 dark:bg-white/5 animate-pulse rounded-full" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 animate-pulse rounded-full" />
                </div>
            ) : (
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[240px] text-center">
                    L'analyse système prédit une <span className="text-primary font-black">hausse de {forecast.percentage}%</span> des demandes premium pour le secteur <span className="text-accent uppercase font-black tracking-tighter">{forecast.sector}</span> au cours du prochain cycle fiscal.
                </p>
            )}
            <button 
                onClick={() => setShowForecast(true)}
                className="mt-10 btn-glacier text-xs tracking-widest flex items-center gap-2 active:scale-95 transition-all"
            >
                Lancer la Prévision <Activity className="w-4 h-4" />
            </button>
        </motion.div>
      </div>

      {/* Recent Leads Feed on Dashboard */}
      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glacier-card p-10 rounded-[3rem]"
      >
        <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">Clients & Activité Récente</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Données extraites en direct du CRM</span>
            </div>
            <Users className="w-8 h-8 text-primary/20" />
        </div>

        {(!leads || leads.length === 0) ? (
          <EmptyStateComponent type="leads" />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leads.slice(0, 4).map((lead: any, i: number) => (
                <div key={lead.id || i} className="glacier-card p-6 rounded-3xl border-white/10 hover:border-primary/40 transition-all group overflow-hidden">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-black text-primary">
                            {lead.full_name?.charAt(0) || lead.name?.charAt(0) || 'P'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-black truncate">{lead.full_name || lead.name || 'Prospect Anonyme'}</span>
                            <span className="text-[10px] font-bold text-slate-500">{lead.phone_number || lead.phone || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black uppercase text-accent">{lead.City || 'Maroc'}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${lead.status === 'NEW' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                </div>
            ))}
        </div>
        )}
      </motion.div>

      {/* Forecast Intelligence Overlay */}
      <AnimatePresence>
        {showForecast && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="w-full max-w-4xl glacier-card p-12 rounded-[4rem] relative shadow-[0_0_100px_rgba(59,130,246,0.15)] border-white/20"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10B981]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Sync Neurale Active</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Vecteur de Croissance {forecast.sector}</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Prévisions Immobilières Macro-économique 2026</p>
                </div>
                <button 
                  onClick={() => setShowForecast(false)}
                  className="w-12 h-12 glacier-card rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                >
                    &times;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { label: 'Projection des Prix', val: '+18.2%', desc: 'Appréciation estimée des unités de luxe', trend: 'up' },
                  { label: 'Vélocité des Leads', val: '4.2x', desc: 'Augmentation prévue de la fréquence des interactions', trend: 'up' },
                  { label: 'Chaleur du Marché', val: '92/100', desc: 'Score composite de fiabilité d\'investissement', trend: 'steady' }
                ].map(item => (
                    <div key={item.label} className="glacier-card p-8 rounded-3xl border-white/10 bg-white/5 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-4">{item.label}</span>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{item.val}</div>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                    </div>
                ))}
              </div>

              <div className="mt-12 p-8 glacier-card rounded-[2.5rem] bg-gradient-to-r from-accent/10 via-primary/5 to-transparent border-white/10">
                <div className="flex items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '88%' }}
                                transition={{ duration: 2, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-accent to-emerald-500 rounded-full"
                             />
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                             <span>Traitement des Synapses</span>
                             <span className="text-accent">Confiance Critique: 94.6%</span>
                        </div>
                    </div>
                    <button className="btn-glacier active:scale-95 uppercase font-black text-[10px] tracking-widest">DÉPLOYER LE CAPITAL</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
