import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Save, Cpu, Zap, Activity, Settings as SettingsIcon,
  User, Globe, Lock, CheckCircle, Upload, Image, UserPlus,
  Shield, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIConfig, updateAIConfig } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type TabType = 'profile' | 'ai' | 'api';

// ──────────────────────────────────────────────────────────────
// TEAM MANAGEMENT TABLE
// ──────────────────────────────────────────────────────────────
function TeamManagement({ agencyId }: { agencyId: string | null }) {
  const { user } = useAuth();
  const [inviteName, setInviteName] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('Agent');
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteMessage, setInviteMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchTeam = async () => {
      // Strict rebuilt schema: users(id, agency_id, full_name, email, role)
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role')
        .neq('id', user.id);
      if (error) console.error('Team fetch error:', error);
      if (data) setTeamMembers(data);
    };
    fetchTeam();
  }, [user?.id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName) return;
    setIsInviting(true);
    setInviteMessage(null);

    try {
      // Note: A real multi-tenant invite would use supabase.auth.admin.inviteUserByEmail().
      // For demo purposes we insert a placeholder profile row with the valid schema columns.
      const inviteId = crypto.randomUUID();
      const { error } = await supabase.from('users').insert([{
        id: inviteId,
        full_name: inviteName,
        email: `${inviteId}@invite.aqarbot`,
        role: inviteRole,
        agency_id: agencyId,
      }]);

      if (error) throw error;

      setTeamMembers((prev) => [...prev, { full_name: inviteName, role: inviteRole }]);
      setInviteName('');
      setInviteRole('Agent');
      setInviteMessage({ text: 'Utilisateur ajouté avec succès.', type: 'success' });
    } catch (err: any) {
      setInviteMessage({ text: err.message || "Erreur lors de l'invitation.", type: 'error' });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-700/50">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight text-white">Gestion d&apos;Équipe</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Accès Propriétaire · Inviter des collaborateurs</p>
        </div>
      </div>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="card-modern p-7 rounded-2xl space-y-5">
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Inviter / Ajouter un utilisateur</h4>

        {inviteMessage && (
          <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center border ${
            inviteMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
          }`}>
            {inviteMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Nom Complet</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full px-4 py-3 card-modern rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 transition-all"
              placeholder="Youssef El Alami"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rôle d&apos;accès</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-4 py-3 card-modern rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 transition-all"
            >
              <option value="Agent">Agent</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isInviting}
          className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Inviter / Ajouter l&apos;utilisateur
        </button>
      </form>

      {/* Team Table */}
      {teamMembers.length > 0 && (
        <div className="card-modern rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Membres de l&apos;équipe ({teamMembers.length})</h4>
          </div>
          <div className="divide-y divide-slate-700/30">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                    {member.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{member.full_name || '—'}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                  member.role === 'Owner'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : member.role === 'Manager'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-600/30'
                }`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// MAIN SETTINGS PAGE
// ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { user } = useAuth();
  const { profile, refreshProfile, updateAgencyLogo } = useProfile();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [config, setConfig] = useState({
    persona_prompt: '',
    whatsapp_phone_id: '',
    whatsapp_verify_token: '',
    backend_url: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    full_name: '',
    org_title: '',
    account_status: 'Active Founder Key',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Sync profile into config state once loaded
  useEffect(() => {
    if (profile) {
      setConfig((prev) => ({
        ...prev,
        full_name: profile.full_name || '',
        org_title: profile.agency_name || '',
      }));
      if (profile.agency_logo) setLogoPreview(profile.agency_logo);
    }
  }, [profile]);

  // Load AI/API config from FastAPI backend
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAIConfig();
        setConfig((prev) => ({
          ...prev,
          persona_prompt: data.persona_prompt || '',
          whatsapp_phone_id: data.whatsapp_phone_id || '',
          whatsapp_verify_token: data.whatsapp_verify_token || '',
          backend_url: data.backend_url || import.meta.env.VITE_API_URL || 'http://localhost:8000',
        }));
      } catch (err) {
        console.error('Failed to load config', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await updateAIConfig(config);
      // Also update Supabase profile name/agency (full_name on users,
      // agency_name on agencies, linked through users.agency_id)
      if (user?.id) {
        const { error: userError } = await supabase.from('users').update({
          full_name: config.full_name,
        }).eq('id', user.id);
        if (userError) throw userError;

        const agencyId = profile?.agency_id ?? null;
        if (agencyId) {
          const { error: agencyError } = await supabase.from('agencies').update({
            agency_name: config.org_title,
          }).eq('id', agencyId);
          if (agencyError) throw agencyError;
        } else if (config.org_title.trim()) {
          // Bootstrap: no agency yet — create one and link the owner
          const { data: created, error: createError } = await supabase
            .from('agencies')
            .insert({ agency_name: config.org_title.trim(), email: user.email || null })
            .select('id')
            .single();
          if (createError) throw createError;
          if (created?.id) {
            const { error: linkError } = await supabase
              .from('users')
              .update({ agency_id: created.id })
              .eq('id', user.id);
            if (linkError) throw linkError;
          }
        }
        await refreshProfile();
      }
      setMessage({ text: 'ARCHITECTURES SYNCHRONISÉES', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch {
      setMessage({ text: 'ERREUR DE LIAISON SYSTÈME', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Agency Logo Upload ──────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!profile?.agency_id) {
      setMessage({ text: "Enregistrez d'abord le nom de l'agence (Profil & Admin).", type: 'error' });
      return;
    }

    setIsUploadingLogo(true);
    setMessage({ text: '', type: '' });

    try {
      // Preview immediately
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);

      // Upload to Supabase Storage bucket: 'agency-logos'
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('agency-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('agency-logos')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update DB + context
      await updateAgencyLogo(publicUrl);
      setLogoPreview(publicUrl);

      setMessage({ text: 'Logo mis à jour avec succès.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Erreur upload logo.', type: 'error' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <Cpu className="w-16 h-16 text-primary animate-spin" />
      <span className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-400">Initialisation de la Console...</span>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profil & Admin', icon: User },
    { id: 'ai', label: 'Identité Digitale IA', icon: Bot },
    { id: 'api', label: 'Passerelles API', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-5">
          <div className="w-13 h-13 card-modern rounded-2xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase text-white">Configuration Centrale</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Noyau Administratif AqarBot V3.0</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-glacier px-8 py-4 flex items-center gap-3 active:scale-95 transition-all text-xs font-black"
        >
          {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          SAUVEGARDER L&apos;ARCHITECTURE
        </button>
      </div>

      {/* Tab Navigator */}
      <div className="px-4">          <div className="flex p-1 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/40 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
                activeTab === tab.id 
                  ? 'text-white shadow-lg shadow-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-600'}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-500/10 rounded-xl shadow-xl z-[-1] border border-emerald-500/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Viewport */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="card-modern p-8 rounded-2xl relative overflow-hidden"
          >
            {/* ── PROFILE TAB ─────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-12">
                {/* Admin Header */}
                <div className="flex items-center gap-5 mb-6 border-b border-slate-700/50 pb-6">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-lg overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Agency Logo" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-9 h-9 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">Profil Administrateur</h3>
                    <div className="flex items-center gap-2 mt-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {profile?.role || 'Owner'} · Vérifié
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Full Name */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Nom Complet</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 card-modern rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50"
                      value={config.full_name}
                      onChange={(e) => setConfig({ ...config, full_name: e.target.value })}
                    />
                  </div>

                  {/* Agency Name */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Nom de l&apos;Agence</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 card-modern rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50"
                      value={config.org_title}
                      onChange={(e) => setConfig({ ...config, org_title: e.target.value })}
                    />
                  </div>

                  {/* Statut */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Statut du Compte</label>
                    <div className="w-full px-4 py-3 card-modern bg-emerald-500/5 border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 italic">
                      {config.account_status}
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Sécurité</label>
                    <button className="w-full px-4 py-3 card-modern bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all">
                      <Lock className="w-3.5 h-3.5" /> Modifier le Mot de Passe
                    </button>
                  </div>

                  {/* ── Agency Logo Upload ──────────────────── */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Logo de l&apos;Agence</label>

                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="group relative flex flex-col items-center justify-center gap-4 p-8 card-modern bg-slate-800/20 border-2 border-dashed border-slate-700/50 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all"
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="h-20 w-auto object-contain rounded-xl" />
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <Image className="w-7 h-7 text-emerald-400/60" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cliquer pour uploader le logo</p>
                          <p className="text-[9px] text-slate-600">PNG, JPG, SVG · Max 5MB</p>
                        </>
                      )}

                      {isUploadingLogo && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                          <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
                        </div>
                      )}

                      {logoPreview && !isUploadingLogo && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Changer le logo
                        </div>
                      )}
                    </div>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>

                {/* ── Team Management (Owner only) ─────────── */}
                {(profile?.role === 'Owner' || !profile) && (
                  <div className="mt-12 pt-12 border-t border-white/10">
                    <TeamManagement agencyId={profile?.agency_id ?? null} />
                  </div>
                )}
              </div>
            )}

            {/* ── AI TAB ──────────────────────────────────── */}
            {activeTab === 'ai' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">Schéma IA Gemini</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Identité Digitale & Logique de Réponse</p>
                  </div>
                  <Cpu className="w-10 h-10 text-emerald-500/20" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Persona de l&apos;Agent Master</label>
                  <textarea
                    rows={10}
                    value={config.persona_prompt}
                    onChange={(e) => setConfig({ ...config, persona_prompt: e.target.value })}
                    className="w-full p-6 card-modern rounded-2xl text-sm font-medium leading-relaxed outline-none focus:border-emerald-500/50 transition-all shadow-inner resize-none font-mono"
                    placeholder="Définissez comment l'IA interagit avec les clients..."
                  />
                  <p className="text-[9px] text-slate-400 font-bold italic mt-2 px-2">Compilé comme instruction système pour Google Gemini 1.5 Pro.</p>
                </div>
              </div>
            )}

            {/* ── API TAB ─────────────────────────────────── */}
            {activeTab === 'api' && (
              <div className="space-y-12">
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-8">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">Passerelles API</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Liaisons WhatsApp Business & Backend</p>
                  </div>
                  <Zap className="w-10 h-10 text-amber-400/30" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Identifiant Téléphone ID (Meta)</label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-primary/50"
                      value={config.whatsapp_phone_id}
                      onChange={(e) => setConfig({ ...config, whatsapp_phone_id: e.target.value })}
                      placeholder="ID de téléphone Meta Cloud"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Jeton de Vérification (Verify Token)</label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-primary/50"
                      value={config.whatsapp_verify_token}
                      onChange={(e) => setConfig({ ...config, whatsapp_verify_token: e.target.value })}
                      placeholder="Verify Token pour le Webhook"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Point d&apos;Accès Backend URL</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 card-modern rounded-xl text-xs font-bold outline-none focus:border-emerald-500/50 text-emerald-400"
                        value={config.backend_url}
                        onChange={(e) => setConfig({ ...config, backend_url: e.target.value })}
                      />
                      <div className="px-4 py-3 card-modern bg-emerald-500/5 border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34D399]" />
                        <span className="text-[9px] font-black uppercase text-emerald-400">En Ligne</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global Sync Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 10, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 px-8 py-3 rounded-xl font-black text-xs tracking-widest border shadow-xl z-50 ${message.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20'}`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
