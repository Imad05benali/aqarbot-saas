'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Rocket, ChevronRight } from 'lucide-react';

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
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ${scrolled ? 'bg-[#0B1120]/90 border-slate-800/80 shadow-2xl backdrop-blur-xl' : 'bg-transparent border-transparent shadow-none backdrop-blur-none'}`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 h-24 flex items-center justify-between">
          
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <img 
              src="/logo-icon.png" 
              alt="AqarBot Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Links (Centered, gray to white hover) */}
          <div className="hidden md:flex items-center gap-12 text-[13px] font-semibold tracking-wide">
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

          {/* Actions : Exact Mint Button Match */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center">
              <a 
                href="https://aqarbot-frontend.vercel.app/login" 
                className="px-6 py-3.5 bg-[#6EE7B7] text-[#0B1120] text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#4ade80] transition-colors shadow-lg active:scale-95 flex items-center gap-2"
              >
                Espace Agence (CRM) <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-800 transition-colors z-[110]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5 text-[#6EE7B7]" /> : <Menu className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[90] md:hidden transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-[#0B1120]/95 backdrop-blur-2xl" 
          onClick={() => setIsOpen(false)}
        />
        
        <div className={`absolute right-4 top-24 left-4 p-8 rounded-xl border border-slate-800 bg-[#0d1624] shadow-2xl transition-all duration-500 ease-out transform ${isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-10 scale-95 opacity-0'}`}>
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 ml-2">Navigation</p>
            {navLinks.map((link, i) => (
              <a 
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between group p-4 transition-all ${isActive(link.href) ? 'bg-[#6EE7B7]/10 text-[#6EE7B7]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-sm font-black tracking-wide">{link.name}</span>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isActive(link.href) ? 'text-[#6EE7B7]' : 'text-slate-500'}`} />
              </a>
            ))}
          </div>

          <div className="h-px bg-slate-800/80 my-8" />
          
          <div className="flex flex-col gap-4">
            <a 
              href="https://aqarbot-frontend.vercel.app/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-5 bg-[#6EE7B7] text-[#0B1120] text-[11px] font-black uppercase tracking-[0.2em] text-center shadow-[0_0_20px_rgba(110,231,183,0.2)]"
            >
              Espace Agence (CRM)
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
