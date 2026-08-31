'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import ScrollReveal from '@/components/ScrollReveal';
import { Bot, LineChart, Globe, Zap, MessageCircle, Database } from 'lucide-react';

const productFeatures = [
  {
    title: "IA Conversationnelle Intégrée",
    desc: "Un assistant qui parle votre langue. Darija, Français, Arabe - AqarBot communique naturellement avec chaque prospect.",
    icon: <Bot className="w-8 h-8 text-brand-emerald" />
  },
  {
    title: "Tableau de Bord Analytics",
    desc: "Suivez vos performances en temps réel. Taux de conversion, leads qualifiés et volume de messages.",
    icon: <LineChart className="w-8 h-8 text-brand-emerald" />
  },
  {
    title: "Base de Données Locale",
    desc: "Une puissance de recherche optimisée pour le Maroc, couvrant toutes les villes et quartiers du Royaume.",
    icon: <Globe className="w-8 h-8 text-brand-emerald" />
  }
];

export default function ProduitPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-100 selection:bg-[#6EE7B7]/30 pt-32 pb-24 px-6 md:px-12 lg:px-20 overflow-hidden">
      
      <div className="max-w-[1400px] mx-auto">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto text-left mb-24">
            <div className="flex items-end gap-6 mb-8 mt-10 group">
              <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">P01</span>
              <div className="flex flex-col pb-1">
                <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">L'Assistant du Futur</span>
              </div>
            </div>
            
            <h1 className="text-[clamp(2.2rem,8vw,7rem)] font-medium leading-[0.85] tracking-tight mb-8">
              <span className="text-white">Plus qu'un bot.</span><br />
              <span className="text-[#6EE7B7]">Une Agence IA.</span>
            </h1>
            <p className="text-lg md:text-[1.3rem] text-slate-400 font-normal leading-relaxed max-w-xl mb-16">
              AqarBot n'est pas un simple outil de réponse. C'est un collaborateur intelligent qui gère, qualifie et prospecte pour vous, 24h/24.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 border border-slate-800 rounded-sm bg-[#0d1624] mb-32">
          {productFeatures.map((item, i) => (
            <ScrollReveal key={i} stagger={i * 0.2}>
              <div className="p-10 flex flex-col hover:bg-slate-800/30 transition-colors h-full text-left">
                <div className="mb-12 flex justify-between items-start">
                  {React.cloneElement(item.icon as React.ReactElement<{className?: string}>, { className: 'w-6 h-6 text-[#6EE7B7]' })}
                  <span 
                    className="text-transparent text-5xl font-black tracking-tighter opacity-80"
                    style={{ WebkitTextStroke: '1.5px #eab308' }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <div className="mb-4">
                  <h3 className="text-white text-lg tracking-wide font-bold">{item.title}</h3>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[250px]">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Product Integration Highlight */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-t border-slate-900/50 pt-20">
            <div>
              <div className="flex items-end gap-6 mb-8 group">
                <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">P02</span>
                <div className="flex flex-col pb-1">
                  <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                  <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">Workflow Continu</span>
                </div>
              </div>
              <h2 className="text-4xl md:text-[3.5rem] font-medium tracking-tight leading-[1.1] mb-8">
                <span className="text-white">Intégration WhatsApp</span><br/>
                <span className="text-yellow-500">Native.</span>
              </h2>
              <div className="space-y-6 max-w-md">
                <div className="flex gap-4 items-start">
                  <MessageCircle className="w-5 h-5 text-[#6EE7B7] mt-1 shrink-0" />
                  <p className="text-sm font-medium text-slate-400">Qualifiez vos clients directement là où ils sont : sur WhatsApp.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <Database className="w-5 h-5 text-[#6EE7B7] mt-1 shrink-0" />
                  <p className="text-sm font-medium text-slate-400">Toutes les données sont synchronisées avec votre CRM interne.</p>
                </div>
              </div>
            </div>
            
            <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[500px] bg-[#0d1624] border border-slate-800 rounded-sm shadow-2xl overflow-hidden flex items-center justify-center p-8 group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6EE7B7]/5 to-transparent z-0" />
              <img 
                  src="/whatsapp-crm.png" 
                  alt="WhatsApp CRM Integration" 
                  className="w-full max-w-[80%] h-auto object-contain relative z-10 transform group-hover:scale-[1.05] transition-transform duration-1000" 
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
