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
    <main className="min-h-screen bg-[#0B1120] text-slate-100 selection:bg-[#6EE7B7]/30 pt-32 pb-24 px-6 md:px-12 lg:px-20 overflow-hidden">
      
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal>
           <div className="max-w-5xl mx-auto text-left mb-24">
            <div className="flex items-end gap-6 mb-8 mt-10 group">
              <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">M01</span>
              <div className="flex flex-col pb-1">
                <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">Maroc Core Edition</span>
              </div>
            </div>
            <h1 className="text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[0.85] tracking-tight mb-8">
              <span className="text-white">L'immobilier marocain</span> <br />
              <span className="text-[#6EE7B7]">réinventé localement.</span>
            </h1>
            <p className="text-lg md:text-[1.3rem] text-slate-400 font-normal leading-relaxed max-w-2xl mb-16">
              Nous n'avons pas seulement adapté AqarBot au Maroc. Nous l'avons construit <span className="text-white">pour</span> le Maroc.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 border border-slate-800 rounded-sm bg-[#0d1624] mb-32">
          {coreValues.map((value, i) => (
            <ScrollReveal key={i} stagger={i * 0.2}>
              <div className="p-10 flex flex-col hover:bg-slate-800/30 transition-colors h-full text-left">
                <div className="mb-12 flex justify-between items-start">
                  {React.cloneElement(value.icon as React.ReactElement<{className?: string}>, { className: 'w-6 h-6 text-[#6EE7B7]' })}
                  <span 
                    className="text-transparent text-5xl font-black tracking-tighter opacity-80"
                    style={{ WebkitTextStroke: '1.5px #eab308' }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <div className="mb-4">
                  <h3 className="text-white text-lg tracking-wide font-bold">{value.title}</h3>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[250px]">{value.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-t border-slate-900/50 pt-20">
             <div className="space-y-10 pl-0 lg:pl-10">
               <div className="flex items-end gap-6 mb-8 group">
                  <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">M02</span>
                  <div className="flex flex-col pb-1">
                    <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                    <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">La Différence Core</span>
                  </div>
                </div>
               <h2 className="text-4xl md:text-[3.5rem] font-medium tracking-tight leading-[1.1] mb-8">
                 Pourquoi ça fait <br/><span className="text-yellow-500">toute la différence ?</span>
               </h2>
               <div className="space-y-6">
                 {[
                   "Données hébergées en conformité avec la CNDP.",
                   "Support natif pour les numéros marocains (+212).",
                   "Compréhension des types de biens locaux (Riad, Villa).",
                   "Moteur de recherche SQL sans latence."
                 ].map((text, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                     <CheckCircle2 className="w-5 h-5 text-[#6EE7B7]" />
                     <span className="text-sm font-medium text-slate-400">{text}</span>
                   </div>
                 ))}
               </div>
             </div>
             
            <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[500px] bg-[#0d1624] border border-slate-800 rounded-sm shadow-2xl overflow-hidden flex items-center justify-center p-8 group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6EE7B7]/5 to-transparent z-0" />
              <img 
                  src="/maroc-core-tech.png" 
                  alt="Maroc Tech Core" 
                  className="w-full max-w-[80%] h-auto object-contain relative z-10 transform group-hover:scale-[1.05] transition-transform duration-1000" 
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
