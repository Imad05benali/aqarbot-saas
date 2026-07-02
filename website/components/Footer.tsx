'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on auth pages for a cleaner focus
  if (pathname.startsWith('/auth')) return null;

  return (
    <footer className="pt-24 pb-12 bg-black border-t border-neutral-900 overflow-hidden relative mt-20">
      {/* Subtle Glow inside footer to keep tech feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-emerald/20 to-transparent" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <a href="/">
              <img src="/aqar-removebg-preview.png" alt="AqarBot" className="h-12 w-auto mb-8 dark:brightness-100 brightness-0" />
            </a>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              La première solution IA sur WhatsApp dédiée exclusivement au marché immobilier marocain.
            </p>
          </div>
          <div>
            <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Produit</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="/fonctionnalites" className="hover:text-brand-emerald transition-colors">Fonctionnalités</a></li>
              <li><a href="/prix" className="hover:text-brand-emerald transition-colors">Tarifs</a></li>
              <li><a href="/maroc-core" className="hover:text-brand-emerald transition-colors">Maroc Core</a></li>
              <li><a href="/produit" className="hover:text-brand-emerald transition-colors">Produit</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Entreprise</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li className="hover:text-brand-emerald transition-colors cursor-pointer">À propos</li>
              <li className="hover:text-brand-emerald transition-colors cursor-pointer">Contact</li>
              <li className="hover:text-brand-emerald transition-colors cursor-pointer">Carrières</li>
              <li className="hover:text-brand-emerald transition-colors cursor-pointer">Partenaires</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-8">Légal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li className="hover:text-brand-emerald transition-colors cursor-pointer">Confidentialité</li>
              <li className="hover:text-brand-emerald transition-colors cursor-pointer">CGU</li>
              <li className="hover:text-brand-emerald transition-colors cursor-pointer">Mentions Légales</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-neutral-100 dark:border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-black tracking-wide">
            © 2026 AqarBot AI. Fièrement développé par STACKLY DIGITAL au Maroc. 🇲🇦
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">LinkedIn</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">Twitter / X</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
