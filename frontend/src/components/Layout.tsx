import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Sun, Moon, Users, MessageCircle, Building2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, isLoadingProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  
  // Collapse State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Tableau de Bord', path: '/dashboard', icon: LayoutDashboard },
    { name: 'CRM & Catalogue', path: '/crm', icon: Users },
    { name: 'Hub en Direct', path: '/chat', icon: MessageCircle },
    { name: 'Configuration IA', path: '/settings', icon: Settings },
    { name: 'Abonnement', path: '/pricing', icon: Star },
  ];

  const handleSimulateLead = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      await supabase.from('leads').insert({
        full_name: 'Client Test',
        phone_number: '+212600000001',
        budget: '500,000 DH',
        status: 'Nouveau',
        city: 'Casablanca',
        City: 'Casablanca',
        Nighberd: 'Maarif',
        Type: 'Appartement',
        is_ai_paused: false,
        agency_id: userData.user.id
      });
      
      window.location.reload();
    } catch (e) {
      console.error('Simulation Failed:', e);
    }
  };

  return (
    <div className="h-screen w-full flex font-sans overflow-hidden transition-colors duration-700 bg-transparent">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside 
        className={`hidden md:flex ${isSidebarOpen ? 'w-[260px]' : 'w-[90px]'} bg-[#0d1624] m-5 rounded-[2.5rem] flex-col z-20 shadow-2xl border-slate-800 border transition-all duration-300 relative`}
      >
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 rounded-full p-1.5 shadow-lg z-30 transition-all hover:scale-110 active:scale-95"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Logo / Agency Branding */}
        <div className={`p-8 pb-6 flex flex-col items-center gap-3 relative transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-100 px-2'}`}>
          <Link to="/dashboard" className="transition-all hover:scale-110 active:scale-95 group flex justify-center">
            <img
              src="/logo-icon.png"
              alt="AqarBot Logo"
              className={`drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all logo-adaptive ${
                isSidebarOpen ? 'h-14 w-auto object-contain' : 'h-10 w-10 object-contain rounded-lg'
              }`}
            />
          </Link>

          {/* Agency Name Badge */}
          {isSidebarOpen && (
            <div className="overflow-hidden w-full flex justify-center transition-all duration-300">
              {isLoadingProfile ? (
                <div className="h-6 w-32 rounded-xl bg-white/5 animate-pulse" />
              ) : profile?.agency_name ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 whitespace-nowrap">
                  <Building2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 truncate max-w-[140px]">
                    {profile.agency_name}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 py-4 rounded-3xl transition-all duration-500 group relative overflow-hidden ${isSidebarOpen ? 'px-5' : 'justify-center px-0'} ${
                  isActive
                    ? 'bg-primary text-[#0B1120] shadow-[0_0_20px_rgba(110,231,183,0.3)]'
                    : 'text-slate-500 hover:bg-slate-800/30'
                }`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-[#0B1120]' : 'text-slate-400 group-hover:text-primary'}`} />
                
                {isSidebarOpen && (
                  <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    {item.name}
                  </span>
                )}
                
                {isActive && (
                  <motion.div
                    layoutId="active-glacier"
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className={`p-6 border-t border-white/10 dark:border-slate-800 transition-all ${isSidebarOpen ? '' : 'px-2'}`}>
          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? "Déconnexion" : undefined}
            className={`flex items-center gap-3 py-4 w-full rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-[0.2em] ${isSidebarOpen ? 'px-6' : 'justify-center px-0'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative transition-all duration-300 pb-24 md:pb-0">
        <header className="h-24 flex items-center justify-between px-4 md:px-12 z-10 sticky top-0">
          <div className="flex flex-col max-w-[200px] md:max-w-none">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1 truncate">
              {navItems.find((i) => i.path === location.pathname)?.name || "Console d'Administration"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Opérationnel / Synchro Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-8">
            <button
              onClick={handleSimulateLead}
              className="px-3 md:px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[9px] md:text-[10px] uppercase font-black tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 whitespace-nowrap"
              title="Simuler un Lead Test"
            >
              Simuler Test
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 md:p-3 rounded-2xl glacier-card text-slate-400 hover:text-primary transition-all active:scale-90 shrink-0"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Dynamic Auth Label */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authentifié en tant que</span>
              {isLoadingProfile ? (
                <div className="h-4 w-36 rounded-lg bg-white/5 animate-pulse" />
              ) : (
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {profile?.full_name
                    ? `${profile.full_name} | Founder Key`
                    : 'Admin Partner | Founder Key'}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-4 md:px-12 pb-6 custom-scrollbar scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0d1624]/90 backdrop-blur-xl border-t border-slate-800 z-50 px-4 py-3 pb-safe flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center p-2 relative group flex-1"
            >
              <div 
                className={`flex items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-[#0B1120] shadow-[0_0_15px_rgba(110,231,183,0.4)] -translate-y-2' 
                    : 'text-slate-400 group-hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110'}`} />
              </div>
              <span className={`text-[9px] font-black tracking-wider uppercase mt-1 absolute -bottom-1 transition-all ${
                isActive ? 'text-primary opacity-100 translate-y-1' : 'text-slate-500 opacity-0'
              }`}>
                {item.name.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
