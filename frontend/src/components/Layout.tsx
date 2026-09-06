import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Sun, Moon, Users, MessageCircle, Building2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Sparkles } from 'lucide-react';

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
      // Strict rebuilt schema: leads(id, agency_id, phone_number, full_name,
      // city, sector, status, is_ai_paused) — agency_id = profile.agency_id
      if (!profile?.agency_id) return;

      await supabase.from('leads').insert({
        full_name: 'Client Test',
        phone_number: '+212600000001',
        city: 'Casablanca',
        sector: 'Maarif',
        status: 'new',
        is_ai_paused: false,
        agency_id: profile.agency_id
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
        className={`hidden md:flex ${isSidebarOpen ? 'w-[240px]' : 'w-[72px]'} flex-col z-20 relative`}
      >
        {/* Persistent background */}
        <div className="absolute inset-0 card-glass rounded-none border-r border-slate-800/50" />

        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-emerald-400 rounded-full p-1 shadow-lg z-30 transition-all hover:scale-110 active:scale-95"
        >
          {isSidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Logo */}
        <div className={`p-6 pt-5 pb-4 flex flex-col items-center gap-2 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : ''}`}>
          <Link to="/dashboard" className="transition-all hover:scale-110 active:scale-95 flex justify-center">
            <img
              src="/logo-icon.png"
              alt="AqarBot"
              className={`transition-all logo-adaptive ${
                isSidebarOpen ? 'h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(110,231,183,0.3)]' : 'h-8 w-8 object-contain rounded-lg drop-shadow-[0_0_8px_rgba(110,231,183,0.2)]'
              }`}
            />
          </Link>
          {isSidebarOpen && (
            <div className="w-full text-center">
              {isLoadingProfile ? (
                <div className="h-5 w-28 mx-auto rounded-lg bg-slate-800/30 animate-pulse" />
              ) : profile?.agency_name ? (
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 whitespace-nowrap mx-2">
                  {profile.agency_name}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 mt-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item group flex items-center justify-center gap-3 ${isSidebarOpen ? 'px-3 py-3' : 'px-0 py-3'}`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                {/* Active indicator background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl bg-emerald-500/10 shadow-[0_0_15px_rgba(110,231,183,0.12)] border border-emerald-500/20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                {isSidebarOpen && (
                  <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? "Déconnexion" : undefined}
            className={`sidebar-nav-item group flex items-center justify-center gap-3 ${isSidebarOpen ? 'px-3 py-3' : 'px-0 py-3'} rounded-xl`}
          >
            <LogOut className={`w-4 h-4 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'text-slate-500 group-hover:text-rose-400' : 'text-slate-500 group-hover:text-rose-400'}`} />
            {isSidebarOpen && (
              <span className="text-sm font-bold tracking-tight text-slate-500 group-hover:text-rose-400 whitespace-nowrap transition-all duration-300">
                Déconnexion
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative transition-all duration-300 pb-24 md:pb-0">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 bg-[#0B1120]/70 backdrop-blur-2xl border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                {navItems.find((i) => i.path === location.pathname)?.name || "Console d'Administration"}
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <span className="dot-live" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateLead}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
              title="Simuler un Lead Test"
            >
              <span className="text-[8px]">+</span> Simuler Test
            </button>
            <button
              onClick={toggleTheme}
              className="icon-btn"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden md:flex items-center gap-2 ml-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[9px] font-black text-emerald-400">
                {(profile?.full_name || '?')[0]}
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{profile?.full_name || 'Partner'}</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider">Founder Key</span>
              </div>
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
      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0d1624]/95 backdrop-blur-2xl border-t border-slate-800/50 z-50 px-2 py-2 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center p-1.5 relative group flex-1 min-w-0"
            >
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(110,231,183,0.2)] -translate-y-1'
                    : 'text-slate-500 group-hover:text-emerald-400 group-hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[8px] font-black tracking-wider uppercase mt-0.5 transition-all ${
                isActive ? 'text-emerald-400 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'
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
