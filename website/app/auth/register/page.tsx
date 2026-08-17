'use client';

import React from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  CheckCircle2,
  Star,
  Zap,
  ArrowLeft,
  Loader2,
  Building2,
  KeyRound,
  CreditCard,
  ShieldCheck,
  X,
  Phone,
  MapPin,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { supabase, isSupabaseReachable } from '@/lib/supabase';

// ──────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────
type Step = 'form' | 'payment' | 'otp' | 'success';

// ──────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────────
export default function RegisterPage() {
  // Step management
  const [step, setStep] = React.useState<Step>('form');

  // Form fields
  const [fullName, setFullName] = React.useState('');
  const [agencyName, setAgencyName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [city, setCity] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');

  // UI state — no session check or loading screen needed on this page.
  // Middleware already bypasses /auth/register for all session states.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);

  // ── Step 1: Submit form → show payment modal ──────────────
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!fullName.trim() || !agencyName.trim() || !phone.trim() || !city.trim() || !email.trim() || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setError(null);
    setStep('payment');
  };

  // ── Step 2: Confirm payment → show OTP gate ───────────────
  const handlePaymentConfirm = () => {
    setStep('otp');
  };

  // ── Step 3: Validate OTP → signUp + profile insert ────────
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (otp !== '123456') {
      setOtpError('Code de vérification invalide. Utilisez 123456 pour la démo.');
      return;
    }

    setOtpError(null);
    setIsSubmitting(true);

    try {
      // 0. Pre-flight: verify Supabase API is reachable
      const reachable = await isSupabaseReachable();
      if (!reachable) {
        throw new Error(
          'Impossible de joindre le serveur Supabase. '
          + 'Vérifiez votre connexion Internet ou réactivez le projet Supabase (le plan gratuit se met en pause après 7 jours d\'inactivité).'
        );
      }

      // 1. Create Supabase Auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName.trim(), 
            agency_name: agencyName.trim(),
            phone: phone.trim(),
            city: city.trim()
          },
        },
      });

      if (authError) throw authError;

      const userId = data.user?.id;

      if (userId) {
        // 2. Insert profile row into public.users — schema: id, full_name, agency_name, role
        // email, agency_logo, hashed_password, agency_id are not columns in this table.
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            full_name: fullName.trim(),
            agency_name: agencyName.trim(),
            role: 'Owner',
          }]);

        if (insertError) {
          console.error('Supabase Profile Sync Error:', insertError);
          // Non-blocking — auth user was created; profile row will be lazily synced on login
        }
      }

      // 3. Persist session cookies for cross-port handshake
      if (data.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=604800; SameSite=Lax`;
      }

      setStep('success');

      // 4. Force a clean-slate log out to clear any old cached sessions 
      await supabase.auth.signOut();

      // 5. Redirect to login with pre-fill params so the user is authenticated in one click
      setTimeout(() => {
        window.location.href = `/auth/login?email=${encodeURIComponent(email)}&prefill=${encodeURIComponent(password)}`;
      }, 2000);
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      // Detect raw network failures and replace with user-friendly message
      if (message === 'Failed to fetch' || message.includes('Failed to fetch')) {
        message = 'Connexion au serveur impossible. Vérifiez votre connexion Internet ou réactivez votre projet Supabase.';
      }
      setOtpError(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  // ── Success screen ─────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen w-full flex bg-transparent items-center justify-center relative z-10">
        <div className="text-center flex flex-col items-center gap-6 p-12">
          <div className="w-24 h-24 rounded-full bg-brand-emerald/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald animate-pulse" />
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tight">Compte créé !</h2>
          <p className="text-slate-500 font-medium">
            Redirection vers la page de connexion...
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-brand-emerald" />
        </div>
      </div>
    );
  }

  // ── Payment Gateway Modal ─────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="min-h-screen w-full flex bg-transparent items-center justify-center p-8 relative z-10">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-brand-emerald/5 blur-[200px] rounded-full pointer-events-none" />

        <ScrollReveal>
          <div className="w-full max-w-lg animate-reveal">
            {/* Back button */}
            <button
              onClick={() => { setStep('form'); setOtpError(null); }}
              className="inline-flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-emerald transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Modifier les informations
            </button>

            {/* Payment Card */}
            <div className="glass-card p-10 rounded-[40px] border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-emerald/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-emerald">
                        Simulation de Soutenance
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">
                      Passerelle de<br />
                      <span className="text-brand-emerald italic">Paiement Fictif</span>
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-emerald/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-brand-emerald" />
                  </div>
                </div>

                {/* Invoice summary */}
                <div className="bg-black/20 dark:bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Plan AqarBot Pro</span>
                    <span className="font-black text-foreground">499 MAD / mois</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Agence</span>
                    <span className="font-bold text-foreground truncate max-w-[180px]">{agencyName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Titulaire</span>
                    <span className="font-bold text-foreground">{fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Email</span>
                    <span className="font-bold text-foreground truncate max-w-[200px]">{email}</span>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Total dû maintenant
                    </span>
                    <span className="text-xl font-black text-brand-emerald">0 MAD</span>
                  </div>
                </div>

                {/* Mock payment notice */}
                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300 font-bold leading-relaxed">
                    Ceci est une simulation de paiement à des fins de démonstration académique.
                    Aucune transaction réelle ne sera effectuée.
                  </p>
                </div>

                {/* Confirm button */}
                <button
                  onClick={handlePaymentConfirm}
                  className="w-full py-5 bg-brand-emerald text-black font-black rounded-2xl text-base hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-emerald/20 flex items-center justify-center gap-3"
                >
                  <span>Confirmer le paiement</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Sécurisé par AqarBot Shield™ · Simulation uniquement
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  // ── OTP verification screen ───────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-screen w-full flex bg-transparent items-center justify-center p-8 relative z-10">
        <ScrollReveal>
          <div className="w-full max-w-md animate-reveal">
            <button
              onClick={() => { setStep('payment'); setOtpError(null); }}
              className="inline-flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-emerald transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Retour au paiement
            </button>

            <div className="mb-8">
              <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">
                Code de <span className="text-brand-emerald italic">Vérification</span>
              </h1>
              <p className="text-slate-500 font-medium">
                Entrez le code à 6 chiffres envoyé à{' '}
                <span className="text-foreground font-bold">{email}</span>.
              </p>
              <p className="mt-2 text-xs text-brand-emerald font-black">
                💡 Code de démo : 123456
              </p>
            </div>

            <form
              onSubmit={handleOtpVerify}
              className="glass-card p-10 rounded-[40px] border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-emerald/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="space-y-6 relative z-10">
                {otpError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center">
                    {otpError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Code de vérification à 6 chiffres
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all tracking-[0.5em] text-center"
                      placeholder="••••••"
                    />
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-5 bg-brand-emerald text-black font-black rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-emerald/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Création du compte...</span>
                    </>
                  ) : (
                    <>
                      <span>Vérifier et Créer mon Compte</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  // ── Main registration form ─────────────────────────────────
  return (
    <div className="min-h-screen w-full flex bg-transparent relative z-10">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 text-center lg:text-left">
        <ScrollReveal>
          <div className="w-full max-w-lg animate-reveal">
            <div className="mb-10">
              <a
                href="/"
                className="inline-flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-emerald transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                Retour à l&apos;accueil
              </a>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight leading-none">
                Prêt à transformer <br />
                <span className="text-brand-emerald">votre agence ?</span>
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Créez votre compte en 30 secondes et activez votre AqarBot AI.
              </p>
            </div>

            <form
              action="javascript:void(0);"
              onSubmit={handleFormSubmit}
              className="glass-card p-8 md:p-10 rounded-[40px] border-neutral-200 dark:border-neutral-800 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-emerald/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="space-y-5 relative z-10">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center">
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Nom complet
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all"
                      placeholder="Ahmed Tazi"
                    />
                  </div>
                </div>

                {/* Agency Name */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Nom de l&apos;Agence
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all"
                      placeholder="Immo Excellence Maroc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                      Téléphone
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all"
                        placeholder="+212 600 000 000"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                      Ville
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all"
                        placeholder="Casablanca"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2 text-left">
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
                      placeholder="direction@votreagence.ma"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                    Mot de passe
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-brand-emerald transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/50 dark:bg-black/20 border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-brand-emerald transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-brand-emerald text-black font-black rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-emerald/20 flex items-center justify-center gap-3"
                >
                  <span>Continuer vers le paiement</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            <p className="text-center mt-8 text-sm font-medium text-slate-500">
              Déjà un compte ?{' '}
              <a
                href="/auth/login"
                className="text-brand-emerald font-black hover:underline underline-offset-4"
              >
                Se connecter
              </a>
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Right Column: Decorative */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-neutral-900 border-l border-white/5 items-center justify-center p-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-brand-emerald/10 blur-[180px] rounded-full animate-drift" />
        </div>

        <ScrollReveal stagger={0.2}>
          <div className="relative z-10 max-w-md animate-reveal">
            <h2 className="text-4xl font-black text-white mb-12 leading-tight">
              Ce qui rend AqarBot unique :
            </h2>

            <div className="space-y-8">
              {[
                {
                  title: 'Support Darija Natif',
                  desc: 'La seule IA qui comprend réellement le dialecte marocain.',
                  icon: <Star className="w-6 h-6 text-brand-emerald" />,
                },
                {
                  title: 'Qualification 24/7',
                  desc: 'Vos leads sont triés et qualifiés même quand vous dormez.',
                  icon: <CheckCircle2 className="w-6 h-6 text-brand-emerald" />,
                },
                {
                  title: 'Intégration Top-Speed',
                  desc: 'Connectez votre base de données en moins de 5 minutes.',
                  icon: <Zap className="w-6 h-6 text-brand-emerald" />,
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-emerald/20 transition-colors">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-black text-white mb-1">{item.title}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
