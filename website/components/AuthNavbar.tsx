'use client';

import React from 'react';
import { ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface AuthNavbarProps {
  type: 'login' | 'register';
}

export default function AuthNavbar({ type }: AuthNavbarProps) {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl z-50 px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-800/50 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-xl shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between h-10">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center group">
            <img 
              src="/logo-icon.png" 
              alt="AqarBot Logo" 
              className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />
          <a href="/" className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-emerald transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Accueil
          </a>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
          {type === 'login' ? (
            <a 
              href="/auth/register" 
              className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:bg-brand-emerald dark:hover:bg-brand-emerald hover:text-white dark:hover:text-black transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" /> S'inscrire
            </a>
          ) : (
            <a 
              href="https://aqarbot-frontend.vercel.app/login" 
              className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:bg-brand-emerald dark:hover:bg-brand-emerald hover:text-white dark:hover:text-black transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" /> Connexion
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
