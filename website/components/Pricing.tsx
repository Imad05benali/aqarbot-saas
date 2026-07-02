'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const plans = [
  {
    name: "Starter",
    price: "499",
    description: "Parfait pour les agents indépendants (Semsars).",
    features: [
      "1 Numéro WhatsApp",
      "Génération illimitée de leads",
      "Qualification basique",
      "Support par Email",
      "Recherche SQL instantanée"
    ]
  },
  {
    name: "Business",
    price: "1290",
    popular: true,
    description: "Le choix des agences immobilières en croissance.",
    features: [
      "2 Numéros WhatsApp",
      "Qualification IA avancée (Darija)",
      "CRM Intégré",
      "Support Prioritaire 24/7",
      "Exportation de données illimitée",
      "Formation personnalisée"
    ]
  },
  {
    name: "Enterprise",
    price: "Sur Devis",
    description: "Solutions sur mesure pour les grands réseaux.",
    features: [
      "Numéros WhatsApp illimités",
      "Multi-utilisateurs / Agences",
      "Intégration API personnalisée",
      "Account Manager Dédié",
      "SLA Garanti",
      "Développement de features sur mesure"
    ]
  }
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="prix" className="py-24 w-full flex flex-col items-center">
      <div className="container px-4 md:px-6">
        <ScrollReveal>
          <div className="text-center mb-16 animate-reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Des tarifs adaptés à votre croissance</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-[600px] mx-auto text-lg mb-10">
              Augmentez vos revenus sans augmenter votre charge de travail. Choisissez le plan qui vous ressemble.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-bold ${!isAnnual ? 'text-foreground' : 'text-slate-500'}`}>Mensuel</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-14 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full p-1 transition-colors"
                title="Toggle billing period"
              >
                <div className={`w-6 h-6 bg-brand-emerald rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-bold ${isAnnual ? 'text-foreground' : 'text-slate-500'}`}>
                Annuel <span className="text-brand-emerald ml-1 text-xs px-2 py-0.5 bg-brand-emerald/10 rounded-full">-20%</span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} stagger={i * 0.2} className="h-full">
              <div 
                className={`glass-card p-10 rounded-[32px] relative flex flex-col h-full animate-reveal ${plan.popular ? 'border-brand-emerald shadow-[0_0_40px_rgba(16,185,129,0.15)] scale-105 z-10' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-emerald text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-float">
                    Le plus populaire
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-foreground mb-4">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">
                    {plan.price === "Sur Devis" ? plan.price : isAnnual ? Math.floor(parseInt(plan.price) * 0.8) : plan.price}
                  </span>
                  {plan.price !== "Sur Devis" && (
                    <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{isAnnual ? 'DH / AN' : 'DH / MOIS'}</span>
                  )}
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-brand-emerald mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href={plan.name === "Enterprise" ? "mailto:contact@aqarbot.ma" : "/auth/register"}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 text-center block ${plan.popular ? 'bg-brand-emerald text-black shadow-xl hover:shadow-brand-emerald/30 hover:scale-[1.02]' : 'bg-neutral-100 dark:bg-white/5 text-foreground hover:bg-neutral-200 dark:hover:bg-white/10'}`}
                >
                  {plan.name === "Enterprise" ? "Contactez-nous" : "S'abonner"}
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
