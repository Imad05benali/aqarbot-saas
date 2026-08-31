import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import DigitalGlobe from '../components/DigitalGlobe';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data.access_token) {
        login(response.data.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid credentials or server error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <DigitalGlobe />
        </Canvas>
      </div>
      
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none z-0" style={{ animationDelay: '1.5s' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-md glass-panel p-10 rounded-3xl relative z-10"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          {/* Logo Typography */}
          <div className="relative z-10 mb-2">
            <img 
              src="/logo.png" 
              alt="AqarBot Logo" 
              className="h-20 w-auto" 
            />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm tracking-widest uppercase">Terminal d'Administration</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          >
            {error === 'Invalid credentials or server error.' ? 'Identifiants invalides ou erreur serveur.' : error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">Lien d'Identité</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-tertiary focus:border-transparent focus:bg-white dark:focus:bg-black/40 transition-all font-mono shadow-inner outline-none dark:focus:shadow-[0_0_15px_rgba(33,160,65,0.2)]"
              placeholder="admin@aqarbot.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">Code d'Accès</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-slate-300 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-tertiary focus:border-transparent focus:bg-white dark:focus:bg-black/40 transition-all font-mono shadow-inner outline-none dark:focus:shadow-[0_0_15px_rgba(33,160,65,0.2)]"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-blue-700 dark:bg-tertiary dark:hover:bg-[#1fa344] text-white font-bold tracking-widest uppercase py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg dark:shadow-[0_0_20px_rgba(33,160,65,0.3)] hover:scale-[1.02]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                AUTHENTIFICATION...
              </span>
            ) : 'INITIER LA LIAISON'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
