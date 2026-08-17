'use client';

import React from 'react';
import { Star } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Pricing() {
  return (
    <section id="prix" className="w-full relative pt-20 pb-32 text-slate-100 bg-[#0B1120] border-t border-slate-800">
      <div className="container mx-auto px-6 max-w-7xl pt-10">
        <ScrollReveal>
          {/* Top mini header */}
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] mb-10 border-b border-slate-800 pb-4 text-[#6EE7B7]">
            <span>Tarifs · Trois niveaux</span>
            <span>Essai 14 Jours · Sans CB</span>
          </div>

          {/* Massive Title Block */}
          <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16">
            <h2 className="text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.85] tracking-tighter uppercase text-white">
              Choisissez<br />
              votre <span className="text-[#6EE7B7] relative inline-block">niveau.<span className="absolute -bottom-1 left-0 w-full h-[2px] bg-yellow-500/70" /></span>
            </h2>
            <div className="max-w-xs text-sm font-medium text-slate-400 leading-relaxed mb-4">
              Avec Agence, votre site web immobilier est offert : créé, connecté au CRM, hébergé et maintenu. Essai 14 jours sans carte bancaire.
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-bold mb-4">Prix facturés en MAD · montants indicatifs.</p>
        </ScrollReveal>

        <ScrollReveal stagger={0.2} delay={0.2}>
          {/* Pricing Cards Container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 border border-slate-800 rounded-lg overflow-hidden bg-[#0d1624] shadow-2xl">

            {/* CARD 1 : SOLO */}
            <div className="p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col hover:bg-slate-800/30 transition-colors">
              <span className="text-xs font-black text-slate-500 mb-12">01</span>
              <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Agent solo - indépendant</p>
              <h3 className="text-[2.5rem] font-medium tracking-tight mb-8 leading-none text-white">Solo</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-6xl font-black tracking-tighter text-white">499</span>
                <span className="text-sm font-bold text-slate-500">DH /mois</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 mb-8">≈ 49 €</p>
              <p className="text-[13px] font-medium text-slate-400 leading-relaxed max-w-[250px] mb-12">
                Le CRM complet pour l'agent indépendant : contacts WhatsApp, biens, matching, pipeline et agenda.
              </p>

              <div className="mt-auto">
                <a href="/auth/register" className="w-full flex items-center justify-center py-4 rounded-sm border border-slate-700 font-bold text-sm text-slate-300 hover:bg-[#6EE7B7] hover:text-[#0B1120] hover:border-[#6EE7B7] transition-colors cursor-pointer">
                  Démarrer gratuitement
                </a>
              </div>
            </div>

            {/* CARD 2 : AGENCE */}
            <div className="p-10 lg:p-12 bg-[#6EE7B7]/10 text-white flex flex-col relative shadow-[0_0_50px_rgba(110,231,183,0.1)] z-10 lg:scale-[1.02] border border-[#6EE7B7]/50 rounded-lg" style={{ margin: '-1px 0' }}>
              <div className="flex justify-between items-start mb-12">
                <span className="text-xs font-black text-[#6EE7B7]">02</span>
                <div className="bg-[#6EE7B7] text-[#0B1120] text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm flex items-center gap-1.5 shadow-md">
                  <Star className="w-3 h-3 fill-[#0B1120]" /> Recommandé
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-[#6EE7B7] mb-2">Agence - 3 agents inclus</p>
              <h3 className="text-[2.5rem] font-medium tracking-tight mb-8 leading-none text-white">Agence</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-6xl font-black tracking-tighter text-[#6EE7B7]">1290</span>
                <span className="text-sm font-bold text-[#6EE7B7]/50">DH /mois</span>
              </div>
              <p className="text-[10px] font-bold text-[#6EE7B7]/40 mb-8">≈ 129 €</p>
              <p className="text-[13px] font-medium text-slate-300 leading-relaxed max-w-[250px] mb-8">
                Le CRM d'équipe pour suivre, collaborer et qualifier à plusieurs sur un dashboard unifié.
              </p>

              <div className="bg-[#0B1120]/50 border border-[#6EE7B7]/20 rounded-md p-5 mb-8">
                <p className="text-[9px] font-black text-[#6EE7B7] uppercase tracking-wider mb-2">Inclus avec agence</p>
                <p className="text-lg font-medium mb-1 text-white">Site web offert</p>
                <p className="text-xs text-slate-400 font-medium">Créé, connecté au CRM, hébergé et maintenu.</p>
              </div>

              <div className="mt-auto">
                <a href="/auth/register" className="w-full flex items-center justify-center py-4 rounded-sm bg-[#6EE7B7] text-[#0B1120] font-black uppercase tracking-[0.15em] text-[11px] hover:bg-white transition-colors cursor-pointer shadow-[0_0_20px_rgba(110,231,183,0.3)] active:scale-95">
                  Démarrer l'essai
                </a>
              </div>
            </div>

            {/* CARD 3 : SUR-MESURE */}
            <div className="p-10 lg:p-12 flex flex-col hover:bg-slate-800/30 transition-colors border-l border-slate-800">
              <span className="text-xs font-black text-slate-500 mb-12">03</span>
              <p className="text-[9px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Tout métier immobilier</p>
              <h3 className="text-[2.5rem] font-medium tracking-tight mb-8 leading-none text-white">Sur-mesure</h3>
              <div className="flex items-baseline gap-2 mb-2 mt-4">
                <span className="text-6xl font-black tracking-tighter text-white">Devis</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 mb-8 mt-2">Mise en place dès 20 000 MAD</p>
              <p className="text-[13px] font-medium text-slate-400 leading-relaxed max-w-[250px] mb-12 mt-2">
                Votre logiciel façonné par notre équipe sur notre socle CRM. Votre métier définit le produit, maintenu à vos côtés.
              </p>

              <div className="mt-auto">
                <a href="mailto:contact@aqarbot.ma" className="w-full flex items-center justify-center py-4 rounded-sm border border-slate-700 font-bold text-sm text-slate-300 hover:bg-[#6EE7B7] hover:text-[#0B1120] hover:border-[#6EE7B7] transition-colors cursor-pointer">
                  Planifier un appel
                </a>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
