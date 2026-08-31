'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on auth pages for a cleaner focus
  if (pathname.startsWith('/auth')) return null;

  return (
    <footer className="w-full bg-[#0B1120] relative z-10 pt-24 overflow-hidden border-t border-slate-900 border-dashed font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#6EE7B7]/5 blur-[200px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        
        {/* Main Footer Links & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          
          {/* Brand & Intro */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo-icon.png" alt="Aqarbot" className="h-8 w-auto px-1" />
              <span className="text-white text-xl font-bold tracking-tight">Aqarbot.</span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
              L'intelligence artificielle dédiée aux agences immobilières marocaines pour qualifier vos leads 24/7 sur WhatsApp.
            </p>
            <div className="text-[10px] uppercase font-black tracking-widest text-[#6EE7B7] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6EE7B7] shadow-[0_0_10px_#6EE7B7] animate-pulse"></span>
              SYSTÈME OPÉRATIONNEL
            </div>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col gap-4 lg:ml-12">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-2">Plateforme</h4>
            <a href="/solutions" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               Solutions AI <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="/crm" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               CRM Agence <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="/biens" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               Biens Qualifiés <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="/prix" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               Tarification <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-2">Entreprise</h4>
            <a href="/a-propos" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               À Propos <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="/contact" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               Contactez-nous <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="/confidentialite" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               Confidentialité <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
            <a href="/conditions" className="text-slate-400 text-sm font-medium hover:text-[#6EE7B7] hover:translate-x-1 transition-all flex items-center gap-2 group">
               CGV <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </a>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-2">Support Direct</h4>
            <div className="text-slate-400 text-sm font-medium flex items-start gap-3 mt-1">
              <span className="text-[#6EE7B7] font-bold">LST</span>
              <span>Casablanca, Maroc<br/>AqarBot Technologies</span>
            </div>
            <div className="text-slate-400 text-sm font-medium flex items-center gap-3">
              <span className="text-[#6EE7B7] font-bold">EML</span>
              <span>contact@aqarbot.ma</span>
            </div>
            <div className="text-slate-400 text-sm font-medium flex items-center gap-3">
              <span className="text-[#6EE7B7] font-bold">TEL</span>
              <span>+212 (0) 500 000 000</span>
            </div>
          </div>
        </div>

        {/* BOTTOM GIANT LOGO DESIGN (Based on Dakimmo Reference) */}
        <div className="w-full flex items-center justify-between border-t border-slate-800/80 pt-6 pb-4 lg:pt-8 lg:pb-8 overflow-hidden gap-4">
          <div 
            className="text-[#f1f5f9] font-medium tracking-tighter leading-none select-none shrink min-w-0 truncate" 
            style={{ fontSize: 'clamp(2.5rem, 10vw, 10rem)' }}
          >
            aqarbot.
          </div>
          
          <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-40 lg:h-40 rounded-full bg-[#6EE7B7] flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(110,231,183,0.3)] transition-transform hover:scale-[1.02] cursor-pointer ml-4">
            {/* Using brightness-0 to turn the logo pure black to match the reference style */}
            <img 
              src="/logo-icon.png" 
              alt="Aqarbot Icon" 
              className="w-[50%] h-[50%] object-contain brightness-0" 
            />
          </div>
        </div>

        {/* Footer Base */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between py-8 border-t border-slate-900 border-dashed text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">
          <div className="mb-4 md:mb-0">
            © 2024 AQARBOT · MADE IN MAROC 🇲🇦
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">LINKEDIN</a>
            <a href="#" className="hover:text-white transition-colors">INSTAGRAM</a>
            <a href="#" className="hover:text-white transition-colors">WHATSAPP</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
