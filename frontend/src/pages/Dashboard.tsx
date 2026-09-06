import { useState, useEffect } from 'react';
import { Users, MessageCircle, Flame, Activity, Zap, ArrowUpRight, TrendingUp, MapPin, Clock } from 'lucide-react';
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

const MONTH_SHORT = ['Janv', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];

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
          ai_conversations: aiMessageCount || 0,
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
          agency: profile?.agency_name || 'Vôtre Agence',
        });
      } catch (err) {
        console.error('Dashboard multi-tenancy sync error', err);
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
    { label: 'Total Clients', sublabel: 'Tous leads inscrits', value: stats.total_leads, icon: Users, gradient: 'from-emerald-500 to-emerald-400' },
    { label: 'Conversations IA', sublabel: 'Sessions actives', value: stats.hot_leads, icon: Flame, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Messages Bot', sublabel: 'Échanges automatisés', value: stats.ai_conversations, icon: MessageCircle, gradient: 'from-teal-500 to-cyan-500' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 blur-3xl rounded-full animate-pulse" />
          <Activity className="w-14 h-14 text-purple-400 animate-spin relative z-10" />
        </div>
        <span className="font-black text-[10px] uppercase tracking-[0.4em] text-purple-400/60">
          Chargement du Tableau de Bord
        </span>
      </div>
    );
  }

  return (      <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-12">
      {/* Top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-2">
                <div className="status-live" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  Connecté ·
                  <span className="text-emerald-400 ml-1">Live</span>
                </span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Bonjour,{' '}
              <span className="text-brand">
                {displayInfo.name.split(' ')[0]}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Vue d&apos;ensemble de{' '}
              <span className="text-emerald-400 font-bold">{displayInfo.agency}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-medium">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (i + 1), duration: 0.4 }}
              className="card-modern group rounded-xl p-5"
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-5 right-5 h-[2px] rounded-full bg-gradient-to-r ${kpi.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {kpi.label}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{kpi.sublabel}</p>
                  <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                    {kpi.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${kpi.gradient} shadow-lg flex items-center justify-center`}>
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  +12.4%
                </span>
                <span className="text-[10px] text-slate-600 ml-1">vs mois dernier</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
          {/* Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="lg:col-span-2 bg-[#0d1624]/60 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Croissance &amp; Acquisition</h3>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                  Requêtes vs Qualifications · 6 mois
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-slate-400 font-medium">Requêtes</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-400 font-medium">Qualifications</span>
                </span>
              </div>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="chartQual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#334155"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => MONTH_SHORT[['Jan','Fév','Mar','Avr','Mai','Jun'].indexOf(v)] || v}
                  />
                  <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(110,231,183,0.3)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '11px',
                      fontWeight: '500',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requetes"
                    stroke="#818CF8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartReq)"
                  />
                  <Area
                    type="monotone"
                    dataKey="qualification"
                    stroke="#34D399"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartQual)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Forecast Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-[#0d1624]/60 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 md:p-6 flex flex-col"
          >              <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Prédiction Neurale</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {isForecastLoading ? (
                <div className="space-y-3">
                  <div className="h-3 bg-slate-800 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-slate-800 rounded-full w-3/4 animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    L&apos;analyse prédit une{' '}
                    <span className="text-emerald-400 font-bold">hausse de {forecast.percentage}%</span>{' '}
                    des demandes premium pour le secteur{' '}
                    <span className="text-teal-400 font-bold uppercase tracking-tight">
                      {forecast.sector}
                    </span>
                    .
                  </p>

                  {/* Mini stat blocks */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Prix', val: '+18.2%', color: 'text-emerald-400' },
                      { label: 'Vélocité', val: '4.2x', color: 'text-teal-400' },
                      { label: 'Chaleur', val: '92/100', color: 'text-amber-400' },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-3 rounded-lg bg-slate-800/40 border border-slate-800/60">
                        <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowForecast(true)}
              className="btn-brand mt-5 w-full text-xs"
            >
              Lancer la Prévision
            </button>
          </motion.div>
        </div>

        {/* Bottom Row: Market Insights + Recent Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {/* Market Insights */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-[#0d1624]/60 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 md:p-6"
          >              <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Densité Régionale</h3>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider ml-auto">Maroc</span>
            </div>

            <div className="space-y-4">
              {[
                { city: 'Casablanca', rate: 72, color: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
                { city: 'Marrakech', rate: 48, color: 'bg-gradient-to-r from-teal-500 to-teal-400' },
                { city: 'Rabat', rate: 35, color: 'bg-gradient-to-r from-emerald-400 to-emerald-500' },
                { city: 'Tanger', rate: 22, color: 'bg-gradient-to-r from-amber-500 to-amber-400' },
              ].map((item) => (
                <div key={item.city}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-300">{item.city}</span>
                    <span className="font-bold text-white">{item.rate}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.rate}%` }}
                      transition={{ duration: 1.4, ease: 'easeOut' }}
                      className={`h-full ${item.color} rounded-full relative`}
                    >
                      <div className="absolute inset-0 bg-white/10 animate-shimmer" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Leads */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="bg-[#0d1624]/60 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Activité Récente</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">CRM Live</span>
            </div>

            {leads.length === 0 ? (
              <EmptyStateComponent type="leads" />
            ) : (
              <div className="divide-y divide-slate-800/60">
                {leads.slice(0, 5).map((lead: any, i: number) => (
                  <div
                    key={lead.id || i}
                    className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                      {lead.full_name?.charAt(0) || lead.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {lead.full_name || lead.name || 'Prospect'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {lead.phone_number || lead.phone || '—'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        {lead.City || 'Maroc'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            lead.status === 'NEW' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-[9px] font-bold uppercase text-slate-600">
                          {lead.status || 'Actif'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Forecast Modal */}
      <AnimatePresence>
        {showForecast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0d1624] border border-slate-700/60 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header bar */}
              <div className="sticky top-0 bg-[#0d1624] border-b border-slate-800/60 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="status-live" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                      Sync Active
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Vecteur de Croissance — {forecast.sector}
                  </h2>
                </div>
                <button
                  onClick={() => setShowForecast(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Three metric cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Projection des Prix', val: '+18.2%', desc: 'Unités de luxe', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Vélocité des Leads', val: '4.2x', desc: 'Fréquence interactions', icon: Activity, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                    { label: 'Chaleur du Marché', val: '92/100', desc: 'Score fiabilité', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-4 rounded-xl border ${item.bg} bg-slate-800/30`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">{item.val}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Confidence bar */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-slate-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Confiance du Modèle
                    </span>
                    <span className="text-xs font-bold text-teal-400">94.6%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '94.6%' }}
                      transition={{ duration: 1.5, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Deploy button */}
                <button className="btn-brand w-full py-3 text-xs">
                  Déployer le Capital
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
