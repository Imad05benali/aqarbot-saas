'use client';

import { Lock, LayoutGrid, Users, MessageCircle, Settings, Star, LogOut, ChevronLeft, Clock, Zap, TrendingUp, Flame } from 'lucide-react';

/**
 * DashboardMock — the real AqarBot dashboard look (Tableau de Bord):
 * sidebar + header bar + KPI cards + growth chart + neural prediction.
 * Used as the `screenshot` layer of the hero's ScreenshotScrollReveal.
 */
export default function DashboardMock() {
  const nav = [
    { icon: <LayoutGrid className="h-4 w-4" />, label: 'Tableau de Bord', active: true },
    { icon: <Users className="h-4 w-4" />, label: 'CRM & Catalogue', active: false },
    { icon: <MessageCircle className="h-4 w-4" />, label: 'Hub en Direct', active: false },
    { icon: <Settings className="h-4 w-4" />, label: 'Configuration IA', active: false },
    { icon: <Star className="h-4 w-4" />, label: 'Abonnement', active: false },
  ];

  const kpis = [
    { label: 'TOTAL CLIENTS', sub: 'Tous leads inscrits', value: '4', trend: '+12.4%', icon: <Users className="h-4 w-4 text-white" />, iconBg: 'bg-[#34D399]', accent: 'border-t-[#34D399]' },
    { label: 'CONVERSATIONS IA', sub: 'Sessions actives', value: '3', trend: '+12.4%', icon: <Flame className="h-4 w-4 text-white" />, iconBg: 'bg-[#FBBF24]', accent: 'border-t-[#FBBF24]' },
    { label: 'MESSAGES BOT', sub: 'Échanges auto.', value: '186', trend: '+12.4%', icon: <MessageCircle className="h-4 w-4 text-white" />, iconBg: 'bg-[#2DD4BF]', accent: 'border-t-[#2DD4BF]' },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0B1120] text-left shadow-2xl shadow-black/60">
      {/* Browser title bar */}
      <div className="flex h-8 items-center gap-2 border-b border-[#1e293b] bg-[#0d1624] px-3">
        <span className="h-2 w-2 rounded-full bg-red-500/80" />
        <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
        <span className="h-2 w-2 rounded-full bg-green-500/80" />
        <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md border border-[#1e293b] bg-[#0B1120] px-3 py-0.5 text-[7px] font-mono text-slate-400">
          <Lock className="h-2 w-2 shrink-0" />
          <span className="truncate">app.aqarbot.ma</span>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[7px] font-bold text-white">
          <span className="h-1 w-1 rounded-full bg-white" /> LIVE
        </span>
      </div>

      <div className="flex">
        {/* ── Sidebar ── */}
        <div className="hidden w-40 shrink-0 flex-col border-r border-[#1e293b] bg-[#0B1120] p-3 sm:flex">
          <div className="mb-5 flex flex-col items-center gap-1.5 pt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="" className="h-7 w-7" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Bakhira</span>
          </div>
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[10px] font-medium ${
                  n.active
                    ? 'border border-[#34D399]/30 bg-[#34D399]/10 text-[#6EE7B7]'
                    : 'text-slate-400'
                }`}
              >
                {n.icon}
                <span className="truncate">{n.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-2 px-3 py-2 text-[10px] text-slate-500">
            <LogOut className="h-3.5 w-3.5" /> Déconnexion
          </div>
        </div>

        {/* ── Main ── */}
        <div className="min-w-0 flex-1 bg-[#0d1624] p-4 md:p-5">
          {/* Header row */}
          <div className="mb-4 flex items-center justify-between border-b border-[#1e293b] pb-3">
            <div className="flex items-center gap-2">
              <span className="hidden h-5 w-5 items-center justify-center rounded-md bg-[#1e293b] sm:flex"><ChevronLeft className="h-3 w-3 text-slate-400" /></span>
              <span className="text-[10px] font-black uppercase tracking-wide text-white">Tableau de Bord</span>
              <span className="flex items-center gap-1 text-[8px] font-bold text-[#34D399]"><span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" /> LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#34D399] px-2.5 py-1 text-[7px] font-black uppercase tracking-wider text-[#0B1120]">Simuler Test</span>
              <span className="h-6 w-6 rounded-full bg-[#1e293b] text-[8px] font-black text-white flex items-center justify-center">H</span>
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-[#34D399]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" /> Connecté · Live
              </p>
              <p className="text-lg font-black text-white sm:text-xl">Bonjour, <span className="text-[#34D399]">HAJAR</span></p>
              <p className="text-[9px] text-slate-500">Vue d&apos;ensemble <span className="font-bold text-[#6EE7B7]">bakhira</span></p>
            </div>
            <p className="flex items-center gap-1 text-[9px] text-slate-500"><Clock className="h-3 w-3" /> lundi 7 septembre</p>
          </div>

          {/* KPI cards */}
          <div className="mb-3 grid grid-cols-3 gap-2 sm:gap-3">
            {kpis.map((k) => (
              <div key={k.label} className={`rounded-xl border border-[#1e293b] border-t-2 ${k.accent} bg-[#0B1120] p-3`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[7px] font-black uppercase tracking-widest text-slate-400">{k.label}</p>
                    <p className="truncate text-[7px] text-slate-600">{k.sub}</p>
                    <p className="mt-1.5 text-xl font-black text-white sm:text-2xl">{k.value}</p>
                  </div>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${k.iconBg}`}>{k.icon}</span>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[8px] font-bold text-[#34D399]">
                  <TrendingUp className="h-2.5 w-2.5" /> {k.trend} <span className="font-medium text-slate-600">vs mois dernier</span>
                </p>
              </div>
            ))}
          </div>

          {/* Bottom row: chart + prediction */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
            {/* Chart */}
            <div className="rounded-xl border border-[#1e293b] bg-[#0B1120] p-3 lg:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-black text-white">Croissance &amp; Acquisition</p>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-[7px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-[#818CF8]" /> Requêtes</span>
                  <span className="flex items-center gap-1 text-[7px] text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" /> Qualifications</span>
                </div>
              </div>
              <p className="mb-2 text-[7px] font-bold uppercase tracking-widest text-slate-500">Requêtes vs Qualifications · 6 mois</p>
              <svg viewBox="0 0 320 110" className="h-24 w-full sm:h-28" aria-hidden="true">
                {[0, 30, 60, 90, 120].map((y) => (
                  <text key={y} x="0" y={100 - (y / 120) * 90 + 3} fill="#475569" fontSize="6">{y}</text>
                ))}
                {['Janv', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map((m, i) => (
                  <text key={m} x={12 + i * 60} y="108" fill="#475569" fontSize="6">{m}</text>
                ))}
                <defs>
                  <linearGradient id="mReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="mQual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Requêtes (purple) */}
                <path d="M12,42 C40,40 60,44 90,46 C120,48 140,30 170,32 C200,34 220,16 250,14 C270,12 295,12 310,13 L310,100 L12,100 Z" fill="url(#mReq)" />
                <path d="M12,42 C40,40 60,44 90,46 C120,48 140,30 170,32 C200,34 220,16 250,14 C270,12 295,12 310,13" fill="none" stroke="#818CF8" strokeWidth="2" />
                {/* Qualifications (teal) */}
                <path d="M12,58 C40,60 60,64 90,62 C120,60 140,52 170,54 C200,56 220,42 250,36 C270,32 295,28 310,27 L310,100 L12,100 Z" fill="url(#mQual)" />
                <path d="M12,58 C40,60 60,64 90,62 C120,60 140,52 170,54 C200,56 220,42 250,36 C270,32 295,28 310,27" fill="none" stroke="#34D399" strokeWidth="2" />
              </svg>
            </div>

            {/* Prédiction Neurale */}
            <div className="flex flex-col rounded-xl border border-[#1e293b] bg-[#0B1120] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black text-white">
                <Zap className="h-3.5 w-3.5 text-[#FBBF24]" /> Prédiction Neurale
              </p>
              <p className="mb-3 text-[9px] leading-relaxed text-slate-400">
                L&apos;analyse prédit une <span className="font-bold text-[#34D399]">hausse de 24.5%</span> pour le secteur <span className="font-bold text-white">AL-MAARIF.</span>
              </p>
              <div className="mb-3 grid grid-cols-3 gap-1.5">
                <div className="rounded-lg border border-[#1e293b] bg-[#0d1624] p-1.5 text-center">
                  <p className="text-[10px] font-black text-[#6EE7B7]">+18.2%</p>
                  <p className="text-[6px] font-bold uppercase tracking-wider text-slate-500">Prix</p>
                </div>
                <div className="rounded-lg border border-[#1e293b] bg-[#0d1624] p-1.5 text-center">
                  <p className="text-[10px] font-black text-[#6EE7B7]">4.2x</p>
                  <p className="text-[6px] font-bold uppercase tracking-wider text-slate-500">Vélocité</p>
                </div>
                <div className="rounded-lg border border-[#1e293b] bg-[#0d1624] p-1.5 text-center">
                  <p className="text-[10px] font-black text-[#FBBF24]">92/100</p>
                  <p className="text-[6px] font-bold uppercase tracking-wider text-slate-500">Chaleur</p>
                </div>
              </div>
              <button className="mt-auto w-full rounded-lg bg-[#6EE7B7] py-2 text-[8px] font-black uppercase tracking-wider text-[#0B1120] shadow-[0_0_15px_rgba(110,231,183,0.25)]">
                Lancer la Prévision
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
