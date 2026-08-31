'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, ArrowUpRight, CheckCircle2, ChevronDown, Check, Server, Building2, MapPin, Search } from 'lucide-react';
import StructuredData from '@/components/StructuredData';
import Features from '@/components/Features';

function useOnScreen(ref: React.RefObject<Element | null>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIntersecting(true);
      },
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, rootMargin]);
  return isIntersecting;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef<any>(null);
  const isIntersecting = useOnScreen(ref, '-50px');
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out ${isIntersecting ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="bg-[#0B1120] text-slate-100 min-h-screen selection:bg-[#6EE7B7]/30">
      <StructuredData />

      {/* ─── 1. HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden">
        
        {/* Subtle Background Grid Element (matching exactly) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Ambient Glows */}
        <div 
          className="absolute top-0 right-1/4 translate-x-1/4 pointer-events-none transition-transform duration-75 ease-out"
          style={{ transform: `translateX(25%) translateY(${scrollY * 0.4}px)`, opacity: Math.max(0, 1 - scrollY / 700) }}
        >
          <div className="w-[800px] h-[800px] bg-gradient-to-br from-[#6EE7B7]/10 to-transparent blur-[120px] rounded-full opacity-60" />
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* ================ LEFT COLUMN ================ */}
          <div className="flex flex-col text-left">
            <Reveal delay={300}>
              <h1 className="text-[clamp(2.2rem,6vw,3.8rem)] font-medium leading-[1.05] tracking-tight mb-5 text-white">
                La Première<br />
                Plateforme SaaS<br />
                Immobilière<br />
                <span className="text-[#6EE7B7] relative inline-block">
                  Pilotée par l'IA
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-yellow-500/70" />
                </span> au Maroc
              </h1>
            </Reveal>

            <Reveal delay={500}>
              <p className="text-sm md:text-base text-slate-400 max-w-lg font-normal leading-relaxed mb-8">
                AqarBot transforme chaque message en opportunité. Qualifiez, assignez et faites avancer vos prospects — avant même que votre café ne refroidisse.
              </p>
            </Reveal>

            {/* Filter Bar */}
            <Reveal delay={700}>
              <div className="w-full bg-[#0d1624] border border-slate-800 rounded p-4 md:p-5 shadow-2xl flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 mb-4">
                  <div className="flex-1 px-3 py-2 sm:py-0">
                    <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-2 block">Type de bien</label>
                    <div className="relative">
                      <select className="w-full bg-transparent text-slate-200 text-sm font-medium appearance-none focus:outline-none cursor-pointer">
                        <option>Appartement</option>
                        <option>Villa</option>
                        <option>Plateau Bureau</option>
                        <option>Terrain</option>
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 sm:py-0">
                    <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-2 block">Ville</label>
                    <div className="relative">
                      <select className="w-full bg-transparent text-slate-200 text-sm font-medium appearance-none focus:outline-none cursor-pointer">
                        <option>Meknès</option>
                        <option>Casablanca</option>
                        <option>Tanger</option>
                        <option>Marrakech</option>
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 sm:py-0">
                    <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-2 block">Budget Max - MAD</label>
                    <input type="text" defaultValue="1 500 000" className="w-full bg-transparent text-slate-200 text-sm font-medium focus:outline-none" />
                  </div>
                </div>
                <button className="w-full bg-[#6EE7B7] text-[#0B1121] text-[11px] font-black tracking-[0.15em] uppercase py-4 flex items-center justify-center gap-2 hover:bg-[#4ade80] transition-colors rounded-sm shadow-[0_0_20px_rgba(110,231,183,0.2)]">
                  TESTER LA QUALIFICATION IA <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </Reveal>
          </div>

          {/* ================ RIGHT COLUMN : RADAR UI (desktop only) ================ */}
          <div className="hidden lg:flex items-center justify-center relative min-h-[500px] xl:min-h-[600px] scale-90 xl:scale-100">
            <Reveal delay={900} className="relative w-full h-full flex items-center justify-center">
              
              {/* Radar Rings */}
              <div className="absolute w-[800px] h-[800px] border border-slate-800/40 rounded-full" />
              <div className="absolute w-[600px] h-[600px] border border-slate-700/50 rounded-full" />
              <div className="absolute w-[400px] h-[400px] border border-slate-600/50 rounded-full" />
              <div className="absolute w-[250px] h-[250px] border border-emerald-900/40 rounded-full" />
              
              {/* Radar dots */}
              <div className="absolute w-2 h-2 rounded-full bg-[#6EE7B7] shadow-[0_0_10px_#6EE7B7] top-[30%] right-[15%]" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_10px_#EAB308] bottom-[15%] left-[25%]" />

              {/* Center Brain Core */}
              <div className="absolute w-44 h-44 bg-gradient-to-b from-[#0d1c25] to-[#070b13] border border-[#6EE7B7]/20 rounded-full flex flex-col items-center justify-center z-20 shadow-[0_0_40px_rgba(110,231,183,0.1)]">
                <span className="relative flex h-14 w-14 mb-4">
                  <span className="animate-[ping_2s_ease-out_infinite] absolute inline-flex h-full w-full rounded-full bg-[#6EE7B7] opacity-20"></span>
                  <img src="/logo-icon.png" alt="Aqarbot Core" className="relative inline-flex h-full w-full object-contain drop-shadow-[0_0_15px_rgba(110,231,183,0.5)]" />
                </span>
                <p className="text-white text-xs font-bold mb-1">Aqar Intelligence</p>
                <p className="text-[#6EE7B7]/70 text-[8px] uppercase tracking-widest font-black">En écoute · 24/7</p>
              </div>

              {/* Floating Widget 1: Signal Entrant */}
              <div className="absolute top-[20%] left-[5%] z-30 bg-[#0d1624] border border-slate-700/50 p-4 rounded-sm shadow-xl backdrop-blur-md animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] animate-pulse" />
                  <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Signal Entrant</span>
                </div>
                <p className="text-slate-100 text-sm font-medium">WhatsApp · Casablanca</p>
              </div>

              {/* Floating Widget 2: Score IA */}
              <div className="absolute bottom-[20%] right-[-5%] z-30 bg-[#0d1624] border border-yellow-500/30 p-4 rounded-sm shadow-xl backdrop-blur-md animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  <span className="text-[9px] text-yellow-500 font-bold tracking-widest uppercase">Score IA</span>
                </div>
                <p className="text-slate-100 text-3xl font-medium tracking-tight">94<span className="text-sm text-slate-500">/100</span></p>
              </div>

            </Reveal>
          </div>

        </div>
      </section>

      <section className="py-14 md:py-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative border-t border-slate-900/50">
        <div className="max-w-[1400px] mx-auto">
          <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-end">
            <div>
              <Reveal delay={100} className="flex items-end gap-6 mb-8 group">
                <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">01</span>
                <div className="flex flex-col pb-1">
                  <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                  <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">Le Problème N'est Pas Le Volume</span>
                </div>
              </Reveal>
              <h2 className="text-2xl md:text-4xl lg:text-[3.5rem] font-medium leading-[1.15] tracking-tight">
                <span className="text-white">Les agences ne manquent pas de leads.</span>{' '}
                <span className="text-slate-500">Elles manquent de temps pour les comprendre.</span>
              </h2>
            </div>
            <div className="pb-4">
              <p className="text-slate-400 text-sm md:text-base max-w-sm leading-relaxed">
                Un message ignoré à 22h devient le mandat d'une autre agence demain matin. AqarBot installe une intelligence calme entre votre marché et votre équipe.
              </p>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 border border-slate-800 rounded-sm bg-[#0d1624]">
              {[
                { n: "01", t: "Chaque lead est lu", d: "AqarBot comprend le besoin derrière chaque message WhatsApp, Instagram ou formulaire.", i: <MessageSquare className="w-5 h-5 text-[#6EE7B7]" /> },
                { n: "02", t: "Chaque intention est scorée", d: "Un score vivant, contextualisé par le budget, la ville, le timing et la motivation réelle.", i: <Search className="w-5 h-5 text-[#6EE7B7]" /> },
                { n: "03", t: "Chaque agent sait quoi faire", d: "La bonne opportunité arrive à la bonne personne, avec le contexte qui fait gagner la signature.", i: <CheckCircle2 className="w-5 h-5 text-[#6EE7B7]" /> }
              ].map((c, i) => (
                <div key={i} className="p-10 flex flex-col hover:bg-slate-800/30 transition-colors">
                  <div className="mb-12 flex justify-between items-start">
                    <div>{c.i}</div>
                    <span 
                      className="text-transparent text-5xl font-black tracking-tighter opacity-80"
                      style={{ WebkitTextStroke: '1.5px #eab308' }}
                    >
                      {c.n}
                    </span>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-white text-sm tracking-wide font-bold">{c.t}</h3>
                  </div>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[250px]">{c.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SECTION 02: LES BIENS NE SONT PAS DES LIGNES ─────────────────────────────── */}
      <section className="py-14 md:py-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative border-t border-slate-900/50">
        <div className="max-w-[1400px] mx-auto">
          <Reveal className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <Reveal delay={100} className="flex items-end gap-6 mb-6 group">
                <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">02</span>
                <div className="flex flex-col pb-1">
                  <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                  <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">Les Biens Ne Sont Pas Des Lignes</span>
                </div>
              </Reveal>
              <h2 className="text-2xl md:text-4xl lg:text-[3.5rem] font-medium leading-[1.15] tracking-tight text-white mb-2">
                Ils deviennent des opportunités{' '}
                <span className="text-[#6EE7B7]">au moment où elles comptent.</span>
              </h2>
            </div>
            <a href="/biens" className="text-yellow-500 text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-2 hover:text-white transition-colors">
              VOIR LE FLUX AGENCE <ArrowUpRight className="w-4 h-4" />
            </a>
          </Reveal>

          <Reveal delay={200} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { image: "/appartement.jpg", badge: "MATCH QUALIFIÉ", gradient: "from-[#FBBF24]/40 via-[#FBBF24]/10", ia: "94%", type: "Appartement · 3 pièces", loc: "HAMRIA · MEKNÈS", price: "1 240 000 MAD", details: "118 m² · 2e étage · Terrasse" },
              { image: "/villa.jpg", badge: "INTÉRÊT CONFIRMÉ", gradient: "from-[#6EE7B7]/40 via-[#6EE7B7]/10", ia: "89%", type: "Villa · 6 pièces", loc: "ANFA · CASABLANCA", price: "5 800 000 MAD", details: "340 m² · Jardin · Piscine" },
              { image: "/bereau ,plateau .jpeg", badge: "BESOIN DÉTECTÉ", gradient: "from-slate-300/40 via-slate-300/10", ia: "86%", type: "Bureau · Plateau", loc: "MALABATA · TANGER", price: "18 500 MAD / mois", details: "156 m² · Vue mer · Parking" }
            ].map((p, i) => (
              <div key={i} className="bg-[#0d1624] border border-slate-800 rounded-sm overflow-hidden flex flex-col group cursor-pointer hover:border-slate-600 transition-colors">
                <div className="h-48 w-full relative flex flex-col justify-between p-4 overflow-hidden">
                  <img src={p.image} alt={p.type} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} to-transparent mix-blend-overlay`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1624] via-transparent to-transparent opacity-100" />
                  
                  <div className="relative z-10 self-start px-2 py-1 bg-[#0B1120]/80 border border-slate-700 text-[8px] text-white font-black uppercase tracking-widest backdrop-blur-sm">{p.badge}</div>
                  <div className="relative z-10 self-end px-3 py-1 bg-[#0B1120] border border-yellow-500/30 text-[9px] text-yellow-500 font-black uppercase tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-sm">
                    IA MATCH <span className="text-white text-xs">{p.ia}</span>
                  </div>
                </div>
                <div className="p-6 pb-5 flex flex-col flex-1 border-t border-slate-800 relative z-10 bg-[#0d1624]">
                  <p className="text-[#6EE7B7] text-[9px] font-black uppercase tracking-widest mb-2 flex justify-between items-center w-full">
                    <span>{p.loc}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                  </p>
                  <h3 className="text-white text-lg font-bold mb-8 tracking-wide">{p.type}</h3>
                  <div className="mt-auto flex justify-between items-end">
                    <div>
                      <p className="text-white font-black text-xl mb-1">{p.price}</p>
                      <p className="text-slate-500 text-[10px] font-medium">{p.details}</p>
                    </div>
                    <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest">ACTIF</span>
                  </div>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={400} className="w-full border border-slate-800 rounded-sm bg-[#0d1624] p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest">
             <div className="flex items-center gap-3 text-slate-400 text-[9px]">
               <Search className="w-4 h-4 text-[#6EE7B7]" /> 2 418 BIENS ACTUELLEMENT INDEXÉS PAR AQARBOT
             </div>
             <div className="text-slate-600 text-[9px] flex items-center gap-2">
               MISE À JOUR LIVE · 00:42:15
             </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FEATURES: EXPLORER LE SYSTÈME ───────────────────────────────────────── */}
      <Features />

      {/* ─── SECTION 03: LA SALLE DES MACHINES ─────────────────────────────── */}
      <section className="py-14 md:py-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative border-t border-slate-900/50">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <Reveal className="flex flex-col">
            <Reveal delay={100} className="flex items-end gap-6 mb-8 group">
              <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">03</span>
              <div className="flex flex-col pb-1">
                <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">La Salle Des Machines</span>
              </div>
            </Reveal>
            <h2 className="text-2xl md:text-4xl lg:text-[3.5rem] font-medium leading-[1.15] tracking-tight mb-8">
              <span className="text-white">Votre équipe.</span>{' '}
              <span className="text-slate-500">Augmentée, jamais remplacée.</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-sm leading-relaxed mb-10">
              Le CRM AqarBot ne vous donne pas plus de dashboards. Il vous donne de l'avance sur la prochaine conversation.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-10">
              <button className="bg-[#6EE7B7] text-[#0B1120] text-[10px] font-black uppercase tracking-[0.15em] px-8 py-4 rounded-sm hover:bg-white transition-colors">
                QUALIFICATION IA
              </button>
              <button className="bg-transparent border border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-[0.15em] px-8 py-4 rounded-sm hover:bg-slate-800 transition-colors">
                HUB LIVE TAKEOVER
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#6EE7B7]" /></div>
                 Détection automatique du besoin et du budget.
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#6EE7B7]" /></div>
                 Score d'intention actualisé à chaque réponse.
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-[#6EE7B7]" /></div>
                 Distribution intelligente à votre meilleur agent.
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[550px] flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-[#6EE7B7]/5 to-transparent rounded-xl" />
             <div className="relative w-full max-w-md lg:max-w-xl aspect-[1.1] bg-[#0d1624] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
               <div className="h-10 border-b border-slate-800 flex items-center px-4 justify-between bg-[#131b2c]">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                 </div>
                 <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">APP.AQARBOT.MA / AGENCE</div>
                 <div className="w-4 h-4 rounded-full bg-slate-800" />
               </div>
               
               <div className="flex flex-1">
                 <div className="w-32 border-r border-slate-800 p-4 flex flex-col gap-6 bg-[#0B1120]">
                    <div className="flex items-center gap-2 mb-4">
                      <img src="/logo-icon.png" className="w-5 h-5 opacity-80" />
                      <span className="text-[9px] font-bold text-white">aqarbot</span>
                    </div>
                    <div className="flex flex-col gap-4 text-[9px] font-bold text-slate-500">
                      <div className="px-2 py-2 bg-[#6EE7B7]/10 text-[#6EE7B7] rounded-sm flex items-center gap-2"><CheckCircle2 className="w-3 h-3"/> Vue d'ensemble</div>
                      <div className="px-2 py-1.5 flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Leads entrants</div>
                      <div className="px-2 py-1.5 flex items-center gap-2"><Search className="w-3 h-3"/> Biens qualifiés</div>
                      <div className="px-2 py-1.5 flex items-center gap-2"><Search className="w-3 h-3"/> Équipe</div>
                    </div>
                 </div>
                 
                 <div className="flex-1 p-6 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                     <div>
                       <p className="text-[8px] font-black uppercase tracking-widest text-[#6EE7B7] mb-1">VUE D'ENSEMBLE</p>
                       <h3 className="text-2xl font-medium text-white">Bonjour, Yasmine</h3>
                     </div>
                     <button className="px-3 py-1 border border-slate-700 text-slate-300 text-[8px] font-bold uppercase rounded-sm">○ Aide</button>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-4 mb-8">
                     <div className="bg-[#0B1120] border border-slate-800 rounded-sm p-4">
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide mb-3">Leads aujourd'hui</p>
                       <p className="text-2xl font-black text-white mb-2">42</p>
                     </div>
                     <div className="bg-[#0B1120] border border-slate-800 rounded-sm p-4 relative">
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide mb-3">Score moyen</p>
                       <p className="text-2xl font-black text-[#6EE7B7] mb-2">76.2</p>
                       <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-slate-800"><div className="h-full bg-[#6EE7B7] w-[76%]" /></div>
                     </div>
                     <div className="bg-[#0B1120] border border-slate-800 rounded-sm p-4 relative">
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide mb-3">Réponse médiane</p>
                       <p className="text-2xl font-black text-white mb-2">00:28</p>
                       <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-slate-800"><div className="h-full bg-yellow-500 w-[20%]" /></div>
                     </div>
                   </div>

                   <div className="flex justify-between items-center mb-4">
                     <h4 className="text-[9px] font-bold uppercase tracking-widest text-white">Derniers leads qualifiés</h4>
                     <span className="text-[8px] font-bold text-[#6EE7B7] uppercase tracking-widest">VOIR TOUT</span>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                     {[ { l: "SB", n: "Salma Benjelloun", b: "Appartement · Anfa", s: "94/100", c: "bg-[#FBBF24] text-[#0B1120]" },
                        { l: "KA", n: "Karim Azzouzi", b: "Villa · Aïn Diab", s: "88/100", c: "bg-slate-700 text-slate-300" },
                        { l: "NC", n: "Nora Chraibi", b: "Bureau · Agdal", s: "81/100", c: "bg-slate-700 text-slate-300" } 
                      ].map((u, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-[#0B1120] border border-slate-800 rounded-sm">
                         <div className="flex items-center gap-4">
                           <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black uppercase shadow-lg ${u.c}`}>{u.l}</div>
                           <div>
                             <p className="text-white text-xs font-bold mb-0.5">{u.n}</p>
                             <p className="text-slate-500 text-[9px] font-medium tracking-wide">{u.b}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className="text-[#6EE7B7] text-xs font-black">{u.s}</span>
                           <ArrowUpRight className="w-3 h-3 text-slate-600" />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          </Reveal>

        </div>
      </section>

      {/* ─── SECTION 04: LA MESURE DU CALME (METRICS) ─────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-gradient-to-br from-[#0B1120] to-[#05080f] relative border-t border-slate-900/50">
         <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-[#6EE7B7]/10 blur-[150px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
         <div className="max-w-[1400px] mx-auto">
            <Reveal className="mb-20 pt-10">
              <Reveal delay={100} className="flex items-end gap-6 mb-8 group">
                <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">04</span>
                <div className="flex flex-col pb-1">
                  <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                  <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">La Mesure Du Calme</span>
                </div>
              </Reveal>
              <h2 className="text-3xl md:text-[3rem] font-medium leading-[1.1] tracking-tight text-white mb-2 max-w-2xl">
                Des chiffres qui changent <br/>la façon de travailler.
              </h2>
            </Reveal>

            <div className="w-full h-px bg-slate-800/80 mb-16" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 pb-16">
              {[
                { value: "+40%", label: "Taux de Conversion", desc: "Plus de conversations deviennent des rendez-vous." },
                { value: "< 30s", label: "Prise en Charge", desc: "Le délai médian entre le message et la première action." },
                { value: "100%", label: "Isolation des Données", desc: "Chaque agence garde son marché, ses leads, son avantage." }
              ].map((metric, i) => (
                <Reveal key={i} delay={i * 150} className="flex flex-col">
                  <div className="text-[3.5rem] sm:text-[4rem] lg:text-[6rem] font-medium text-[#6EE7B7] tracking-tighter leading-none mb-6">{metric.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 mb-4">{metric.label}</div>
                  <div className="text-sm font-medium text-slate-400 leading-relaxed max-w-[250px]">{metric.desc}</div>
                </Reveal>
              ))}
            </div>
            
            <div className="w-full h-px bg-slate-800/80 mt-2" />
          </div>
      </section>

      {/* ─── SECTION 05: TARIFS (NEW DESIGN) ─────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative">
        <div className="max-w-[1400px] mx-auto">
          
          <Reveal>
            {/* Top Header Bar */}
            <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mb-20">
              <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.2em]">Tarifs - Trois Niveaux</span>
              <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.2em]">Essai 14 Jours - Sans CB</span>
            </div>

            {/* Main Headline & Subtitle */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12">
              <h2 className="text-[2.8rem] sm:text-[4rem] md:text-[5rem] font-bold leading-[0.9] tracking-tighter text-white">
                CHOISISSEZ<br />
                VOTRE <span className="text-[#6EE7B7] relative inline-block">NIVEAU.<span className="absolute bottom-1 left-0 w-full h-[4px] bg-[#6EE7B7] opacity-80"></span></span>
              </h2>
              <div className="max-w-sm pb-4">
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  Avec Agence, votre site web immobilier est offert : créé, connecté au CRM, hébergé et maintenu.<br />
                  Essai 14 jours sans carte bancaire.
                </p>
              </div>
            </div>

            <p className="text-slate-500 text-[10px] mb-8 font-medium">Prix facturés en MAD - montants indicatifs.</p>
          </Reveal>

          {/* Pricing Linked Cards */}
          <Reveal delay={200} className="w-full border border-slate-800 rounded-lg overflow-hidden flex flex-col lg:flex-row bg-[#0B1120]">
            
            {/* Column 1 - SOLO */}
            <div className="flex-1 p-10 md:p-14 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-start bg-[#0B1522]">
              <div className="text-slate-500 text-sm font-black mb-12">01</div>
              <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Agent Solo - Indépendant</div>
              <h3 className="text-white text-3xl font-black uppercase mb-12 tracking-tight">Solo</h3>
              
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-white text-7xl font-bold tracking-tighter leading-none">499</span>
                <span className="text-slate-400 text-sm font-medium">DH /mois</span>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-12">≈ 49 €</div>
              
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mb-8 flex-grow">
                Le CRM complet pour l'agent indépendant : contacts WhatsApp, biens, matching, pipeline et agenda.
              </p>

              <button className="w-full py-4 px-6 border border-slate-700 bg-[#0d1624] hover:bg-slate-800 transition-colors text-white text-sm font-semibold rounded-md">
                Démarrer gratuitement
              </button>
            </div>

            {/* Column 2 - AGENCE (Highlighted) */}
            <div className="flex-1 p-10 md:p-14 border-b md:border-b-0 md:border-r border-[#6EE7B7]/20 flex flex-col bg-[#112a28] relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#6EE7B7]/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start mb-12 relative z-10 w-full">
                <div className="text-[#6EE7B7] text-sm font-black">02</div>
                <div className="bg-[#6EE7B7] text-[#0B1120] text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(110,231,183,0.3)]">
                  <span className="text-[10px]">★</span> Recommandé
                </div>
              </div>
              
              <div className="text-[#6EE7B7] text-[9px] font-black uppercase tracking-[0.2em] mb-2 relative z-10">Agence - 3 Agents Inclus</div>
              <h3 className="text-white text-3xl font-black uppercase mb-12 tracking-tight relative z-10">Agence</h3>
              
              <div className="mb-2 flex items-baseline gap-2 relative z-10">
                <span className="text-[#6EE7B7] text-7xl font-bold tracking-tighter leading-none">1290</span>
                <span className="text-slate-400 text-sm font-medium">DH /mois</span>
              </div>
              <div className="text-[#6EE7B7]/60 text-xs font-medium mb-12 relative z-10">≈ 129 €</div>
              
              <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-[280px] relative z-10 mb-8">
                Le CRM d'équipe pour suivre, collaborer et qualifier à plusieurs sur un dashboard unifié.
              </p>

              {/* Special Featured Box */}
              <div className="mt-8 mb-10 w-full max-w-[320px] bg-[#0c1c20] border border-slate-700/50 rounded-md p-6 relative z-10 flex-grow">
                <p className="text-[#6EE7B7] text-[9px] font-black uppercase tracking-[0.2em] mb-3">Inclus avec Agence</p>
                <h4 className="text-white text-lg font-semibold tracking-tight mb-2">Site web offert</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">Créé, connecté au CRM, hébergé et maintenu.</p>
              </div>

              <button className="w-full py-4 px-6 bg-[#6EE7B7] hover:bg-[#4ade80] transition-colors text-[#0B1120] text-xs font-black uppercase tracking-[0.15em] rounded-md shadow-[0_0_20px_rgba(110,231,183,0.2)] relative z-10">
                DÉMARRER L'ESSAI
              </button>
            </div>

            {/* Column 3 - SUR-MESURE */}
            <div className="flex-1 p-10 md:p-14 flex flex-col items-start bg-[#0B1522]">
              <div className="text-slate-500 text-sm font-black mb-12">03</div>
              <div className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Tout Métier Immobilier</div>
              <h3 className="text-white text-3xl font-black uppercase mb-12 tracking-tight">Sur-Mesure</h3>
              
              <div className="mb-2">
                <span className="text-white text-6xl font-bold tracking-tighter leading-none">Devis</span>
              </div>
              <div className="text-slate-500 text-xs font-medium mb-12 mt-4 inline-block">Mise en place dès 20 000 MAD</div>
              
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-[280px] mb-8 flex-grow">
                Votre logiciel façonné par notre équipe sur notre socle CRM. Votre métier définit le produit, maintenu à vos côtés.
              </p>

              <button className="w-full py-4 px-6 border border-slate-700 bg-[#0d1624] hover:bg-slate-800 transition-colors text-white text-sm font-semibold rounded-md">
                Planifier un appel
              </button>
            </div>
            
          </Reveal>
        </div>
      </section>

      {/* ─── SECTION 06: PAS DE SURPRISE AU CONTRAT (CTA) ─────────────────────────────── */}
      <section className="pt-24 pb-12 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative">
        <div className="max-w-[1400px] mx-auto">
          <Reveal className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16">
             <div>
                <Reveal delay={100} className="flex items-end gap-6 mb-8 group">
                  <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">06</span>
                  <div className="flex flex-col pb-1">
                    <div className="h-px w-12 bg-slate-800 mb-2 transition-all duration-700 group-hover:w-20 group-hover:bg-yellow-500/50" />
                    <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">Pas De Surprise Au Contrat</span>
                  </div>
                </Reveal>
                <h2 className="text-4xl md:text-[3.5rem] font-medium leading-[1.1] tracking-tight">
                  <span className="text-white">Commencez par</span><br />
                  <span className="text-yellow-500">une vraie conversation.</span>
                </h2>
             </div>
             <div className="flex flex-col pb-2 pl-0 md:pl-12 md:border-l border-slate-800 max-w-md">
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">Chaque agence a son rythme, ses villes, son volume. On commence par comprendre le vôtre.</p>
               <a href="mailto:contact@aqarbot.ma" className="text-[#6EE7B7] text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-2 hover:text-white transition-colors">
                 PARLER À L'ÉQUIPE AQARBOT <ArrowUpRight className="w-4 h-4" />
               </a>
             </div>
          </Reveal>

          <Reveal delay={200} className="w-full rounded-sm border border-slate-800 bg-[#0d1624] overflow-hidden flex flex-col md:flex-row mb-32">
             <div className="p-10 lg:p-16 flex-1">
               <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#6EE7B7] mb-12 flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-[#6EE7B7] shadow-[0_0_10px_#6EE7B7]" /> POUR LES AGENCES QUI VEULENT GARDER UNE LONGUEUR D'AVANCE
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm text-slate-300 font-medium">
                 <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7]" /> Qualification multicanale</div>
                 <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7]" /> CRM agence en temps réel</div>
                 <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7]" /> Données cloisonnées</div>
                 <div className="flex items-center gap-3"><Check className="w-4 h-4 text-[#6EE7B7]" /> Déploiement accompagné</div>
               </div>
             </div>
             
             <div className="p-10 lg:p-16 bg-[#131d2c] flex flex-col justify-center min-w-[400px]">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">VOTRE PROCHAIN AVANTAGE</p>
               <h3 className="text-white text-3xl md:text-3xl font-medium tracking-tight mb-10">L'intelligence<br/>dans votre équipe.</h3>
               <a href="/auth/login" className="w-full bg-[#6EE7B7] text-[#0B1120] text-[10px] font-black uppercase tracking-[0.15em] py-5 flex items-center justify-center gap-2 hover:bg-[#4ade80] transition-colors rounded-sm shadow-[0_0_20px_rgba(110,231,183,0.15)]">
                  ENTRER DANS L'ESPACE AGENCE <ArrowUpRight className="w-4 h-4" />
               </a>
             </div>
          </Reveal>

        </div>
      </section>

    </main>
  );
}
