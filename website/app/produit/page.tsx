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
    <main className="min-h-screen selection:bg-brand-emerald/30">
      
      <div className="pt-40 pb-32 container mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto text-center animate-reveal">
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-sm font-black uppercase tracking-widest mb-10">
              L'Assistant du Futur
            </div>
            <h1 className="text-5xl md:text-8xl font-black mb-12 tracking-tight leading-[0.9]">
              Plus qu'un bot. <br />
              <span className="text-gradient">Une Agence IA.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed mb-16">
              AqarBot n'est pas un simple outil de réponse. C'est un collaborateur intelligent qui gère, qualifie et prospecte pour vous, 24h/24.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {productFeatures.map((item, i) => (
            <ScrollReveal key={i} stagger={i * 0.2}>
              <div className="glass-card p-10 rounded-[40px] border-neutral-200 dark:border-neutral-800 hover:border-brand-emerald/40 transition-all duration-700 group hover:-translate-y-4 animate-reveal">
                <div className="w-16 h-16 rounded-2xl bg-brand-emerald/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-brand-emerald transition-colors">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Product Integration Highlight */}
        <ScrollReveal>
          <div className="mt-32 glass-card p-12 md:p-20 rounded-[56px] border border-brand-emerald/20 overflow-hidden relative group animate-reveal">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-8">Intégration WhatsApp <br /><span className="text-brand-emerald">Native.</span></h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <MessageCircle className="w-6 h-6 text-brand-emerald flex-shrink-0" />
                    <p className="text-lg font-medium text-slate-500">Qualifiez vos clients directement là où ils sont : sur WhatsApp.</p>
                  </div>
                  <div className="flex gap-4">
                    <Database className="w-6 h-6 text-brand-emerald flex-shrink-0" />
                    <p className="text-lg font-medium text-slate-500">Toutes les données sont synchronisées avec votre CRM interne.</p>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-emerald/50 to-brand-neon/50 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative aspect-square max-w-lg mx-auto rounded-[40px] bg-neutral-100 dark:bg-zinc-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex items-center justify-center overflow-hidden">
                   <img 
                      src="/whatsapp-crm.png" 
                      alt="WhatsApp CRM Integration" 
                      className="w-full h-full object-contain transform group-hover:scale-[1.05] transition-transform duration-1000" 
                   />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
