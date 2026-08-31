'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Rocket, ChevronRight, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);


  const navLinks = [
    { name: 'Solutions', href: '/solutions' },
    { name: 'Biens Qualifiés', href: '/biens' },
    { name: 'CRM Agence', href: '/crm' },
    { name: 'Tarifs', href: '/prix' }
  ];

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      {/* ─── DESKTOP HEADER ─────────────────────────────────────────────────── */}
      <nav 
        className={`hidden md:flex fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ${scrolled ? 'bg-[#0B1120]/90 border-slate-800/80 shadow-2xl backdrop-blur-xl' : 'bg-transparent border-transparent shadow-none backdrop-blur-none'}`}
      >
        <div className="max-w-[1400px] mx-auto px-12 lg:px-20 h-24 w-full flex items-center justify-between">
          <a href="/" className="flex items-center group">
            <Image 
              src="/logo-icon.png" 
              alt="AqarBot Logo" 
              width={40}
              height={40}
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          <div className="flex items-center gap-12 text-[13px] font-semibold tracking-wide">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`transition-colors ${isActive(link.href) ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="/auth/login" 
              className="px-6 py-3.5 bg-[#6EE7B7] text-[#0B1120] text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#4ade80] transition-colors shadow-lg active:scale-95 flex items-center gap-2 rounded-sm"
            >
              Espace Agence <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* ─── MOBILE FLOATING PILL ───────────────────────────────────────────── */}
      <nav className={`md:hidden fixed top-3 left-3 right-3 z-[110] flex items-center justify-between bg-[#1f2322] rounded-full pl-5 pr-1.5 py-1.5 shadow-2xl border border-white/5 transition-all duration-300 ${isOpen ? 'bg-[#0d100f] border-transparent' : ''}`}>
        <a href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Image src="/logo-icon.png" alt="Aqarbot" width={20} height={20} className="opacity-90 brightness-0 invert" />
          <span className="text-white font-extrabold tracking-tight text-lg mb-0.5">aqarbot</span>
          <span className="w-1 h-1 bg-[#6EE7B7] rounded-full mt-1.5" />
        </a>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/5"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-5 h-5 text-white" /> : <div className="space-y-1.5 flex flex-col items-center justify-center"><span className="w-4 h-0.5 bg-white rounded-full block"></span><span className="w-4 h-0.5 bg-white rounded-full block"></span><span className="w-4 h-0.5 bg-white rounded-full block"></span></div>}
        </button>
      </nav>

      {/* ─── MOBILE FULLSCREEN MENU ─────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-400 ease-in-out bg-[#0D100F] flex flex-col pt-20 px-3 pb-6 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Navigation Links List */}
        <div className="flex-1 flex flex-col bg-[#121514] rounded-3xl p-5 border border-white/5 mt-4 overflow-y-auto">
          {navLinks.map((link, i) => (
            <a 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between py-5 border-b border-white/[0.03] last:border-0 group"
            >
              <span className={`text-[1.1rem] font-bold tracking-tight ${isActive(link.href) ? 'text-white' : 'text-slate-100'}`}>{link.name}</span>
              <span className="text-[10px] font-black text-[#6EE7B7] tracking-widest">0{i + 1}</span>
            </a>
          ))}
          <a 
              href="/auth/register" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between py-5 border-b border-white/[0.03] last:border-0 group"
          >
              <span className="text-[1.1rem] font-bold tracking-tight text-slate-100">Inscription</span>
              <span className="text-[10px] font-black text-[#6EE7B7] tracking-widest">0{navLinks.length + 1}</span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-3">
          <a 
            href="/auth/login"
            className="w-full bg-[#6EE7B7] text-[#0B1120] text-xs font-black uppercase tracking-wider rounded-[1.25rem] py-4 flex items-center justify-between px-6 transition-transform active:scale-95 shadow-xl"
          >
            <span>Ouvrir l'Espace Agence</span>
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </a>
          <a 
            href="/auth/register"
            className="w-full bg-[#181a1a] text-white border border-white/5 text-xs font-black uppercase tracking-wider rounded-[1.25rem] py-4 flex items-center justify-between px-6 transition-transform active:scale-95"
          >
            <span>Essai Gratuit</span>
            <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
          </a>
        </div>
        
        <a href="/" onClick={() => setIsOpen(false)} className="text-slate-500 mt-6 mb-2 text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
           Retour au site <ArrowRight className="w-3 h-3" />
        </a>

      </div>
    </>
  );
}
