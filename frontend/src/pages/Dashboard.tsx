import { useState, useEffect } from 'react';
import { Flame, Snowflake, Activity } from 'lucide-react';
import { getDashboardData } from '../services/api';
import { motion } from 'framer-motion';

type Lead = {
  id: number;
  name: string;
  phone: string;
  budget: string;
  sector: string;
  score: string;
};

type Stats = {
  total_leads: number;
  hot_leads: number;
  ai_conversations: number;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_leads: 0,
    hot_leads: 0,
    ai_conversations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setStats(data.stats);
        setLeads(data.recent_leads);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-tertiary animate-pulse-slow" />
          <p className="text-primary dark:text-tertiary font-mono tracking-widest text-lg neon-text">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500 text-lg font-mono drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-[1440px] mx-auto"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors duration-500"></div>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">Total Leads</h3>
          <p className="text-4xl font-mono font-bold text-slate-900 dark:text-white drop-shadow-md">{stats.total_leads}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-500/20 transition-colors duration-500"></div>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">Hot Prospects (Chaud)</h3>
          <p className="text-4xl font-mono font-bold text-status-hot drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">{stats.hot_leads}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 dark:bg-tertiary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-tertiary/30 transition-colors duration-500"></div>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-2">AI Conversations</h3>
          <p className="text-4xl font-mono font-bold text-primary dark:text-tertiary drop-shadow-[0_0_8px_rgba(33,160,65,0.4)]">{stats.ai_conversations}</p>
        </motion.div>
      </div>

      {/* Leads Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden neon-border relative">
        <div className="p-6 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Qualified Leads</h3>
          <div className="flex items-center gap-2 text-xs font-mono text-tertiary">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse-slow shadow-[0_0_8px_#21A041]"></span>
            LIVE
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-black/20 text-slate-500 dark:text-slate-400 text-xs font-mono">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">NAME</th>
                <th className="px-6 py-4 font-semibold tracking-wider">PHONE</th>
                <th className="px-6 py-4 font-semibold tracking-wider">SECTOR</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">BUDGET</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">INTEREST SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-mono text-sm">
                    NO LEADS FOUND IN DATABASE
                  </td>
                </tr>
              ) : (
                leads.map((lead, i) => (
                  <motion.tr 
                    key={lead.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-tertiary transition-colors">{lead.name}</td>
                    <td className="px-6 py-4 font-mono text-sm">{lead.phone}</td>
                    <td className="px-6 py-4">{lead.sector}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white text-right">{lead.budget}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                        lead.score === 'Chaud' 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                          : 'bg-primary/10 dark:bg-tertiary/10 text-primary dark:text-tertiary border border-primary/20 dark:border-tertiary/30 dark:shadow-[0_0_10px_rgba(33,160,65,0.2)]'
                      }`}>
                        {lead.score === 'Chaud' ? <Flame className="w-3.5 h-3.5" /> : <Snowflake className="w-3.5 h-3.5" />}
                        {lead.score.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
