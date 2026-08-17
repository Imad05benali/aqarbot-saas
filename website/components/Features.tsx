'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const features = [
  {
    number: '01',
    title: 'Qualification IA WhatsApp',
    tagline: 'Répondez à chaque lead. Automatiquement.',
    description: 'Notre IA conduit une conversation structurée en Darija et Français pour collecter le nom, le type de bien, la ville, le quartier et le budget — sans intervention humaine.',
    details: [
      { label: 'Réponse instantanée', desc: 'Moins de 3 secondes entre le message du prospect et la réponse IA.' },
      { label: 'Darija & Français', desc: 'Compréhension native des expressions locales marocaines et de leurs variantes.' },
      { label: 'Collecte structurée', desc: 'Chaque lead est enregistré proprement dans votre CRM.' },
      { label: 'Disponible 24/7', desc: "Votre agence ne dort jamais. L'IA répond même la nuit et les weekends." },
    ],
    mockup: (
      <div className="bg-[#0d1a0d] border border-brand-emerald/20 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
          <span className="text-xs text-brand-emerald font-bold uppercase tracking-widest">Chat WhatsApp Live</span>
        </div>
        <div className="p-5 space-y-3">
          {[
            { from: 'client', msg: 'Salam, bghit appartement f Casa' },
            { from: 'bot', msg: 'Salam ! Quel quartier préférez-vous ?' },
            { from: 'client', msg: 'Maarif wla Bourgogne' },
            { from: 'bot', msg: 'Quel est votre budget approximatif ?' },
            { from: 'client', msg: 'Max 700k' },
            { from: 'bot', msg: "✅ Enregistré ! Un conseiller vous contacte sous 24h." },
          ].map((m, i) => (
            <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm font-medium ${m.from === 'bot' ? 'bg-zinc-800 text-white rounded-tl-none' : 'bg-brand-emerald text-black rounded-tr-none'}`}>
                {m.msg}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'CRM Multi-Tenant',
    tagline: 'Toute votre agence. Un seul écran.',
    description: "Chaque agence dispose d'un espace isolé et sécurisé. Gérez vos leads, leur statut, leurs informations et leur historique — tout en un seul dashboard.",
    details: [
      { label: 'Isolation totale', desc: 'Chaque agence voit uniquement ses propres données. Zéro fuite.' },
      { label: 'Statuts & Pipeline', desc: 'Nouveau, Qualifié, Contacté, Fermé — suivez chaque lead.' },
      { label: 'Filtres avancés', desc: 'Triez par ville, budget, type de bien ou date en quelques clics.' },
      { label: 'Export & rapports', desc: 'Exportez vos leads en CSV et analysez la performance.' },
    ],
    mockup: (
      <div className="bg-[#0d1a0d] border border-brand-emerald/20 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs text-brand-emerald font-bold uppercase tracking-widest">CRM Dashboard</span>
          <span className="text-xs text-slate-500">247 leads actifs</span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { name: 'Rachid Benjelloun', city: 'Casablanca', budget: '800K', status: 'Qualifié', color: 'text-brand-emerald' },
            { name: 'Fatima Zahraoui', city: 'Rabat', budget: '1.2M', status: 'Nouveau', color: 'text-yellow-400' },
            { name: 'Karim Alaoui', city: 'Marrakech', budget: '600K', status: 'Contacté', color: 'text-blue-400' },
            { name: 'Sara Tazi', city: 'Tanger', budget: '500K', status: 'Fermé', color: 'text-slate-500' },
          ].map((lead) => (
            <div key={lead.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs">
              <span className="text-white font-bold w-36 truncate">{lead.name}</span>
              <span className="text-slate-500">{lead.city}</span>
              <span className="text-slate-400">{lead.budget} DH</span>
              <span className={`font-black ${lead.color}`}>{lead.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Hub en Direct',
    tagline: 'Voyez chaque conversion en temps réel.',
    description: "Surveillez toutes les conversations WhatsApp en direct depuis votre dashboard. Intervenez manuellement à tout moment, ou laissez l'IA gérer la suite.",
    details: [
      { label: 'Flux live', desc: 'Chaque nouvelle conversation apparaît instantanément.' },
      { label: 'Prise en main manuelle', desc: "Pausez l'IA et prenez le relais à tout moment." },
      { label: 'Historique complet', desc: 'Chaque échange est archivé et consultable.' },
      { label: 'Alertes intelligentes', desc: "Soyez notifié dès qu'un lead chaud est détecté." },
    ],
    mockup: (
      <div className="bg-[#0d1a0d] border border-brand-emerald/20 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-white font-bold uppercase tracking-widest">Hub en Direct</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { phone: '+212 6XX XXX 001', msg: "Bghit villa f Marrakech...", time: "À l'instant", hot: true },
            { phone: '+212 6XX XXX 042', msg: 'Bonjour, cherche appartement...', time: 'Il y a 3 min', hot: false },
            { phone: '+212 6XX XXX 103', msg: "Mon budget c'est 500K max", time: 'Il y a 7 min', hot: false },
          ].map((conv) => (
            <div key={conv.phone} className={`flex items-center gap-4 p-3 rounded-xl border ${conv.hot ? 'border-brand-emerald/40 bg-brand-emerald/5' : 'border-white/5 bg-zinc-900/40'}`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${conv.hot ? 'bg-brand-emerald animate-pulse' : 'bg-slate-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold">{conv.phone}</p>
                <p className="text-slate-500 text-xs truncate">{conv.msg}</p>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0">{conv.time}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '04',
    title: 'Recherche de Biens IA',
    tagline: 'Trouvez le bon bien. En millisecondes.',
    description: "AqarBot analyse la demande du prospect et recherche instantanément dans votre base de biens les correspondances les plus pertinentes — par ville, quartier, type et budget.",
    details: [
      { label: 'Matching intelligent', desc: 'Croisement automatique entre les critères du prospect et votre stock.' },
      { label: 'Fuzzy Matching', desc: "Insensible aux fautes d'orthographe ou aux variantes de noms de villes." },
      { label: 'Résultats instantanés', desc: 'Moins de 100ms entre la demande et les propositions.' },
      { label: 'Priorité géographique', desc: "Recherche d'abord en ville, puis secteur si nécessaire." },
    ],
    mockup: (
      <div className="bg-[#0d1a0d] border border-brand-emerald/20 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <span className="text-xs text-brand-emerald font-bold uppercase tracking-widest">Résultats IA</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { title: 'Appartement 3 pièces — Maarif', price: '680 000 DH', match: '97%' },
            { title: 'Duplex — Bourgogne', price: '720 000 DH', match: '91%' },
            { title: 'Studio lumineux — Racine', price: '490 000 DH', match: '84%' },
          ].map((bien) => (
            <div key={bien.title} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div>
                <p className="text-white text-xs font-bold">{bien.title}</p>
                <p className="text-brand-emerald text-xs font-black mt-0.5">{bien.price}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-emerald/20 text-brand-emerald text-xs font-black">{bien.match}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: '05',
    title: 'Analytics & Rapports',
    tagline: 'Mesurez. Optimisez. Dominez.',
    description: 'Visualisez la croissance de vos leads, le taux de qualification IA, les villes les plus actives et la performance de votre agence sur les 6 derniers mois.',
    details: [
      { label: 'Graphes en temps réel', desc: 'Courbes de croissance des leads mois par mois.' },
      { label: 'Top villes & secteurs', desc: "Identifiez d'un coup d'œil votre traffic principal." },
      { label: 'Taux de conversion', desc: 'Leads reçus vs qualifiés vs contactés par étape.' },
      { label: 'Prédictions IA', desc: "L'IA prédit les secteurs en hausse pour le prochain trimestre." },
    ],
    mockup: (
      <div className="bg-[#0d1a0d] border border-brand-emerald/20 rounded-2xl overflow-hidden p-5">
        <p className="text-xs text-brand-emerald font-bold uppercase tracking-widest mb-4">Croissance (6 mois)</p>
        <div className="flex items-end gap-2 h-24">
          {[40, 55, 70, 60, 88, 100].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md" style={{ height: `${h}%`, background: i === 5 ? '#10B981' : 'rgba(16,185,129,0.25)' }} />
              <span className="text-[9px] text-slate-600">{['Jan','Fév','Mar','Avr','Mai','Jun'][i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[{ label: 'Leads', value: '247' }, { label: 'Qualifiés', value: '189' }, { label: 'Conv.', value: '76%' }].map((s) => (
            <div key={s.label} className="text-center bg-zinc-900/60 rounded-xl py-3">
              <p className="text-white text-xl font-black">{s.value}</p>
              <p className="text-slate-600 text-[9px] uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const outerRef = useRef<HTMLDivElement>(null);

  // Map scroll position inside the outer tall container → active index
  useEffect(() => {
    const handleScroll = () => {
      const el = outerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // How far we've scrolled INTO the outer container (0 = top, 1 = bottom)
      const scrolled = -rect.top;
      const totalScroll = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
      const index = Math.min(
        features.length - 1,
        Math.floor(progress * features.length)
      );
      setActive(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click sidebar → jump to the right scroll position
  const scrollToFeature = (i: number) => {
    const el = outerRef.current;
    if (!el) return;
    const totalScroll = el.getBoundingClientRect().height - window.innerHeight;
    const target = el.offsetTop + (i / features.length) * totalScroll;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  const f = features[active];

  return (
    // Outer tall container — provides the scrollable height
    <div
      ref={outerRef}
      style={{ height: `${features.length * 100}vh` }}
      className="relative w-full bg-black"
    >
      {/* Section header above sticky area */}
      <div className="container mx-auto px-6 max-w-7xl pt-20 pb-8">
        <p className="text-xs text-brand-emerald font-black uppercase tracking-[0.3em] mb-4">Explorer le système</p>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-[0.9]">
          Choisissez une tâche.<br />
          <span className="text-slate-600">Voyez tout le flux.</span>
        </h2>
      </div>

      {/* Sticky viewport-filling panel */}
      <div className="sticky top-0 h-screen w-full flex overflow-hidden border-t border-white/5">

        {/* LEFT sidebar — fixed inside sticky */}
        <aside className="hidden md:flex w-[280px] shrink-0 border-r border-white/5 bg-black flex-col justify-center px-8 py-10">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-6">
            Explorer&nbsp;
            <span className="text-brand-emerald">
              {String(active + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
            </span>
          </p>

          {/* Progress line */}
          <div className="h-px w-full bg-white/5 mb-8 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-brand-emerald rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((active + 1) / features.length) * 100}%` }}
            />
          </div>

          <nav className="space-y-1">
            {features.map((feat, i) => {
              const isActive = i === active;
              return (
                <button
                  key={feat.number}
                  onClick={() => scrollToFeature(i)}
                  className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-brand-emerald' : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`text-xs font-black tabular-nums ${isActive ? 'text-black/50' : 'text-slate-700'}`}>{feat.number}</span>
                  <span className={`flex-1 font-black text-sm leading-tight ${isActive ? 'text-black' : ''}`}>{feat.title}</span>
                  {isActive && <ArrowRight className="w-4 h-4 text-black shrink-0" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT content — transitions on active change */}
        <div className="flex-1 overflow-hidden bg-[#060f06] flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 px-8 md:px-16 max-w-4xl mx-auto">

            {/* Text block */}
            <div
              key={`text-${active}`}
              className="flex flex-col justify-center"
              style={{ animation: 'featureIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              <p className="text-[10px] text-brand-emerald font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald inline-block" />
                {f.tagline}
              </p>
              <div className="text-[clamp(2rem,4vw,3.5rem)] font-black text-white leading-[0.9] uppercase tracking-tight mb-6">
                {f.title}
              </div>
              <p className="text-slate-400 text-base font-medium leading-relaxed mb-8 max-w-md">
                {f.description}
              </p>
              <div className="space-y-4">
                {f.details.map((d, di) => (
                  <div
                    key={d.label}
                    className="flex gap-4"
                    style={{ animation: `featureIn 0.5s ${di * 80 + 150}ms cubic-bezier(0.22,1,0.36,1) both` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shrink-0 mt-1.5" />
                    <div>
                      <p className="text-white font-black text-sm">{d.label}</p>
                      <p className="text-slate-500 text-sm font-medium">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup block */}
            <div
              key={`mock-${active}`}
              className="flex flex-col justify-center"
              style={{ animation: 'featureInRight 0.5s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              <div className="text-[5rem] font-black text-white/[0.04] leading-none select-none text-right mb-2">
                {f.number}
              </div>
              {f.mockup}
            </div>

          </div>
        </div>
      </div>

      {/* CSS keyframes injected — Next.js compatible */}
      <style>{`
        @keyframes featureIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes featureInRight {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
