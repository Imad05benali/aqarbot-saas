'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Features from '@/components/Features';
import ScrollReveal from '@/components/ScrollReveal';
import { ArrowRight, Zap, Target, Shield, Cpu } from 'lucide-react';

export default function FonctionnalitesPage() {
  return (
    <main className="min-h-screen selection:bg-brand-emerald/30">
      
      {/* Page Hero */}
      <div className="pt-40 pb-20 container mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-4xl animate-reveal">
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              L'IA au service de <br />
              <span className="text-brand-emerald italic">votre croissance.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              Nous avons construit AqarBot pour résoudre les problèmes réels des agents immobiliers au Maroc. Découvrez comment notre technologie transforme chaque interaction.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <Features />

      {/* Detailed Features Showcases */}
      <section className="section-padding container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="glass-card p-10 rounded-[40px] border-brand-emerald/20 animate-reveal">
               <div className="w-16 h-16 rounded-2xl bg-brand-emerald/10 flex items-center justify-center mb-8">
                 <Zap className="w-8 h-8 text-brand-emerald" />
               </div>
               <h2 className="text-3xl font-black mb-6">Réponse Instantanée 24/7</h2>
               <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed mb-8">
                 Ne laissez plus jamais un client sans réponse à 23h. AqarBot prend le relais instantanément, qualifie le besoin et propose des biens correspondant aux critères du prospect.
               </p>
               <div className="flex gap-4">
                 <div className="px-4 py-2 rounded-full bg-brand-emerald/5 text-brand-emerald text-xs font-black uppercase tracking-widest border border-brand-emerald/10">Semsar AI v2.0</div>
                 <div className="px-4 py-2 rounded-full bg-blue-500/5 text-blue-500 text-xs font-black uppercase tracking-widest border border-blue-500/10">Temps Réel</div>
               </div>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger={0.3}>
            <div className="space-y-12 animate-reveal">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-brand-emerald" />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2">Qualification de Leads</h4>
                  <p className="text-slate-500 font-medium">Extractions automatique du budget, du quartier et du type de bien souhaité.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-brand-emerald" />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2">Sécurité & Conformité</h4>
                  <p className="text-slate-500 font-medium">Hébergement sécurisé et respect strict de la confidentialité des données (CNDP).</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-6 h-6 text-brand-emerald" />
                </div>
                <div>
                  <h4 className="text-xl font-black mb-2">Mise à Jour Automatique</h4>
                  <p className="text-slate-500 font-medium">Vos biens sont synchronisés en temps réel avec votre assistant WhatsApp.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
