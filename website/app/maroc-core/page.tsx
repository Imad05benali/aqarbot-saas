'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import ScrollReveal from '@/components/ScrollReveal';
import { Globe, MapPin, Search, CheckCircle2, Languages } from 'lucide-react';

const coreValues = [
  {
    title: "Compréhension du Darija",
    desc: "Nous avons entraîné nos modèles sur des millions de conversations réelles au Maroc. De 'Chhal taman' à 'Fin kayna', l'IA comprend chaque nuance.",
    icon: <Languages className="w-8 h-8 text-brand-emerald" />
  },
  {
    title: "Géolocalisation Précise",
    desc: "Indexation complète des quartiers de Casablanca, Marrakech, Tanger et Agadir. L'IA connaît la différence entre Maarif et Gauthier.",
    icon: <MapPin className="w-8 h-8 text-brand-emerald" />
  },
  {
    title: "Fuzzy Vowel Matching",
    desc: "Algorithme propriétaire résilient aux fautes d'orthographe. 'Meknes' ou 'Meknès' - le résultat est toujours précis.",
    icon: <Search className="w-8 h-8 text-brand-emerald" />
  }
];

export default function MarocCorePage() {
  return (
    <main className="min-h-screen selection:bg-brand-emerald/30">
      
      <div className="pt-40 pb-32 container mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-4xl animate-reveal mb-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-1px bg-brand-emerald" />
              <span className="text-brand-emerald font-black uppercase tracking-[0.3em] text-xs">Maroc Core Edition</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9]">
              L'immobilier marocain <br />
              <span className="text-brand-emerald">réinventé localement.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
              Nous n'avons pas seulement adapté AqarBot au Maroc. Nous l'avons construit <span className="text-foreground">pour</span> le Maroc.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {coreValues.map((value, i) => (
            <ScrollReveal key={i} stagger={i * 0.2}>
              <div className="glass-card p-10 rounded-[40px] border-neutral-100 dark:border-neutral-800 hover:border-brand-emerald/30 transition-all duration-500 group animate-reveal">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mb-8 group-hover:bg-brand-emerald/10 transition-colors">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-brand-emerald transition-colors">{value.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{value.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center animate-reveal">
             <div className="space-y-10">
               <h2 className="text-4xl font-black leading-tight italic">
                 Pourquoi le "Core" fait la différence ?
               </h2>
               <div className="space-y-6">
                 {[
                   "Données hébergées en conformité avec la CNDP.",
                   "Support natif pour les numéros marocains (+212).",
                   "Compréhension des types de biens locaux (Riad, Villa, Appartement de luxe).",
                   "Moteur de recherche SQL ultra-rapide sans latence."
                 ].map((text, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                     <CheckCircle2 className="w-6 h-6 text-brand-emerald" />
                     <span className="text-lg font-bold text-slate-400">{text}</span>
                   </div>
                 ))}
               </div>
             </div>
             <div className="relative group">
                {/* Ambient Glow Background */}
                <div className="absolute -inset-4 bg-brand-emerald/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative glass-card p-4 rounded-[60px] border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-2xl max-w-xl mx-auto">
                   <img 
                      src="/maroc-core-tech.png" 
                      alt="Maroc Tech Core" 
                      className="w-full h-auto rounded-[40px] transform group-hover:scale-[1.02] transition-transform duration-700" 
                   />
                </div>
             </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
