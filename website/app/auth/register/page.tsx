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
  Check,
  Eye,
  EyeOff,
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
  const [showPassword, setShowPassword] = React.useState(false);

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
      <div className="min-h-[100vh] pt-32 pb-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative text-slate-100 selection:bg-[#6EE7B7]/30 flex flex-col items-center justify-center overflow-x-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6EE7B7]/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-8 p-12 w-full max-w-lg bg-[#0d1624] border border-slate-800 rounded-sm shadow-2xl text-center">
          <div className="w-20 h-20 bg-[#6EE7B7]/10 flex items-center justify-center shadow-[0_0_30px_rgba(110,231,183,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-[#6EE7B7] animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Protocole Activé</h2>
            <p className="text-slate-400 text-sm">Transfert vers votre espace agence...</p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#6EE7B7]" />
        </div>
      </div>
    );
  }

  // ── Payment Gateway Modal ─────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="min-h-[100vh] pt-32 pb-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative text-slate-100 selection:bg-[#6EE7B7]/30 flex flex-col items-center justify-center overflow-x-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-yellow-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl">
          <ScrollReveal>
             <button
               onClick={() => { setStep('form'); setOtpError(null); }}
               className="mb-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-[#6EE7B7] transition-colors flex items-center gap-2 group"
             >
               <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> MODIFIER LES DONNÉES
             </button>

             <div className="bg-[#0d1624] border border-slate-800 rounded-sm p-8 shadow-2xl space-y-8">
               <div className="flex items-start justify-between border-b border-slate-800 pb-6">
                 <div>
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-1.5 h-1.5 bg-[#6EE7B7] shadow-[0_0_10px_#6EE7B7]" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Simulation Garantie</span>
                   </div>
                   <h2 className="text-2xl font-medium tracking-tight text-white leading-tight">
                     Passerelle de<br />Paiement Fictif
                   </h2>
                 </div>
                 <div className="w-12 h-12 bg-slate-800/50 flex items-center justify-center">
                   <CreditCard className="w-5 h-5 text-slate-400" />
                 </div>
               </div>

               <div className="bg-[#0B1120] border border-slate-800 rounded-sm p-6 space-y-4 shadow-inner">
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Plan AqarBot Pro</span>
                   <span className="font-black text-[#6EE7B7]">499 MAD / mois</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Agence</span>
                   <span className="font-bold text-white truncate max-w-[180px]">{agencyName}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Titulaire</span>
                   <span className="font-bold text-white">{fullName}</span>
                 </div>
                 <div className="border-t border-slate-800 pt-4 flex justify-between items-center mt-2">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Total dû</span>
                   <span className="text-xl font-black text-yellow-500">0 MAD</span>
                 </div>
               </div>

               <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-sm p-4">
                 <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-[0.1em] leading-relaxed">
                   Mode démo académique. Aucune transaction réelle ne sera effectuée lors de cette étape.
                 </p>
               </div>

               <button
                 onClick={handlePaymentConfirm}
                 className="w-full bg-[#6EE7B7] text-[#0B1120] text-[11px] font-black tracking-[0.15em] uppercase py-5 flex items-center justify-center gap-2 hover:bg-[#4ade80] transition-colors rounded-sm shadow-[0_0_20px_rgba(110,231,183,0.15)]"
               >
                 VALIDER LE PAIEMENT FICTIF <ArrowRight className="w-4 h-4" />
               </button>
             </div>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  // ── OTP verification screen ───────────────────────────────
  if (step === 'otp') {
    return (
      <div className="min-h-[100vh] pt-32 pb-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative text-slate-100 selection:bg-[#6EE7B7]/30 flex flex-col items-center justify-center overflow-x-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="relative z-10 w-full max-w-md">
          <ScrollReveal>
             <button
               onClick={() => { setStep('payment'); setOtpError(null); }}
               className="mb-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-[#6EE7B7] transition-colors flex items-center gap-2 group"
             >
               <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> REVENIR AU PAIEMENT
             </button>

             <div className="mb-8">
               <h1 className="text-3xl font-medium tracking-tight text-white mb-4">Code de Vérification</h1>
               <p className="text-slate-400 text-sm leading-relaxed">
                 Un code à 6 chiffres a été envoyé à <span className="text-white font-bold">{email}</span>.
               </p>
               <p className="mt-4 text-[10px] text-yellow-500 font-black uppercase tracking-widest">
                 Code démo requis : 123456
               </p>
             </div>

             <form
               onSubmit={handleOtpVerify}
               className="bg-[#0d1624] border border-slate-800 rounded-sm p-8 shadow-2xl relative"
             >
               {otpError && (
                 <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-[10px] font-bold uppercase tracking-[0.1em] text-center">
                   {otpError}
                 </div>
               )}

               <div className="flex flex-col border-b border-slate-800 pb-2 relative group mb-8">
                  <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-3 block">AUTH CODE</label>
                  <div className="relative flex items-center text-slate-200">
                    <KeyRound className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-transparent pl-8 text-xl font-medium focus:outline-none placeholder-slate-700 transition-all tracking-[0.7em] text-center"
                      placeholder="••••••"
                    />
                  </div>
               </div>

               <button
                 disabled={isSubmitting}
                 type="submit"
                 className="w-full bg-[#6EE7B7] text-[#0B1120] text-[11px] font-black tracking-[0.15em] uppercase py-5 flex items-center justify-center gap-2 hover:bg-[#4ade80] transition-colors rounded-sm shadow-[0_0_20px_rgba(110,231,183,0.15)] disabled:opacity-50"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" /> CONFIGURATION...
                   </>
                 ) : (
                   <>
                     COMPLÉTER LA CRÉATION <ArrowRight className="w-4 h-4" />
                   </>
                 )}
               </button>
             </form>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  // ── Main registration form ─────────────────────────────────
  return (
    <div className="min-h-[100vh] pt-32 pb-24 px-6 md:px-12 lg:px-20 bg-[#0B1120] relative text-slate-100 selection:bg-[#6EE7B7]/30 flex flex-col overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-[#6EE7B7]/10 to-transparent blur-[120px] rounded-full pointer-events-none opacity-60" />

      <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start flex-1 relative z-10">
        
        {/* Left Column: Form */}
        <div className="flex flex-col text-left">
          <ScrollReveal>
             <div className="mb-10">
               <div className="flex items-end gap-6 mb-8 group">
                 <span className="text-yellow-500 font-black text-5xl tracking-tighter opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out origin-bottom">01</span>
                 <div className="flex flex-col pb-1">
                   <div className="h-px w-12 bg-slate-800 mb-2" />
                   <span className="text-[#6EE7B7] text-[10px] font-black uppercase tracking-[0.25em]">Onboarding Agence</span>
                 </div>
               </div>
               <h1 className="text-4xl md:text-[3.5rem] font-medium leading-[1.1] tracking-tight mb-6">
                 <span className="text-white">Votre agence.</span><br />
                 <span className="text-[#6EE7B7]">Connectée.</span>
               </h1>
               <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed max-w-md">
                 Configurez votre base de données et activez la qualification IA 24/7 sur votre marché immobilier.
               </p>
             </div>

             <form
               action="javascript:void(0);"
               onSubmit={handleFormSubmit}
               className="w-full bg-[#0d1624] border border-slate-800 rounded-sm p-6 lg:p-8 shadow-2xl flex flex-col"
             >
               {error && (
                 <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-sm text-[10px] font-bold uppercase tracking-[0.1em]">
                   {error}
                 </div>
               )}

               <div className="flex flex-col gap-6 mb-8">
                 
                 {/* Full Name */}
                 <div className="flex flex-col border-b border-slate-800 pb-2 relative group">
                    <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-3 block">Nom du Titulaire</label>
                    <div className="relative flex items-center text-slate-200">
                      <User className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent pl-8 text-sm font-medium focus:outline-none placeholder-slate-700 transition-all"
                        placeholder="Ahmed Tazi"
                      />
                    </div>
                 </div>

                 {/* Agency Name */}
                 <div className="flex flex-col border-b border-slate-800 pb-2 relative group">
                    <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-3 block">Nom de l'Agence</label>
                    <div className="relative flex items-center text-slate-200">
                      <Building2 className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                      <input
                        type="text"
                        required
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full bg-transparent pl-8 text-sm font-medium focus:outline-none placeholder-slate-700 transition-all"
                        placeholder="Immo Excellence"
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Phone */}
                   <div className="flex flex-col border-b border-slate-800 pb-2 relative group">
                      <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-3 block">Téléphone</label>
                      <div className="relative flex items-center text-slate-200">
                        <Phone className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-transparent pl-8 text-sm font-medium focus:outline-none placeholder-slate-700 transition-all"
                          placeholder="+212 600 000 000"
                        />
                      </div>
                   </div>

                   {/* City */}
                   <div className="flex flex-col border-b border-slate-800 pb-2 relative group">
                      <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-3 block">Ville</label>
                      <div className="relative flex items-center text-slate-200">
                        <MapPin className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-transparent pl-8 text-sm font-medium focus:outline-none placeholder-slate-700 transition-all"
                          placeholder="Casablanca"
                        />
                      </div>
                   </div>
                 </div>

                 {/* Email */}
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
                        placeholder="direction@agence.ma"
                      />
                    </div>
                 </div>

                 {/* Password */}
                 <div className="flex flex-col border-b border-slate-800 pb-2 relative group">
                    <label className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-500 mb-3 block">Mot de passe</label>
                    <div className="relative flex items-center text-slate-200">
                      <Lock className="absolute left-0 w-4 h-4 text-slate-500 group-focus-within:text-[#6EE7B7] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent pl-8 pr-10 text-sm font-medium focus:outline-none placeholder-slate-700 transition-all"
                        placeholder="••••••••"
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
                 type="submit"
                 className="w-full bg-[#6EE7B7] text-[#0B1120] text-[11px] font-black tracking-[0.15em] uppercase py-5 flex items-center justify-center gap-2 hover:bg-[#4ade80] transition-colors rounded-sm shadow-[0_0_20px_rgba(110,231,183,0.15)]"
               >
                 VOIR LE CONTRAT & PAIEMENT <ArrowRight className="w-4 h-4" />
               </button>

               <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-6">
                 <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Déjà certifié ?</span>
                 <a href="/auth/login" className="text-[10px] font-black text-yellow-500 tracking-[0.1em] uppercase hover:text-yellow-400 flex items-center gap-1 transition-colors">
                   Accès Session <ArrowRight className="w-3 h-3" />
                 </a>
               </div>
             </form>
          </ScrollReveal>
        </div>

        {/* Right Column: Information Panel */}
        <div className="hidden lg:flex flex-col w-full sticky top-32">
          <ScrollReveal stagger={0.2}>
            <div className="p-8 border border-slate-800 rounded-sm bg-[#0d1624] mb-8">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#6EE7B7] mb-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#6EE7B7] shadow-[0_0_10px_#6EE7B7]" /> INFRASTRUCTURE AQARBOT
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: 'Intelligence Darija native',
                    desc: "Notre modèle filtre et score l'intention derrière chaque vocal WhatsApp ou message Darija.",
                    icon: <Check className="w-4 h-4 text-yellow-500" />,
                  },
                  {
                    title: 'Isolement absolu des leads',
                    desc: 'Vos données de marché vivent dans un espace crypté indépendant.',
                    icon: <Check className="w-4 h-4 text-yellow-500" />,
                  },
                  {
                    title: 'Hub en direct',
                    desc: "Interceptez les clients chauds pendant que l'IA gère le volume.",
                    icon: <Check className="w-4 h-4 text-yellow-500" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-0.5 w-6 h-6 rounded-sm bg-[#0B1120] border border-slate-800 flex items-center justify-center shrink-0 text-[#6EE7B7]">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 tracking-wide">{item.title}</h4>
                      <p className="text-slate-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full border border-slate-800 rounded-sm bg-[#0d1624] p-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-3 text-slate-400 text-[9px]">
                <ShieldCheck className="w-4 h-4 text-[#6EE7B7]" /> GARANTIE CONFIDENTIALITÉ
              </div>
              <div className="text-slate-600 text-[9px]">
                SÉCURISÉ
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </div>
  );
}
