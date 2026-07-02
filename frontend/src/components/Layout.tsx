import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Sun, Moon, Users, MessageCircle, Building2 } from 'lucide-react';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Tableau de Bord', path: '/dashboard', icon: LayoutDashboard },
    { name: 'CRM & Catalogue', path: '/crm', icon: Users },
    { name: 'Hub en Direct', path: '/chat', icon: MessageCircle },
    { name: 'Configuration IA', path: '/settings', icon: Settings },
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
      
      // Enforce complete data refreshing
      window.location.reload();
    } catch (e) {
      console.error('Simulation Failed:', e);
    }
  };

  return (
    <div className="h-screen w-full flex font-sans overflow-hidden transition-colors duration-700">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-72 glacier-card m-4 rounded-[2.5rem] flex flex-col z-20 shadow-2xl border-white/20 dark:border-white/5">
        {/* Logo / Agency Branding */}
        <div className="p-8 pb-6 flex flex-col items-center gap-3 relative">
          <Link to="/dashboard" className="transition-all hover:scale-110 active:scale-95 group">
            {profile?.agency_logo ? (
              <img
                src={profile.agency_logo}
                alt={`${profile?.agency_name ?? 'Agency'} Logo`}
                className="h-12 w-auto object-contain rounded-xl drop-shadow-lg group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all logo-adaptive"
              />
            ) : (
              <img
                src="/logo.png"
                alt="AqarBot Logo"
                className="h-12 w-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all logo-adaptive"
              />
            )}
          </Link>

          {/* Agency Name Badge — skeleton while loading */}
          {isLoadingProfile ? (
            <div className="h-6 w-32 rounded-xl bg-white/5 animate-pulse" />
          ) : profile?.agency_name ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Building2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 truncate max-w-[140px]">
                {profile.agency_name}
              </span>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-3xl transition-all duration-500 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-br from-accent/80 to-primary/80 text-white shadow-xl shadow-accent/20'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                <span className={`text-sm font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{item.name}</span>
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

        <div className="p-6 border-t border-white/10 dark:border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 w-full rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-24 flex items-center justify-between px-12 z-10 sticky top-0">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
              {navItems.find((i) => i.path === location.pathname)?.name || "Console d'Administration"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Opérationnel / Synchro Live</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={handleSimulateLead}
              className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
              title="Simuler un Lead Test"
            >
              Simuler Test
            </button>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl glacier-card text-slate-400 hover:text-primary transition-all active:scale-90"
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

        <div className="flex-1 overflow-auto px-12 pb-12 custom-scrollbar scroll-smooth">
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
    </div>
  );
}
