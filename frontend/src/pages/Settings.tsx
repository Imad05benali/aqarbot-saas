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
function TeamManagement() {
  const { user } = useAuth();
  const [inviteName, setInviteName] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('Agent');
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteMessage, setInviteMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchTeam = async () => {
      // Schema: id, full_name, agency_name, role — email column was removed
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
      const { error } = await supabase.from('users').insert([{
        full_name: inviteName,
        role: inviteRole,
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
    <div className="space-y-10">
      <div className="flex items-center gap-4 pb-8 border-b border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Gestion d&apos;Équipe</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accès Propriétaire · Inviter des collaborateurs</p>
        </div>
      </div>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="glacier-card p-8 rounded-[2.5rem] space-y-6 bg-white/5">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Inviter / Ajouter un utilisateur</h4>

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
              className="w-full px-5 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 transition-all"
              placeholder="Youssef El Alami"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rôle d&apos;accès</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-5 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 transition-all"
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
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary/80 transition-all active:scale-95 disabled:opacity-50"
        >
          {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Inviter / Ajouter l&apos;utilisateur
        </button>
      </form>

      {/* Team Table */}
      {teamMembers.length > 0 && (
        <div className="glacier-card rounded-[2.5rem] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Membres de l&apos;équipe ({teamMembers.length})</h4>
          </div>
          <div className="divide-y divide-white/5">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between px-8 py-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-black text-primary">
                    {member.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-black">{member.full_name || '—'}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                  member.role === 'Owner'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : member.role === 'Manager'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-slate-500/10 text-slate-400'
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
    backend_url: 'http://localhost:8000',
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
          backend_url: data.backend_url || 'http://localhost:8000',
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
      // Also update Supabase profile name/agency
      if (user?.id) {
        await supabase.from('users').update({
          full_name: config.full_name,
          agency_name: config.org_title,
        }).eq('id', user.id);
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
          <div className="w-14 h-14 glacier-card rounded-2xl flex items-center justify-center shadow-primary/10 border-primary/20">
            <SettingsIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Configuration Centrale</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Noyau Administratif AqarBot V3.0</p>
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
      <div className="px-4">
        <div className="relative flex p-1.5 bg-slate-100 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl z-[-1] border border-white/20"
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
            className="glacier-card p-12 rounded-[4rem] relative overflow-hidden"
          >
            {/* ── PROFILE TAB ─────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-12">
                {/* Admin Header */}
                <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-white/40 flex items-center justify-center shadow-2xl overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Agency Logo" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Profil Administrateur</h3>
                    <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg w-fit">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {profile?.role || 'Owner'} · Compte Vérifié
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
                      className="w-full px-6 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-primary/50"
                      value={config.full_name}
                      onChange={(e) => setConfig({ ...config, full_name: e.target.value })}
                    />
                  </div>

                  {/* Agency Name */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Nom de l&apos;Agence</label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-primary/50"
                      value={config.org_title}
                      onChange={(e) => setConfig({ ...config, org_title: e.target.value })}
                    />
                  </div>

                  {/* Statut */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Statut du Compte</label>
                    <div className="w-full px-6 py-4 glacier-card bg-emerald-500/5 border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-600 italic">
                      {config.account_status}
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Sécurité</label>
                    <button className="w-full px-6 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                      <Lock className="w-4 h-4" /> Modifier le Mot de Passe
                    </button>
                  </div>

                  {/* ── Agency Logo Upload ──────────────────── */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Logo de l&apos;Agence</label>

                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="group relative flex flex-col items-center justify-center gap-4 p-10 glacier-card bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 rounded-[2.5rem] cursor-pointer transition-all"
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="h-24 w-auto object-contain rounded-2xl" />
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Image className="w-8 h-8 text-primary/60" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cliquer pour uploader le logo</p>
                          <p className="text-[9px] text-slate-600">PNG, JPG, SVG · Max 5MB</p>
                        </>
                      )}

                      {isUploadingLogo && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-[2.5rem] bg-black/50 backdrop-blur-sm">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                      )}

                      {logoPreview && !isUploadingLogo && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
                          <Upload className="w-4 h-4" /> Changer le logo
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
                    <TeamManagement />
                  </div>
                )}
              </div>
            )}

            {/* ── AI TAB ──────────────────────────────────── */}
            {activeTab === 'ai' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Schéma IA Gemini</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identité Digitale & Logique de Réponse</p>
                  </div>
                  <Cpu className="w-12 h-12 text-primary/20" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Persona de l&apos;Agent Master</label>
                  <textarea
                    rows={10}
                    value={config.persona_prompt}
                    onChange={(e) => setConfig({ ...config, persona_prompt: e.target.value })}
                    className="w-full p-8 glacier-card bg-white/5 border-white/10 rounded-[2.5rem] text-sm font-medium leading-relaxed outline-none focus:border-primary/50 transition-all shadow-inner resize-none font-mono"
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
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Passerelles API</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liaisons WhatsApp Business & Backend</p>
                  </div>
                  <Zap className="w-12 h-12 text-emerald-500/20" />
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
                        className="flex-1 px-6 py-4 glacier-card bg-white/5 border-white/10 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 text-emerald-600"
                        value={config.backend_url}
                        onChange={(e) => setConfig({ ...config, backend_url: e.target.value })}
                      />
                      <div className="px-6 py-4 glacier-card bg-emerald-500/10 border-emerald-500/20 rounded-2xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-emerald-600">En Ligne</span>
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
            className={`fixed bottom-10 left-1/2 px-10 py-4 rounded-2xl font-black text-xs tracking-widest border shadow-2xl z-50 ${message.type === 'success' ? 'bg-primary text-slate-950 border-primary/20' : 'bg-rose-500 text-white border-rose-400'}`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
