import { useState, useEffect } from 'react';
import { Users, MessageCircle, Flame, BarChart3, TrendingUp, Activity, Sparkles, Zap, ArrowUpRight } from 'lucide-react';
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
  const [displayInfo, setDisplayInfo] = useState({ name: 'Partenaire', agency: 'Vôtre Agence' });
  const [stats, setStats] = useState({ total_leads: 0, hot_leads: 0, ai_conversations: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [forecast, setForecast] = useState({ percentage: 24.5, sector: 'Al-Maarif', trend: 'uptick' });
  const [isForecastLoading, setIsForecastLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const strictAgencyId = profile?.agency_id ?? null;

        if (!strictAgencyId) {
          setDisplayInfo({
            name: profile?.full_name || 'Partenaire',
            agency: profile?.agency_name || 'Vôtre Agence',
          });
          setIsLoading(false);
          return;
        }

        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', strictAgencyId);

        const { count: manualInteractions } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', strictAgencyId)
          .eq('is_ai_paused', true);

        const { count: aiMessageCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', strictAgencyId)
          .eq('sender', 'ai');

        setStats({
          total_leads: totalLeads || 0,
          hot_leads: Math.max(0, (totalLeads || 0) - (manualInteractions || 0)),
          ai_conversations: aiMessageCount || 0
        });

        const { data: filteredLeads } = await supabase
          .from('leads')
          .select('*')
          .eq('agency_id', strictAgencyId)
          .order('created_at', { ascending: false })
          .limit(10);

        setLeads(filteredLeads || []);

        setDisplayInfo({
          name: profile?.full_name || 'Partenaire',
          agency: profile?.agency_name || 'Vôtre Agence'
        });
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
  }, [profile?.agency_id, profile?.full_name, profile?.agency_name]);

  const kpis = [
    { label: 'Total Clients / Leads', value: stats.total_leads, icon: Users, gradient: 'from-purple-500 to-violet-600', glow: 'kpi-glow-purple' },
    { label: 'Active AI Chats', value: stats.hot_leads, icon: Flame, gradient: 'from-amber-500 to-orange-500', glow: 'kpi-glow-amber' },
    { label: 'Total Bot Messages', value: stats.ai_conversations, icon: MessageCircle, gradient: 'from-cyan-500 to-blue-500', glow: 'kpi-glow-cyan' },
  ];

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-[#0B1120]">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 blur-3xl rounded-full animate-pulse" />
        <Sparkles className="w-16 h-16 text-purple-400 animate-spin relative z-10" />
      </div>
      <span className="font-black text-[10px] uppercase tracking-[0.5em] text-purple-400/70">Activation du Tableau de Bord Vivid</span>
    </div>
  );

  return (
    <div className="space-y-10 relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-600/8 blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-amber-500/5 blur-[80px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Greeting */}
      <div className="relative z-10 px-1 md:px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Tableau de Bord · Vivement Actualisé</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white">
            Bienvenue, <span className="text-vivid">{displayInfo.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-medium tracking-wide max-w-xl">
            Performance en direct de l&apos;agence <span className="text-vivid-cyan font-black">{displayInfo.agency}</span>.
          </p>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 120 }}
            className="vivid-card p-6 md:p-8 rounded-2xl md:rounded-3xl group cursor-pointer relative overflow-hidden"
          >
            <div className={`vivid-glow bg-gradient-to-br ${kpi.gradient}`} />
            <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-20 blur-[100px] transition-all duration-700`} />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">{kpi.label}</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-200 to-slate-400">
                  {kpi.value}
                </h2>
              </div>
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${kpi.gradient} text-white shadow-xl shadow-${kpi.gradient.split(' ')[1] || 'purple'}/20 flex items-center justify-center`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  Temps Réel
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-400 animate-float" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 vivid-card p-8 md:p-10 rounded-2xl md:rounded-3xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic text-white">
              Croissance &amp; Acquisition
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Requêtes vs Conversions · 6 derniers mois
            </p>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Requêtes</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Qualification</span>
          </div>
        </div>

        <div className="h-[260px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vividRequetes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="vividQualif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.3)', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ color: '#c4b5fd' }}
              />
              <Area type="monotone" dataKey="requetes" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#vividRequetes)" />
              <Area type="monotone" dataKey="qualification" stroke="#34D399" strokeWidth={2.5} fillOpacity={1} fill="url(#vividQualif)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom Row: Market Insights + Neural Forecast */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Market Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 vivid-card p-8 md:p-10 rounded-2xl md:rounded-3xl"
        >
          <div className="flex flex-col mb-8">
            <h3 className="text-xl font-black tracking-tighter uppercase italic text-white">Market Insights</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Densité Régionale</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {[
              { city: 'Casablanca', rate: 72, color: 'bg-gradient-to-r from-purple-500 to-violet-500' },
              { city: 'Marrakech', rate: 48, color: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
              { city: 'Rabat', rate: 35, color: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
              { city: 'Tanger', rate: 22, color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
            ].map(item => (
              <div key={item.city} className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-slate-400">{item.city}</span>
                  <span className="text-white font-bold">{item.rate}%</span>
                </div>
                <div className="h-3 w-full bg-slate-800/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.rate}%` }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className={`h-full ${item.color} rounded-full relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Neural Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 vivid-card p-8 md:p-10 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col justify-center items-center relative"
        >
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
            <Zap className="w-12 h-12 text-purple-400/30 mb-4" />
          </motion.div>
          <h4 className="text-lg font-black uppercase tracking-tight mb-2 text-white">Prédiction Neurale</h4>

          {isForecastLoading ? (
            <div className="space-y-2 flex flex-col items-center mt-2">
              <div className="h-3 w-48 bg-slate-800 rounded-full animate-pulse" />
              <div className="h-3 w-32 bg-slate-800 rounded-full animate-pulse" />
            </div>
          ) : (
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[220px] text-center mt-1">
              L&apos;analyse prédit une <span className="text-vivid font-black">hausse de {forecast.percentage}%</span> pour le secteur{' '}
              <span className="text-vivid-purple uppercase font-black tracking-tighter">{forecast.sector}</span>.
            </p>
          )}

          <button
            onClick={() => setShowForecast(true)}
            className="mt-8 btn-vivid text-xs tracking-widest flex items-center gap-2 active:scale-95 transition-all relative z-10"
          >
            Lancer la Prévision <Activity className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Recent Leads */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative z-10 vivid-card p-8 md:p-10 rounded-2xl md:rounded-3xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black tracking-tighter uppercase italic text-white">Clients &amp; Activité Récente</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Données CRM en direct</p>
          </div>
          <Users className="w-6 h-6 text-purple-400/40" />
        </div>

        {(!leads || leads.length === 0) ? (
          <EmptyStateComponent type="leads" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leads.slice(0, 4).map((lead: any, i: number) => (
              <div key={lead.id || i} className="vivid-card p-5 rounded-xl group overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-black text-purple-300">
                    {lead.full_name?.charAt(0) || lead.name?.charAt(0) || 'P'}
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <span className="text-sm font-black truncate text-white">{lead.full_name || lead.name || 'Prospect'}</span>
                    <span className="text-[10px] font-bold text-slate-500 truncate">{lead.phone_number || lead.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[9px] font-black uppercase text-cyan-400">{lead.City || 'Maroc'}</span>
                  <div className={`w-2 h-2 rounded-full ${lead.status === 'NEW' ? 'bg-rose-500 animate-pulse shadow-[0_0_6px_#F43F5E]' : 'bg-emerald-400'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Forecast Modal */}
      <AnimatePresence>
        {showForecast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0B1120]/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 40 }}
              className="w-full max-w-4xl vivid-card p-10 md:p-14 rounded-3xl relative shadow-[0_0_80px_rgba(139,92,246,0.15)] border border-white/10"
            >
              {/* Gradient top line */}
              <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 rounded-full" />

              <div className="flex justify-between items-start mb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">Sync Neurale Active</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                    Vecteur de Croissance {forecast.sector}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prévisions 2026</p>
                </div>
                <button
                  onClick={() => setShowForecast(false)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Projection des Prix', val: '+18.2%', desc: 'Appréciation estimée du luxe', trend: 'up' },
                  { label: 'Vélocité des Leads', val: '4.2x', desc: 'Fréquence d&apos;interactions', trend: 'up' },
                  { label: 'Chaleur du Marché', val: '92/100', desc: 'Score de fiabilité', trend: 'steady' },
                ].map(item => (
                  <div key={item.label} className="vivid-card p-7 rounded-2xl border border-white/5 bg-white/[0.03] relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-3 relative z-10">{item.label}</span>
                    <div className="text-2xl font-black text-white mb-1 relative z-10">{item.val}</div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed relative z-10">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-8 vivid-card rounded-2xl bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-transparent border border-white/5">
                <div className="flex items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Traitement des Synapses</span>
                      <span className="text-cyan-400">Confiance: 94.6%</span>
                    </div>
                  </div>
                  <button className="btn-vivid-cyan active:scale-95 uppercase font-black text-[10px] tracking-widest relative z-10">
                    DÉPLOYER
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
