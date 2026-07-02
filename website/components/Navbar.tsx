'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, Rocket, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (pathname.startsWith('/auth')) return null;

  const navLinks = [
    { name: 'Produit', href: '/produit' },
    { name: 'Fonctionnalités', href: '/fonctionnalites' },
    { name: 'Maroc Core', href: '/maroc-core' },
    { name: 'Prix', href: '/prix' }
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] max-w-7xl z-[100] px-4 md:px-8 py-3 md:py-4 rounded-[32px] md:rounded-full border border-neutral-200 dark:border-neutral-800/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <a href="/" className="flex items-center group ml-2">
            <img 
              src="/aqar-removebg-preview.png" 
              alt="AqarBot Logo" 
              className="h-8 md:h-12 w-auto object-contain transition-transform group-hover:scale-105 dark:brightness-100 brightness-0"
            />
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-bold">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`relative py-2 transition-colors group ${isActive(link.href) ? 'text-brand-emerald' : 'text-slate-600 dark:text-slate-400 hover:text-brand-emerald dark:hover:text-white'}`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-px bg-brand-emerald transition-all duration-300 ${isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            <ThemeToggle />
            
            <div className="hidden sm:flex items-center gap-4">
              <a 
                href="/auth/register" 
                className="px-5 md:px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs md:text-sm font-black rounded-xl hover:bg-brand-emerald dark:hover:bg-brand-emerald hover:text-white dark:hover:text-black transition-all shadow-lg active:scale-95"
              >
                Commencer
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-neutral-800 transition-colors z-[110]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5 text-brand-emerald" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[90] md:hidden transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-2xl" 
          onClick={() => setIsOpen(false)}
        />
        
        <div className={`absolute right-4 top-24 left-4 p-8 rounded-[40px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-zinc-950 shadow-3xl transition-all duration-500 ease-out transform ${isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-10 scale-95 opacity-0'}`}>
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 ml-2">Navigation</p>
            {navLinks.map((link, i) => (
              <a 
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between group p-4 rounded-2xl transition-all ${isActive(link.href) ? 'bg-brand-emerald/10 text-brand-emerald' : 'text-slate-600 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-white/5'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-xl font-black">{link.name}</span>
                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isActive(link.href) ? 'text-brand-emerald' : 'text-slate-300'}`} />
              </a>
            ))}
          </div>

          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-8" />
          
          <div className="flex flex-col gap-4">
            <a 
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400 font-bold text-center hover:bg-neutral-50 dark:hover:bg-white/5"
            >
              Connexion
            </a>
            <a 
              href="/auth/register"
              onClick={() => setIsOpen(false)}
              className="w-full py-5 rounded-2xl bg-brand-emerald text-black font-extrabold text-center shadow-xl shadow-brand-emerald/20 flex items-center justify-center gap-2 group"
            >
              Démarrer Gratuitement <Rocket className="w-5 h-5 group-hover:animate-bounce-short" />
            </a>
          </div>

          <p className="text-center mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            © 2026 AqarBot AI • 100% Marocain 🇲🇦
          </p>
        </div>
      </div>
    </>
  );
}
