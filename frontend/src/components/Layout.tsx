import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Sun, Moon, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import MiniGlobe from './MiniGlobe';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/properties', icon: Building },
    { name: 'AI Configuration', path: '/settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-full flex font-sans overflow-hidden">
      {/* Sidebar - Deep Glassmorphism */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-[280px] bg-primary dark:bg-[#030712]/90 backdrop-blur-2xl text-white flex flex-col shadow-2xl z-20 border-r border-white/5 dark:border-tertiary/20"
      >
        <div className="p-6 flex items-center justify-center border-b border-white/10 dark:border-white/5 relative group cursor-pointer">
          {/* Logo Typography matching the brand */}
          <div className="flex items-center gap-1.5 font-sans relative z-10 transition-transform duration-300 group-hover:scale-105">
            <span className="text-3xl font-extrabold text-white tracking-wider dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">AQAR</span>
            <div className="flex flex-col">
              <span className="text-3xl font-medium text-white tracking-tight">Bot</span>
              <div className="h-1.5 w-full bg-tertiary mt-0.5 rounded-full dark:shadow-[0_0_10px_#21A041]"></div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-3">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all overflow-hidden group ${
                    isActive 
                      ? 'bg-white/10 dark:bg-tertiary/10 text-white font-medium border border-white/10 dark:border-tertiary/30' 
                      : 'text-slate-300 dark:text-slate-400 hover:bg-white/5 dark:hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white dark:bg-tertiary shadow-[0_0_10px_#21A041]"
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'dark:text-tertiary' : ''}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 dark:border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-300 dark:text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {/* Glass Header */}
        <header className="h-[72px] glass-header flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <motion.h2 
              key={location.pathname}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {navItems.find(i => i.path === location.pathname)?.name || 'Admin Panel'}
            </motion.h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="h-10 w-10 relative">
              <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <MiniGlobe />
              </Canvas>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-110 hover:shadow-lg"
              aria-label="Toggle theme"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.5 }}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
