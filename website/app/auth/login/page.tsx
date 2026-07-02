'use client';

import React, { Suspense } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { supabase } from '@/lib/supabase';
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

      // Navigate to Vite dashboard
      window.location.href = 'http://localhost:5173/dashboard';
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur de connexion. Veuillez réessayer.';
      setError(message);
      setIsSubmitting(false);
    }
  };

  // ── Main login form ───────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex bg-transparent relative z-10">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <ScrollReveal>
          <div className="w-full max-w-md animate-reveal">
            <div className="mb-12">
              <a
                href="/"
                className="inline-flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-emerald transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Retour à l&apos;accueil
              </a>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
                Content de vous <br />
                <span className="text-brand-emerald italic">revoir !</span>
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Connectez-vous pour gérer vos leads et annonces avec AqarBot AI.
              </p>
            </div>

            <form
              action="javascript:void(0);"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogin(e);
              }}
              className="glass-card p-10 rounded-[40px] border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-emerald/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="space-y-6 relative z-10">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center">
                    {error}
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Email professionnel
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all"
                      placeholder="nom@votreagence.ma"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Mot de passe
                    </label>
                    <a href="#" className="text-xs font-bold text-brand-emerald hover:underline">
                      Oublié ?
                    </a>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-5 bg-brand-emerald text-black font-black rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-emerald/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Se Connecter</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-center mt-8 text-sm font-medium text-slate-500">
              Pas encore de compte ?{' '}
              <a
                href="/auth/register"
                className="text-brand-emerald font-black hover:underline underline-offset-4"
              >
                Rejoindre AqarBot
              </a>
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Right Section: Decorative */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-neutral-900 items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-emerald/20 blur-[150px] rounded-full animate-drift" />
        </div>

        <ScrollReveal stagger={0.4}>
          <div className="relative z-10 p-20 text-center animate-reveal">
            <div className="mb-12 relative flex justify-center">
              <div className="absolute inset-0 bg-brand-emerald/20 blur-[100px] rounded-full" />
              <img
                src="/hero section.png"
                alt="Interface AqarBot"
                className="relative z-10 w-full max-w-lg rounded-[40px] shadow-2xl border border-white/5 -rotate-2 hover:rotate-0 transition-transform duration-1000"
              />
            </div>
            <h2 className="text-4xl font-black text-white mb-6">L&apos;Immobilier de Demain.</h2>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-emerald" />
                <span className="text-white/60 text-sm font-bold uppercase tracking-widest">
                  Sécurisé
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-emerald" />
                <span className="text-white/60 text-sm font-bold uppercase tracking-widest">
                  Instantané
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
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
