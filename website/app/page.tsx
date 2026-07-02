'use client';

import React from 'react';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import ScrollReveal from '@/components/ScrollReveal';
import MetricCard from '@/components/MetricCard';
import StructuredData from '@/components/StructuredData';
import { MessageSquare, Search, UserCheck, ArrowRight, Zap, Star, ShieldCheck, HelpCircle } from 'lucide-react';

const steps = [
  {
    title: "Message WhatsApp",
    description: "Le prospect envoie un message en Darija ou Français à votre numéro AqarBot.",
    icon: <MessageSquare className="w-8 h-8 text-brand-emerald" />,
    color: "bg-emerald-500/10"
  },
  {
    title: "Analyse par l'IA",
    description: "Notre IA analyse l'intention, extrait les besoins (budget, quartier, type) en millisecondes.",
    icon: <Zap className="w-8 h-8 text-brand-neon" />,
    color: "bg-teal-500/10"
  },
  {
    title: "Qualification & Réponse",
    description: "Le lead est enregistré dans votre CRM et l'IA propose instantanément des biens correspondants.",
    icon: <UserCheck className="w-8 h-8 text-brand-teal" />,
    color: "bg-blue-500/10"
  }
];

const faqs = [
  {
    k: "Est-ce que l'IA comprend le Darija ?",
    v: "Oui, parfaitement. Notre modèle est spécifiquement entraîné sur les expressions locales marocaines et les variations d'orthographe (Meknes, Meknès, Casa, Dar Beida, etc.)."
  },
  {
    k: "Puis-je l'intégrer à mon CRM actuel ?",
    v: "AqarBot dispose de son propre CRM léger, mais nous pouvons également nous connecter à vos outils via API (Zapier, Make, ou intégrations directes)."
  },
  {
    k: "Est-ce conforme au RGPD et à la CNDP ?",
    v: "Oui, la sécurité des données est notre priorité. Toutes les données sont chiffrées et nous respectons les réglementations locales sur la protection des données personnelles."
  }
];

export default function Home() {
  return (
    <main className="selection:bg-brand-emerald/30 overflow-x-hidden">
      <StructuredData />
      <div className="pt-24 md:pt-32 lg:pt-40">
        {/* HERO SECTION - CENTERED */}
        <section className="container mx-auto px-6 max-w-7xl min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center relative">
          <ScrollReveal>
            <div className="flex flex-col items-center text-center animate-reveal">
              <div className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 px-4 py-1.5 text-sm text-brand-emerald mb-10 shadow-[0_0_20px_rgba(16,185,129,0.1)] animate-float">
                <span className="flex h-2 w-2 rounded-full bg-brand-emerald mr-2 animate-pulse" />
                <span className="font-bold tracking-tight">Nouvelle Era de l'Immobilier au Maroc</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6 md:mb-8 leading-[1.1] animate-reveal">
                Votre agence immobilière <br />
                <span className="text-gradient">sous stéroïdes IA</span>
              </h1>

              <p className="max-w-[800px] text-slate-600 dark:text-slate-400 text-base md:text-xl lg:text-2xl mb-10 md:mb-12 leading-relaxed font-medium animate-reveal">
                Dites adieu aux leads perdus. Notre IA qualifie vos prospects sur WhatsApp 24/7 en <span className="text-slate-900 dark:text-white font-bold underline decoration-brand-emerald/30">Darija et Français</span> pendant que vous dormez.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full sm:w-auto animate-reveal">
                <button className="w-full sm:w-auto group relative px-8 md:px-10 py-4 md:py-5 bg-black dark:bg-brand-emerald text-white dark:text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-brand-emerald/40 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-emerald to-brand-neon opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center gap-2 text-lg md:text-xl">
                    Démarrer Maintenant <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 border-2 border-neutral-200 dark:border-neutral-800 bg-transparent text-foreground font-black rounded-2xl transition-all hover:bg-neutral-100 dark:hover:bg-white/5 active:scale-95 text-lg md:text-xl">
                  Voir la démo
                </button>
              </div>

              {/* Status Indicator Floating */}
              <div className="mt-16 flex items-center gap-6 animate-reveal" style={{ transitionDelay: '0.8s' }}>
                <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="w-3 h-3 bg-brand-emerald rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">+127 Leads qualifiés aujourd'hui</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

          {/* BRANDS / LOGOS */}
          <section className="py-20 border-y border-neutral-100 dark:border-neutral-900 overflow-hidden">
            <div className="container mx-auto px-6">
              <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-12">Ils nous font confiance</p>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
                <img src="/STACKLY.png" alt="Stackly" className="h-8 w-auto dark:invert brightness-0 dark:brightness-100" />
                <div className="text-2xl font-black text-foreground italic opacity-50">CASA IMMO</div>
                <div className="text-2xl font-black text-foreground italic opacity-50">MARRAKECH REALTY</div>
                <div className="text-2xl font-black text-foreground italic opacity-50">TANGER PROPS</div>
              </div>
            </div>
          </section>

          <Features />

          {/* HOW IT WORKS */}
          <section id="fonctionnalites" className="section-padding bg-zinc-50/50 dark:bg-zinc-950/20 relative overflow-hidden">
            {/* Network Graphics / Geometric Background */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
              <svg width="100%" height="100%" fill="none" viewBox="0 0 1440 800">
                <circle cx="200" cy="200" r="2" fill="currentColor" />
                <circle cx="600" cy="150" r="2" fill="currentColor" />
                <circle cx="1000" cy="250" r="2" fill="currentColor" />
                <circle cx="1300" cy="100" r="2" fill="currentColor" />
                <circle cx="400" cy="500" r="2" fill="currentColor" />
                <circle cx="800" cy="650" r="2" fill="currentColor" />
                <circle cx="1200" cy="550" r="2" fill="currentColor" />
                <path d="M200 200L600 150L1000 250L1300 100" stroke="currentColor" strokeWidth="0.5" />
                <path d="M400 500L800 650L1200 550" stroke="currentColor" strokeWidth="0.5" />
                <path d="M600 150L800 650" stroke="currentColor" strokeWidth="0.5" />
                <path d="M1000 250L1200 550" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
              <div className="text-center mb-20 text-balance animate-fade-in">
                <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">Comment ça marche ?</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-[700px] mx-auto text-lg font-medium">
                  Une mise en place simple pour des résultats révolutionnaires.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
                {steps.map((step, i) => (
                  <ScrollReveal key={step.title} stagger={0}>
                    <div 
                      className="relative z-10 flex flex-col items-center text-center animate-slide-in-right"
                      style={{ transitionDelay: `${i * 0.3}s` }}
                    >
                      {/* Step Connection Line (Drawing effect) - Desktop only */}
                      {i < 2 && (
                        <div 
                          className="hidden lg:block absolute top-[40px] left-[54%] w-full h-1 bg-brand-emerald/10 z-0 overflow-hidden"
                          style={{ transitionDelay: `${(i * 0.3) + 0.2}s` }}
                        >
                           <div className="w-full h-full bg-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-draw origin-left" />
                        </div>
                      )}

                      <div className={`w-24 h-24 rounded-[32px] ${step.color} border-2 border-brand-emerald/20 flex items-center justify-center mb-10 shadow-2xl hover:scale-110 hover:rotate-3 transition-all duration-500 relative bg-background z-10`}>
                        {step.icon}
                        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-brand-emerald text-black flex items-center justify-center font-black text-sm shadow-xl border-4 border-background">
                          {i + 1}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-foreground mb-4">{step.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-[280px]">
                        {step.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* TRUST SECTION / TESTIMONIALS */}
          <ScrollReveal>
            <section className="section-padding overflow-hidden animate-reveal" style={{ animationDelay: '0.6s' }}>
              <div className="container mx-auto px-6 max-w-7xl">
                <div className="glass-card p-8 md:p-16 rounded-[48px] relative overflow-hidden group hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] transition-shadow duration-700">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="animate-reveal" style={{ animationDelay: '0.8s' }}>
                      <div className="flex gap-1 mb-8">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-6 h-6 fill-brand-emerald text-brand-emerald animate-float" style={{ animationDelay: `${s * 0.2}s` }} />)}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-foreground mb-8 leading-tight">
                        "AqarBot a transformé notre gestion de nuit. On ne perd plus aucun lead."
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden border-2 border-brand-emerald hover:scale-110 transition-transform">
                          <UserCheck className="w-full h-full p-3 text-brand-emerald" />
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg">Ahmed Tazi</p>
                          <p className="text-brand-emerald text-sm font-bold uppercase tracking-widest">Directeur, Casa Realty</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <MetricCard value="98" suffix="%" label="Satisfaction Client" delay="1.0s" />
                      <MetricCard value="3" suffix="x" label="Plus de Leads" delay="1.1s" />
                      <MetricCard value="10" prefix="<" suffix="s" label="Temps de Réponse" delay="1.2s" />
                      <MetricCard value="24" suffix="/7" label="Disponibilité" delay="1.3s" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <Pricing />

          {/* FAQ SECTION */}
          <ScrollReveal>
            <div id="faq" className="section-padding container mx-auto px-6 max-w-7xl">
              <div className="text-center mb-20 animate-reveal">
                <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6">Questions Fréquentes</h2>
                <div className="w-24 h-1.5 bg-brand-emerald mx-auto rounded-full" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Column: FAQ Items */}
                <div className="space-y-6 order-1 lg:order-1">
                  {faqs.map((faq, i) => (
                    <ScrollReveal key={faq.k} stagger={i * 0.15}>
                      <div 
                        className="glass-card p-8 rounded-[24px] hover:border-brand-emerald/30 transition-all cursor-pointer group animate-fade-in-up"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-lg font-black text-foreground group-hover:text-brand-emerald transition-colors">{faq.k}</h3>
                          <HelpCircle className="w-6 h-6 text-slate-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                          {faq.v}
                        </p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Right Column: Premium Image Integration */}
                <ScrollReveal stagger={0.4} className="order-2 lg:order-2">
                  <div className="relative animate-fade-in-up">
                    <div className="relative z-10 rounded-[32px] overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl -skew-y-1 hover:skew-y-0 transition-transform duration-700">
                      <img 
                        src="/hero section.png" 
                        alt="AqarBot Interface Demonstration" 
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-emerald/10 blur-[80px] rounded-full -z-10" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-neon/10 blur-[80px] rounded-full -z-10" />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </ScrollReveal>
          
          {/* FINAL CTA */}
          <ScrollReveal>
            <section className="section-padding container mx-auto px-6 text-center animate-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[48px] border-2 border-brand-emerald bg-black dark:bg-brand-emerald text-white dark:text-black relative overflow-hidden group hover:shadow-[0_0_80px_rgba(16,185,129,0.3)] transition-all duration-1000">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-emerald/10 to-brand-neon/10 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <ScrollReveal stagger={0.4}>
                    <h2 className="text-4xl md:text-6xl font-black mb-8 animate-reveal">N'attendez plus que vos leads s'endorment.</h2>
                  </ScrollReveal>
                  <ScrollReveal stagger={0.6}>
                    <p className="text-slate-300 dark:text-black/70 mb-12 max-w-2xl mx-auto text-xl font-bold leading-relaxed animate-reveal">
                      Activez votre Semsar AI aujourd'hui et commencez à capturer chaque opportunité du marché marocain.
                    </p>
                  </ScrollReveal>
                  <ScrollReveal stagger={0.8}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-reveal">
                      <button className="w-full sm:w-auto bg-brand-emerald dark:bg-black text-black dark:text-white px-12 py-5 rounded-[20px] font-black text-2xl hover:scale-105 hover:rotate-1 transition-all shadow-2xl active:scale-95">
                        Essayer Maintenant
                      </button>
                      <div className="flex items-center gap-2 animate-float">
                        <ShieldCheck className="w-6 h-6 text-brand-emerald dark:text-black/50" />
                        <span className="text-sm font-bold opacity-70">Satisfait ou remboursé sous 14 jours</span>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </section>
          </ScrollReveal>
        </div>
    </main>
  );
}
