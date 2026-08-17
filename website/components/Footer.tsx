'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on auth pages for a cleaner focus
  if (pathname.startsWith('/auth')) return null;

  return (
    <footer className="w-full bg-[#0B1120] px-6 md:px-12 lg:px-20 pb-12 relative z-10 pt-10">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center py-10 border-t border-slate-900 border-dashed text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">
        <div className="flex items-center gap-4 opacity-50 mb-6 md:mb-0">
          <img src="/logo-icon.png" alt="Aqarbot" className="h-7 w-auto grayscale" />
          <div className="flex flex-col text-[9px] font-medium tracking-normal normal-case leading-tight">
            <span>L'intelligence opérationnelle des agences</span>
            <span>immobilières marocaines.</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8 mb-6 md:mb-0">
          <a href="/solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="/biens" className="hover:text-white transition-colors">Biens Qualifiés</a>
          <a href="/crm" className="hover:text-white transition-colors">CRM Agence</a>
          <a href="/prix" className="hover:text-white transition-colors">Tarifs</a>
        </div>

        <div className="opacity-50">© 2024 AQARBOT · FAIT AU MAROC</div>
      </div>
    </footer>
  );
}
