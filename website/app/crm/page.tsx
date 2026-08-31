'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Features from '@/components/Features';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, Zap, Target, Shield, Cpu } from 'lucide-react';

export default function FonctionnalitesPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-slate-100 selection:bg-[#6EE7B7]/30 pt-24">
      
      {/* Page Hero — compact */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 mb-12">
        <ScrollReveal>
          <div className="max-w-4xl text-left mb-12">
            <div className="flex items-end gap-4 mb-5 group">
              <span className="text-yellow-500 font-black text-3xl tracking-tighter opacity-80 group-hover:opacity-100 transition-all duration-700">F01</span>
              <div className="flex flex-col pb-0.5">
                <div className="h-px w-10 bg-slate-800 mb-1.5 transition-all duration-700 group-hover:w-16 group-hover:bg-yellow-500/50" />
                <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">La Technologie</span>
              </div>
            </div>

            <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[0.88] tracking-tight mb-5">
              L'IA au service de <br />
              <span className="text-[#6EE7B7]">votre croissance.</span>
            </h1>
            <p className="text-base text-slate-400 font-normal leading-relaxed max-w-xl mb-0">
              Nous avons construit AqarBot pour résoudre les problèmes réels des agents immobiliers au Maroc.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Features — full width, no horizontal padding clipping */}
      <Features />

      {/* Detailed Features Showcases — re-padded on this section only */}
      <section className="mt-16 py-16 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto border-t border-slate-900/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="bg-[#0d1624] border border-slate-800 rounded-sm hover:border-[#6EE7B7]/50 p-10 lg:p-16 transition-colors shadow-2xl relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6EE7B7]/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="w-16 h-16 rounded-sm bg-[#6EE7B7]/10 flex items-center justify-center mb-10 border border-[#6EE7B7]/20">
                <Zap className="w-8 h-8 text-[#6EE7B7]" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight mb-6 text-white">Réponse Instantanée 24/7</h2>
              <p className="text-slate-400 text-base font-medium leading-relaxed mb-10 max-w-md">
                Ne laissez plus jamais un client sans réponse à 23h. AqarBot prend le relais instantanément, qualifie le besoin et propose des biens correspondant aux critères du prospect.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-[#6EE7B7]/10 text-[#6EE7B7] text-[10px] font-black uppercase tracking-widest border border-[#6EE7B7]/20 rounded-sm">Semsar AI v2.0</div>
                <div className="px-4 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-sm">Temps Réel</div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger={0.3}>
            <div className="space-y-10 pl-0 lg:pl-10">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-sm bg-[#0d1624] border border-slate-800 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-[#6EE7B7]" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white mb-2 tracking-wide">Qualification de Leads</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">Extractions automatique du budget, du quartier et du type de bien souhaité.</p>
                </div>
              </div>
              <div className="w-full h-px bg-slate-800/50" />
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-sm bg-[#0d1624] border border-slate-800 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#6EE7B7]" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white mb-2 tracking-wide">Sécurité & Conformité</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">Hébergement sécurisé et respect strict de la confidentialité des données (CNDP).</p>
                </div>
              </div>
              <div className="w-full h-px bg-slate-800/50" />
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-sm bg-[#0d1624] border border-slate-800 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-6 h-6 text-[#6EE7B7]" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white mb-2 tracking-wide">Mise à Jour Automatique</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">Vos biens sont synchronisés en temps réel avec votre assistant WhatsApp.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
       </section>

      {/* Dedicated Ecosystem Image Showcase */}
      <section className="py-24 px-6 md:px-12 lg:px-20 max-w-[1400px] mx-auto border-t border-slate-900/50">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4 text-white">
              L'Écosystème <span className="text-[#6EE7B7]">AqarBot</span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg font-medium max-w-2xl mx-auto">
              Une infrastructure cloud centralisée qui connecte vos biens immobiliers et vos flux de données au cœur d'une base de données SQL sécurisée.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} className="relative max-w-4xl mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-[#6EE7B7]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
          <img 
            src="/maroc-core-tech-v2.png" 
            alt="Architecture Écosystème SaaS" 
            className="relative z-10 w-full object-contain filter drop-shadow-[0_0_40px_rgba(110,231,183,0.15)] animate-float"
          />
        </ScrollReveal>
      </section>

    </main>
  );
}
