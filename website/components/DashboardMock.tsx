'use client';

import Image from 'next/image';
import { CheckCircle2, Users, MessageSquare, Search, ArrowUpRight } from 'lucide-react';

/**
 * DashboardMock — a lightweight, brand-consistent mock of the AqarBot
 * dashboard (dark navy + emerald). Used as the `screenshot` layer of the
 * hero's ScreenshotScrollReveal so the reveal animation shows real product
 * UI without depending on static screenshot assets.
 */
export default function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1624] text-left shadow-2xl shadow-[#6EE7B7]/10">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-800 bg-[#0B1120] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 hidden truncate text-[8px] font-black uppercase tracking-[0.2em] text-slate-600 sm:block">
          APP.AQARBOT.MA / AGENCE
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded bg-[#6EE7B7]/10 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-[#6EE7B7]">
            <span className="h-1 w-1 animate-pulse rounded-full bg-[#6EE7B7]" /> Synchro Live
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-32 shrink-0 flex-col gap-1 border-r border-slate-800 bg-[#0B1120] p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2 px-2">
            <Image src="/logo-icon.png" alt="AqarBot" width={16} height={16} className="h-4 w-4 opacity-90" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">AqarBot</span>
          </div>
          {[
            { icon: <CheckCircle2 className="h-3 w-3" />, label: 'Tableau de Bord', active: true },
            { icon: <Users className="h-3 w-3" />, label: 'CRM & Catalogue', active: false },
            { icon: <MessageSquare className="h-3 w-3" />, label: 'Hub en Direct', active: false },
            { icon: <Search className="h-3 w-3" />, label: 'Configuration IA', active: false },
          ].map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-2 rounded px-2 py-1.5 text-[8px] font-bold uppercase tracking-wider ${
                n.active ? 'bg-[#6EE7B7]/10 text-[#6EE7B7]' : 'text-slate-500'
              }`}
            >
              {n.icon}
              <span className="truncate">{n.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 p-4 md:p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[7px] font-black uppercase tracking-widest text-[#6EE7B7]">Vue d&apos;ensemble</p>
              <p className="mt-0.5 text-sm font-black uppercase tracking-tight text-white sm:text-base">Bonjour, Yasmine</p>
            </div>
            <span className="flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-slate-500">
              <ArrowUpRight className="h-3 w-3" /> 6 septembre
            </span>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total Clients', value: '42', delta: '+12.4%', color: 'text-[#6EE7B7]' },
              { label: 'Conversations IA', value: '128', delta: '+8.1%', color: 'text-[#FBBF24]' },
              { label: 'Messages Bot', value: '2 314', delta: '+18.2%', color: 'text-slate-200' },
            ].map((k) => (
              <div key={k.label} className="rounded-lg border border-slate-800 bg-[#0B1120] p-2.5 sm:p-3">
                <p className="truncate text-[6px] font-black uppercase tracking-wider text-slate-500 sm:text-[7px]">{k.label}</p>
                <p className={`mt-1.5 text-base font-black tracking-tight sm:text-xl ${k.color}`}>{k.value}</p>
                <p className="mt-0.5 text-[7px] font-bold text-[#6EE7B7]">↗ {k.delta}</p>
              </div>
            ))}
          </div>

          {/* Chart + neural prediction */}
          <div className="mt-2 grid grid-cols-5 gap-2">
            <div className="col-span-5 rounded-lg border border-slate-800 bg-[#0B1120] p-3 sm:col-span-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[7px] font-black uppercase tracking-widest text-white">Croissance &amp; Acquisition</p>
                <div className="flex items-center gap-2 text-[6px] font-black uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-[#a78bfa]" /> Requêtes
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-[#6EE7B7]" /> Qualifs
                  </span>
                </div>
              </div>
              <svg viewBox="0 0 300 80" className="h-16 w-full sm:h-20" aria-hidden="true">
                <defs>
                  <linearGradient id="aqarMockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,65 C30,60 45,50 70,52 C95,54 110,40 140,42 C170,44 185,30 210,32 C240,34 260,20 300,18 L300,80 L0,80 Z"
                  fill="url(#aqarMockGrad)"
                />
                <path
                  d="M0,65 C30,60 45,50 70,52 C95,54 110,40 140,42 C170,44 185,30 210,32 C240,34 260,20 300,18"
                  fill="none"
                  stroke="#6EE7B7"
                  strokeWidth="2"
                />
                <path
                  d="M0,70 C40,66 60,58 90,56 C120,54 140,46 170,44 C200,42 240,30 300,26"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              </svg>
            </div>

            <div className="col-span-5 rounded-lg border border-slate-800 bg-[#0B1120] p-3 sm:col-span-2">
              <p className="text-[7px] font-black uppercase tracking-widest text-white">Prédiction Neurale</p>
              <p className="mt-2 text-[8px] font-medium leading-relaxed text-slate-400">
                Hausse de <span className="font-black text-[#FBBF24]">+35%</span> des demandes premium à{' '}
                <span className="font-black text-[#6EE7B7]">RIVIERA</span>.
              </p>
              <div className="mt-2.5 flex gap-2">
                {[
                  { v: '+18.2%', l: 'Prix', c: 'text-[#6EE7B7]' },
                  { v: '4,2x', l: 'Vélocité', c: 'text-white' },
                  { v: '92/100', l: 'Chaleur', c: 'text-[#FBBF24]' },
                ].map((m) => (
                  <div key={m.l} className="flex-1 rounded border border-slate-800 bg-[#0B1120] p-2 text-center">
                    <p className={`text-[9px] font-black ${m.c}`}>{m.v}</p>
                    <p className="mt-0.5 text-[6px] font-black uppercase tracking-widest text-slate-500">{m.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent leads */}
          <div className="mt-2 rounded-lg border border-slate-800 bg-[#0B1120] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[7px] font-black uppercase tracking-widest text-white">Derniers leads qualifiés</p>
              <span className="text-[7px] font-black uppercase tracking-widest text-[#6EE7B7]">Voir tout</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { initials: 'SB', name: 'Salma Benjelloun', need: 'Appartement · Anfa', score: '94/100', active: true },
                { initials: 'KA', name: 'Karim Azzouzi', need: 'Villa · Aïn Diab', score: '88/100', active: false },
              ].map((u) => (
                <div
                  key={u.name}
                  className="flex items-center justify-between rounded border border-slate-800/70 bg-[#0d1624] px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[7px] font-black uppercase ${
                        u.active ? 'bg-[#FBBF24] text-[#0B1120]' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {u.initials}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white">{u.name}</p>
                      <p className="text-[7px] font-medium text-slate-500">{u.need}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${u.active ? 'bg-[#6EE7B7]' : 'bg-slate-600'}`} />
                    <span className="text-[8px] font-black text-[#6EE7B7]">{u.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}