'use client';

// Prevent static prerendering — the Supabase client is initialized at module
// level and requires a valid URL, which is only available at runtime.
export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { supabase, isSupabaseReachable } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

// ──────────────────────────────────────────────────────────────
// INNER COMPONENT — wrapped in Suspense for useSearchParams
// ──────────────────────────────────────────────────────────────
function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  // Guard: auto-submit fires only once per prefill load
  const hasAutoSubmitted = React.useRef(false);

  // ── Auto-fill: map URL params injected by the register redirect ──
  React.useEffect(() => {
    const emailParam = searchParams.get('email');
    const prefillParam = searchParams.get('prefill');

    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (prefillParam) setPassword(decodeURIComponent(prefillParam));
  }, [searchParams]);

  // ── Auto-submit: fires once both prefill fields are populated ──
  React.useEffect(() => {
    const emailParam = searchParams.get('email');
    const prefillParam = searchParams.get('prefill');

    if (
      !hasAutoSubmitted.current &&
      emailParam &&
      prefillParam &&
      email &&
      password
    ) {
      hasAutoSubmitted.current = true;
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  // ── Login handler ─────────────────────────────────────────
  const handleLogin = async (e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Pre-flight: verify Supabase API is reachable
      const reachable = await isSupabaseReachable();
      if (!reachable) {
        throw new Error(
          'Connexion au serveur impossible. Vérifiez votre connexion Internet ou réactivez votre projet Supabase.'
        );
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        // Persist tokens for cross-port (Next.js ↔ Vite) session handshake
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800; SameSite=Lax`;
      }

      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      let message =
        err instanceof Error ? err.message : 'Erreur de connexion. Veuillez réessayer.';
      if (message === 'Failed to fetch' || message.includes('Failed to fetch')) {
        message = 'Connexion au serveur impossible. Vérifiez votre connexion Internet ou réactivez votre projet Supabase.';
      }
      setError(message);
      setIsSubmitting(false);
    }
  };

  // ── Main login form ───────────────────────────────────────
  return (
    <div className="min-h-[100vh] pt-32 pb-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative text-slate-100 selection:bg-[#6EE7B7]/30 flex flex-col overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#6EE7B7]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -left-1/4 w-[400px] h-[400px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center flex-1 relative z-10">
        
        {/* Left Form Section */}
        <div className="flex flex-col text-left max-w-lg">
          <ScrollReveal>
             <div className="mb-10">
               <div className="flex items-end gap-6 mb-8 group">
                 <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">01</span>
                 <div className="flex flex-col pb-1">
                   <div className="h-px w-12 bg-slate-800 mb-2" />
                   <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">Session Agence</span>
                 </div>
               </div>
               <h1 className="text-4xl md:text-[3.5rem] font-medium leading-[1.1] tracking-tight mb-6">
                 <span className="text-white">Reprenez la main</span><br />
                 <span className="text-slate-500">sur vos leads.</span>
               </h1>
               <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed max-w-sm">
                 Connectez-vous pour accéder à Aqar Intelligence et gérer vos opportunités avant vos concurrents.
               </p>
             </div>

             <form
               action="javascript:void(0);"
               onSubmit={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 handleLogin(e);
               }}
               className="w-full bg-[#0d1624] border border-slate-800 rounded-sm p-6 shadow-2xl flex flex-col"
             >
               {error && (
                 <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-[10px] font-bold uppercase tracking-[0.1em]">
                   {error}
                 </div>
               )}

               <div className="flex flex-col gap-6 mb-8">
                 {/* Email field */}
                 <div className="flex flex-col border-b border-slate-800 pb-2 relative group">
                    <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-3 block">Email Professionnel</label>
                    <div className="relative flex items-center text-slate-200">
                      <Mail className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent pl-8 text-sm font-medium focus:outline-none placeholder-slate-700 transition-all"
                        placeholder="contact@agence-exemple.ma"
                        autoComplete="email"
                      />
                    </div>
                 </div>

                 {/* Password field */}
                 <div className="flex flex-col border-b border-slate-800 pb-2 relative group">
                    <div className="flex justify-between items-center mb-3">
                       <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 block">Mot de passe</label>
                       <a href="#" className="text-[9px] font-bold tracking-[0.1em] text-[#6EE7B7] hover:text-white transition-colors">Oublié ?</a>
                    </div>
                    <div className="relative flex items-center text-slate-200">
                      <Lock className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent pl-8 pr-10 text-sm font-medium focus:outline-none placeholder-slate-700 transition-all"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 pr-2 flex items-center h-full text-slate-500 hover:text-[#6EE7B7] transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                 </div>
               </div>

               <button
                 disabled={isSubmitting}
                 type="submit"
                 className="w-full bg-[#6EE7B7] text-[#0B1121] text-[11px] font-black tracking-[0.15em] uppercase py-5 flex items-center justify-center gap-2 hover:bg-[#4ade80] transition-colors rounded-sm shadow-[0_0_20px_rgba(110,231,183,0.2)] disabled:opacity-50 disabled:shadow-none"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" /> EN COURS...
                   </>
                 ) : (
                   <>
                     OUVRIR LA SESSION <ArrowRight className="w-4 h-4" />
                   </>
                 )}
               </button>

               <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-6">
                 <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Pas encore certifié ?</span>
                 <a href="/auth/register" className="text-[10px] font-black text-yellow-500 tracking-[0.1em] uppercase hover:text-yellow-400 flex items-center gap-1 transition-colors">
                   S'inscrire <ArrowRight className="w-3 h-3" />
                 </a>
               </div>
             </form>
          </ScrollReveal>
        </div>

        {/* Right Section: Decorative UI Engine */}
        <div className="hidden lg:flex flex-col items-center justify-center relative w-full h-full">
           <ScrollReveal stagger={0.4} className="relative w-full max-w-lg aspect-square">
             
             {/* Radar tech circles */}
             <div className="absolute inset-0 border border-slate-800/40 rounded-full animate-[spin_60s_linear_infinite]" />
             <div className="absolute inset-8 border border-slate-700/50 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
             <div className="absolute inset-16 border border-emerald-900/40 rounded-full" />
             
             {/* Dots */}
             <div className="absolute w-2 h-2 rounded-full bg-[#6EE7B7] shadow-[0_0_10px_#6EE7B7] top-[25%] right-[25%]" />
             <div className="absolute w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_10px_#EAB308] bottom-[30%] left-[20%]" />

             {/* Center Core */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-[#0d1624] border border-[#6EE7B7]/20 rounded-full flex flex-col items-center justify-center z-20 shadow-[0_0_40px_rgba(110,231,183,0.1)]">
               <span className="relative flex h-14 w-14 mb-4">
                 <span className="animate-[ping_2s_ease-out_infinite] absolute inline-flex h-full w-full rounded-full bg-[#6EE7B7] opacity-20"></span>
                 <img src="/logo-icon.png" alt="Aqarbot Core" className="relative inline-flex h-full w-full object-contain drop-shadow-[0_0_15px_rgba(110,231,183,0.5)]" />
               </span>
               <p className="text-white text-xs font-bold mb-1">Aqar Intelligence</p>
               <p className="text-[#6EE7B7]/70 text-[8px] uppercase tracking-widest font-black">EN ATTENTE...</p>
             </div>

             {/* Stats Widget */}
             <div className="absolute bottom-[10%] -left-[10%] z-30 bg-[#0d1624] border border-slate-800 p-5 rounded-sm shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#6EE7B7]" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Connexion chiffrée</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Temps réel</span>
                </div>
             </div>

           </ScrollReveal>
        </div>

      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// PAGE EXPORT — Suspense boundary required by Next.js for
// useSearchParams() in Client Components
// ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex bg-neutral-950 items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-emerald" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
