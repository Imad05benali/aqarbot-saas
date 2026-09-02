'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
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
      <div className="bg-[#0d1a0d] border border-[#6EE7B7]/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2 bg-[#0B1120]">
          <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
          <span className="text-xs text-[#6EE7B7] font-bold uppercase tracking-widest">Chat WhatsApp Live</span>
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
              <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-md ${m.from === 'bot' ? 'bg-zinc-800 text-white rounded-tl-none' : 'bg-[#6EE7B7] text-black rounded-tr-none'}`}>
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
      <div className="bg-[#0d1a0d] border border-[#6EE7B7]/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-[#0B1120]">
          <span className="text-xs text-[#6EE7B7] font-bold uppercase tracking-widest">CRM Dashboard</span>
          <span className="text-xs text-slate-500">247 leads actifs</span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { name: 'Rachid Benjelloun', city: 'Casablanca', budget: '800K', status: 'Qualifié', color: 'text-[#6EE7B7]' },
            { name: 'Fatima Zahraoui', city: 'Rabat', budget: '1.2M', status: 'Nouveau', color: 'text-yellow-400' },
            { name: 'Karim Alaoui', city: 'Marrakech', budget: '600K', status: 'Contacté', color: 'text-blue-400' },
            { name: 'Sara Tazi', city: 'Tanger', budget: '500K', status: 'Fermé', color: 'text-slate-500' },
          ].map((lead) => (
            <div key={lead.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs">
              <span className="text-white font-bold w-28 truncate">{lead.name}</span>
              <span className="text-slate-500 hidden sm:block">{lead.city}</span>
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
      <div className="bg-[#0d1a0d] border border-[#6EE7B7]/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2 bg-[#0B1120]">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs text-white font-bold uppercase tracking-widest">Hub en Direct</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { phone: '+212 6XX XXX 001', msg: "Bghit villa f Marrakech...", time: "À l'instant", hot: true },
            { phone: '+212 6XX XXX 042', msg: 'Bonjour, cherche appartement...', time: 'Il y a 3 min', hot: false },
            { phone: '+212 6XX XXX 103', msg: "Mon budget c'est 500K max", time: 'Il y a 7 min', hot: false },
          ].map((conv) => (
            <div key={conv.phone} className={`flex items-center gap-4 p-3 rounded-xl border ${conv.hot ? 'border-[#6EE7B7]/40 bg-[#6EE7B7]/5' : 'border-white/5 bg-zinc-900/40'}`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${conv.hot ? 'bg-[#6EE7B7] animate-pulse' : 'bg-slate-600'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold">{conv.phone}</p>
                <p className="text-slate-500 text-xs truncate">{conv.msg}</p>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0 hidden sm:block">{conv.time}</span>
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
      <div className="bg-[#0d1a0d] border border-[#6EE7B7]/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-white/5 bg-[#0B1120]">
          <span className="text-xs text-[#6EE7B7] font-bold uppercase tracking-widest">Résultats IA</span>
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
                <p className="text-[#6EE7B7] text-xs font-black mt-0.5">{bien.price}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#6EE7B7]/20 text-[#6EE7B7] text-xs font-black">{bien.match}</span>
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
      <div className="bg-[#0d1a0d] border border-[#6EE7B7]/20 rounded-2xl overflow-hidden p-5 shadow-2xl">
        <p className="text-xs text-[#6EE7B7] font-bold uppercase tracking-widest mb-4">Croissance (6 mois)</p>
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

// ─── DESKTOP: sticky-scroll version ──────────────────────────────────────────
function FeaturesDesktop() {
  const [active, setActive] = React.useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Clamp the raw index to strictly stay within the array bounds to prevent React crashes on macOS bounce/overscroll.
    const rawIndex = Math.floor(latest * features.length);
    const index = Math.max(0, Math.min(features.length - 1, rawIndex));
    setActive(index);
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const f = features[active];

  const scrollToFeature = (idx: number) => {
    if (!containerRef.current) return;
    const { top, height } = containerRef.current.getBoundingClientRect();
    const scrollTarget = window.scrollY + top + (height / features.length) * idx;
    
    // Using auto instead of smooth to avoid conflicts with Lenis hijacking
    window.scrollTo({ top: scrollTarget, behavior: 'auto' });
  };

  return (
    <div ref={containerRef} className="relative w-full border-t border-slate-800" style={{ height: `${features.length * 65}vh` }}>
      <div className="sticky top-0 h-screen w-full flex overflow-hidden pt-[72px] md:pt-[80px] lg:pt-[96px]">
        {/* LEFT SIDEBAR */}
        <aside className="w-[240px] xl:w-[280px] shrink-0 border-r border-slate-800 bg-[#0B1120] flex flex-col justify-center px-6 xl:px-8 py-10 z-20 shadow-2xl">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-6">
            Explorer&nbsp;
            <span className="text-[#6EE7B7]">
              {String(active + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
            </span>
          </p>
          <div className="h-px w-full bg-slate-800 mb-8 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute left-0 top-0 h-full bg-[#6EE7B7] rounded-full"
              style={{ width: progressWidth }}
            />
          </div>
          <nav className="space-y-2">
            {features.map((feat, i) => {
              const isActive = i === active;
              return (
                <button
                  key={feat.number}
                  onClick={() => scrollToFeature(i)}
                  className={`w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-sm transition-all duration-300 ${
                    isActive ? 'bg-[#6EE7B7]' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className={`text-xs font-black tabular-nums ${isActive ? 'text-[#0B1120]' : 'text-slate-600'}`}>{feat.number}</span>
                  <span className={`flex-1 font-black text-sm leading-tight ${isActive ? 'text-[#0B1120]' : ''}`}>{feat.title}</span>
                  {isActive && <ArrowRight className="w-4 h-4 text-[#0B1120] shrink-0" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT PANEL */}
        <div className="flex-1 overflow-hidden bg-[#0d1624] flex items-center relative z-10">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 px-8 md:px-16 lg:px-24 max-w-6xl mx-auto relative z-10">
            <motion.div key={`text-${active}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col justify-center">
              <p className="text-[10px] text-[#6EE7B7] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] inline-block shadow-[0_0_10px_#6EE7B7]" />
                {f.tagline}
              </p>
              <h3 className="text-[clamp(2rem,3.5vw,4rem)] font-black text-white leading-[0.9] uppercase tracking-tight mb-8">{f.title}</h3>
              <p className="text-slate-400 text-base font-medium leading-relaxed mb-10 max-w-md">{f.description}</p>
              <div className="space-y-6">
                {f.details.map((d, di) => (
                  <motion.div key={d.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: di * 0.1 + 0.2 }} className="flex gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-2" />
                    <div>
                      <p className="text-white font-black text-sm tracking-wide mb-1">{d.label}</p>
                      <p className="text-slate-500 text-sm font-medium">{d.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div key={`mock-${active}`} initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col justify-center relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[15rem] font-black text-white/[0.02] leading-none select-none z-0 tracking-tighter">{f.number}</div>
              <div className="relative z-10 w-full max-w-sm mx-auto xl:max-w-md">{f.mockup}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE: editorial stacked sections + right-side scroll indicator ─
function FeaturesMobile() {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    const observers = sectionRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIdx(i); },
        { threshold: 0.4 }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, []);

  return (
    <div className="w-full bg-[#0B1120] relative">
      {/* Subtle green grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(to right, #6EE7B7 1px, transparent 1px), linear-gradient(to bottom, #6EE7B7 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* ── RIGHT-SIDE STICKY INDICATOR (Scoped to this section) ── */}
      <div className="absolute right-0 top-0 h-full w-12 z-50 pointer-events-none md:hidden">
        <div className="sticky top-[30%] -translate-y-1/2 pr-2 pointer-events-auto flex justify-end">
          <div className="flex flex-col items-center gap-5 bg-[#0B1120]/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-2.5 py-4">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="flex flex-col items-center gap-1.5 group"
              >
                {i === activeIdx ? (
                  <span className="text-[16px] font-black text-[#6EE7B7] tabular-nums leading-none transition-all duration-300 drop-shadow-[0_0_12px_#6EE7B7]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                ) : (
                  <span className="text-[13px] font-black text-slate-600 tabular-nums leading-none transition-all duration-300 group-hover:text-slate-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                {i === activeIdx && (
                  <span className="w-2 h-2 rounded-full bg-[#6EE7B7] drop-shadow-[0_0_8px_#6EE7B7]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── STACKED SECTIONS ── */}
      {features.map((f, i) => (
        <div
          key={f.number}
          ref={(el) => { sectionRefs.current[i] = el; }}
          className="relative border-t border-slate-800/60 px-6 py-10 pr-10"
        >
          {/* Category tag */}
          <p className="flex items-center gap-2 text-[9px] text-[#6EE7B7] font-black uppercase tracking-[0.25em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7] shadow-[0_0_8px_#6EE7B7]" />
            {f.tagline}
          </p>

          {/* Big title */}
          <h3 className="text-[2rem] font-black text-white uppercase tracking-tight leading-[0.88] mb-4 pr-6">
            {f.title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
            {f.description}
          </p>

          {/* 2-column feature grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-5 mb-8">
            {f.details.map((d) => (
              <div key={d.label}>
                <p className="text-white text-[11px] font-black tracking-wide mb-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#6EE7B7] shrink-0" />
                  {d.label}
                </p>
                <p className="text-slate-500 text-[10px] font-medium leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          {/* Mockup */}
          <div className="w-full">{f.mockup}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function Features() {
  return (
    <section className="w-full bg-[#0B1120]">
      {/* Header */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px] pt-16 pb-12">
        <p className="text-xs text-[#6EE7B7] font-black uppercase tracking-[0.3em] mb-4">Explorer le système</p>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-[0.9]">
          Choisissez une tâche.<br />
          <span className="text-slate-600">Voyez tout le flux.</span>
        </h2>
      </div>

      {/* Desktop sticky-scroll (md+) */}
      <div className="hidden md:block">
        <FeaturesDesktop />
      </div>

      {/* Mobile stacked (below md) */}
      <div className="md:hidden">
        <FeaturesMobile />
      </div>
    </section>
  );
}
