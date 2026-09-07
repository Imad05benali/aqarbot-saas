'use client';

import { Lock, Download, ChevronDown, LayoutGrid, Sparkles, Funnel, Repeat, Settings } from 'lucide-react';

/**
 * DashboardMock — a dark analytics dashboard window in the style of the
 * Motion UI demo (browser chrome + sidebar + metric cards + line chart +
 * top events), branded for AqarBot. Used as the `screenshot` layer of the
 * hero's ScreenshotScrollReveal.
 */
export default function DashboardMock() {
  const nav = [
    { icon: <LayoutGrid className="h-3.5 w-3.5" />, label: "Vue d'ensemble", active: true },
    { icon: <Sparkles className="h-3.5 w-3.5" />, label: 'Événements', active: false },
    { icon: <Funnel className="h-3.5 w-3.5" />, label: 'Entonnoirs', active: false },
    { icon: <Repeat className="h-3.5 w-3.5" />, label: 'Rétention', active: false },
    { icon: <Settings className="h-3.5 w-3.5" />, label: 'Paramètres', active: false },
  ];

  const metrics = [
    { label: 'Leads actifs', value: '48 240', trend: '▲ 12.4%', up: true },
    { label: "Taux d'activation", value: '41.8%', trend: '▲ 3.1%', up: true },
    { label: 'Rétention hebdo', value: '68.2%', trend: '▼ 0.6%', up: false },
  ];

  const events = [
    { label: 'page_view', value: '128 940', pct: 100 },
    { label: 'signup_started', value: '9 204', pct: 42 },
    { label: 'workspace_created', value: '3 178', pct: 22 },
    { label: 'invite_sent', value: '1 946', pct: 14 },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#161616] text-left shadow-2xl shadow-black/40">
      {/* Browser title bar */}
      <div className="flex h-9 items-center gap-2 border-b border-[#2a2a2a] bg-[#1e1e1e] px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md border border-[#2a2a2a] bg-[#161616] px-3 py-1 text-[8px] font-mono text-slate-400">
          <Lock className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">app.aqarbot.ma / agence</span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#333] bg-black px-2 py-0.5 text-[8px] font-bold text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-44 shrink-0 flex-col border-r border-[#2a2a2a] bg-[#161616] p-3 sm:flex">
          <div className="mb-4 flex items-center gap-2 px-1">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#34D399] text-[9px] font-black text-[#0B1120]">A</div>
            <span className="text-xs font-bold text-white">AqarBot</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {nav.map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                  n.active ? 'bg-[#2c2c2c] text-white' : 'text-[#8a8a8a]'
                }`}
              >
                {n.icon}
                <span className="truncate">{n.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 bg-[#161616] p-4 md:p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Vue d&apos;ensemble</p>
              <p className="text-[10px] text-[#8a8a8a]">Tous les biens</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-md border border-[#2a2a2a] bg-[#1e1e1e] px-2.5 py-1 text-[9px] font-medium text-slate-300">
                Derniers 30 jours <ChevronDown className="h-3 w-3" />
              </span>
              <span className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[9px] font-bold text-[#161616]">
                <Download className="h-3 w-3" /> Exporter
              </span>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
                <p className="truncate text-[8px] font-medium text-[#9a9a9a]">{m.label}</p>
                <p className="mt-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">{m.value}</p>
                <p className={`mt-1 text-[9px] font-medium ${m.up ? 'text-[#34D399]' : 'text-[#f87171]'}`}>{m.trend}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-3 rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-medium text-slate-300">Leads actifs quotidiens</p>
              <p className="text-[10px] font-bold text-white">48 240</p>
            </div>
            <svg viewBox="0 0 320 100" className="h-16 w-full sm:h-20" aria-hidden="true">
              <defs>
                <linearGradient id="aqarMockGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,85 C25,80 40,72 62,74 C88,77 100,62 128,60 C156,58 170,44 198,46 C226,48 244,30 268,26 C286,23 305,20 320,18 L320,100 L0,100 Z"
                fill="url(#aqarMockGrad2)"
              />
              <path
                d="M0,85 C25,80 40,72 62,74 C88,77 100,62 128,60 C156,58 170,44 198,46 C226,48 244,30 268,26 C286,23 305,20 320,18"
                fill="none"
                stroke="#34D399"
                strokeWidth="2"
              />
              <circle cx="320" cy="18" r="3.5" fill="#ffffff" />
            </svg>
          </div>

          {/* Top events */}
          <div className="mt-3 rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-3">
            <p className="mb-2 text-[10px] font-medium text-slate-300">Événements principaux</p>
            <div className="flex flex-col gap-2">
              {events.map((e) => (
                <div key={e.label} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate font-mono text-[9px] text-slate-400">{e.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2a2a2a]">
                    <div className="h-full rounded-full bg-[#34D399]" style={{ width: `${e.pct}%` }} />
                  </div>
                  <span className="w-14 shrink-0 text-right font-mono text-[9px] text-white">{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}