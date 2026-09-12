import { useState, useEffect, useRef } from 'react';
import { Bot, Save, Cpu, Zap, Activity, Settings as SettingsIcon, User, Globe, Lock, CheckCircle, Upload, Image, UserPlus, Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIConfig, updateAIConfig } from '../services/api';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Tab = 'profile' | 'ai' | 'api';

interface TabCardProps {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function TeamManagement({ agencyId }: { agencyId: string | null }) {
  const { user } = useAuth();
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    // Multi-tenant scope: only the members of THIS agency. Without the
    // agency_id filter the list shows every user of every agency.
    if (!user?.id || !agencyId) {
      setMembers([]);
      return;
    }
    supabase.from('users').select('id, full_name, role')
      .eq('agency_id', agencyId)
      .neq('id', user.id)
      .then(({ data, error }) => {
        if (error) console.error('Team fetch error:', error);
        if (data) setMembers(data);
      });
  }, [user?.id, agencyId]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName) return;
    if (!agencyId) {
      setInviteMsg({ text: "Aucune agence associée à votre compte.", type: 'error' });
      return;
    }
    setInviting(true); setInviteMsg(null);
    try {
      const id = crypto.randomUUID();
      await supabase.from('users').insert([{ id, full_name: inviteName, email: `${id}@invite.aqarbot`, role: inviteRole, agency_id: agencyId }]);
      setMembers(p => [...p, { full_name: inviteName, role: inviteRole }]);
      setInviteName(''); setInviteRole('Agent');
      setInviteMsg({ text: 'Utilisateur ajouté avec succès.', type: 'success' });
    } catch (err: any) { setInviteMsg({ text: err.message || "Erreur lors de l'invitation.", type: 'error' }); }
    finally { setInviting(false); }
  };

  return (
    <div className="space-y-7">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/50">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Gestion d&apos;Équipe</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Accès Propriétaire · Inviter des collaborateurs</p>
        </div>
      </div>

      {/* Invite form */}
      <form onSubmit={invite} className="card-glass p-6 rounded-xl space-y-4">
        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inviter / Ajouter un utilisateur</h4>
        {inviteMsg && (
          <div className={`p-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center border ${inviteMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {inviteMsg.text}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-modern">Nom Complet</label>
            <input type="text" required value={inviteName} onChange={e => setInviteName(e.target.value)} className="input-modern" placeholder="Youssef El Alami" />
          </div>
          <div>
            <label className="label-modern">Rôle d&apos;accès</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="input-modern">
              <option value="Agent">Agent</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={inviting} className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
          {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Inviter / Ajouter l&apos;utilisateur
        </button>
      </form>

      {/* Members table */}
      {members.length > 0 && (
        <div className="card-glass rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/50">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Membres de l&apos;équipe ({members.length})</h4>
          </div>
          <div className="divide-y divide-slate-800/40">
            {members.map((m, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="avatar-initial">{m.full_name?.[0] || '?'}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{m.full_name || '—'}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{m.role}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${m.role === 'Owner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : m.role === 'Manager' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-600/30'}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { profile, refreshProfile, updateAgencyLogo } = useProfile();
  const [tab, setTab] = useState<Tab>('profile');
  const [config, setConfig] = useState({ persona_prompt: '', whatsapp_phone_id: '', whatsapp_verify_token: '', backend_url: import.meta.env.VITE_API_URL || 'http://localhost:8000', full_name: '', org_title: '', account_status: 'Active Founder Key' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) setConfig(c => ({ ...c, full_name: profile.full_name || '', org_title: profile.agency_name || '' }));
    if (profile?.agency_logo) setLogoPreview(profile.agency_logo);
  }, [profile]);

  useEffect(() => {
    (async () => {
      try {
        const d = await getAIConfig();
        setConfig(c => ({ ...c, persona_prompt: d.persona_prompt || '', whatsapp_phone_id: d.whatsapp_phone_id || '', whatsapp_verify_token: d.whatsapp_verify_token || '', backend_url: d.backend_url || import.meta.env.VITE_API_URL || 'http://localhost:8000' }));
      } catch (e) { console.error('Failed to load config', e); }
      finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true); setMsg({ text: '', type: '' });
    try {
      await updateAIConfig(config);
      if (user?.id) {
        const { error: ue } = await supabase.from('users').update({ full_name: config.full_name }).eq('id', user.id);
        if (ue) throw ue;
        const aid = profile?.agency_id ?? null;
        if (aid) { const { error: ae } = await supabase.from('agencies').update({ agency_name: config.org_title }).eq('id', aid); if (ae) throw ae; }
        else if (config.org_title.trim()) {
          // Bootstrap path for an account with no agency yet. The id is
          // generated client-side because the agencies SELECT policy
          // (`id = get_my_agency_id()`) cannot see the row until this user is
          // linked, so `.select('id')` after the insert would be rejected.
          const newAgencyId = crypto.randomUUID();
          const { error: ce } = await supabase.from('agencies').insert({ id: newAgencyId, agency_name: config.org_title.trim(), email: user.email || null });
          if (ce) throw ce;
          const { error: le } = await supabase.from('users').update({ agency_id: newAgencyId }).eq('id', user.id);
          if (le) throw le;
        }
        await refreshProfile();
      }
      setMsg({ text: 'ARCHITECTURES SYNCHRONISÉES', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch { setMsg({ text: 'ERREUR DE LIAISON SYSTÈME', type: 'error' }); }
    finally { setSaving(false); }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !user?.id) return;
    if (!profile?.agency_id) { setMsg({ text: "Enregistrez d'abord le nom de l'agence.", type: 'error' }); return; }
    setUploading(true); setMsg({ text: '', type: '' });
    try {
      const url = URL.createObjectURL(file); setLogoPreview(url);
      const ext = file.name.split('.').pop(); const fn = `${user.id}-${Date.now()}.${ext}`;
      const { error: ue } = await supabase.storage.from('agency-logos').upload(fn, file, { upsert: true });
      if (ue) throw ue;
      const { data: ud } = supabase.storage.from('agency-logos').getPublicUrl(fn);
      await updateAgencyLogo(ud.publicUrl); setLogoPreview(ud.publicUrl);
      setMsg({ text: 'Logo mis à jour avec succès.', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err: any) { setMsg({ text: err.message || 'Erreur upload logo.', type: 'error' }); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <Cpu className="w-7 h-7 text-emerald-400 animate-spin" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Initialisation de la Console...</span>
    </div>
  );

  const tabs: TabCardProps[] = [
    { id: 'profile', label: 'Profil & Admin', icon: User },
    { id: 'ai', label: 'Identité Digitale IA', icon: Bot },
    { id: 'api', label: 'Passerelles API', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Configuration Centrale</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-0.5">Noyau Administratif AqarBot V3.0</p>
            </div>
          </div>
          <button onClick={save} disabled={saving} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20">
            {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            SAUVEGARDER L&apos;ARCHITECTURE
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/40 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all z-10 ${tab === t.id ? 'text-white shadow-lg shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
              <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? 'text-emerald-400' : 'text-slate-600'}`} />
              {t.label}
              {tab === t.id && (
                <motion.div layoutId="settingsTab" className="absolute inset-0 bg-emerald-500/10 rounded-xl shadow-xl z-[-1] border border-emerald-500/20" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="card-glass p-6 rounded-xl">
            {tab === 'profile' && (
              <div className="space-y-6">
                {/* Profile header */}
                <div className="flex items-center gap-4 pb-5 border-b border-slate-800/50">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center shadow-lg overflow-hidden">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <User className="w-9 h-9 text-emerald-400" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Profil Administrateur</h3>
                    <div className="flex items-center gap-2 mt-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg w-fit border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{profile?.role || 'Owner'} · Vérifié</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label-modern">Nom Complet</label>
                    <input type="text" className="input-modern" value={config.full_name} onChange={e => setConfig({ ...config, full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-modern">Nom de l&apos;Agence</label>
                    <input type="text" className="input-modern" value={config.org_title} onChange={e => setConfig({ ...config, org_title: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-modern">Statut du Compte</label>
                    <div className="input-modern bg-emerald-500/5 border-emerald-500/20 text-emerald-400 italic">
                      {config.account_status}
                    </div>
                  </div>
                  <div>
                    <label className="label-modern">Sécurité</label>
                    <button className="w-full px-4 py-3 card-glass bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all">
                      <Lock className="w-3.5 h-3.5" /> Modifier le Mot de Passe
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-modern">Logo de l&apos;Agence</label>
                    <div onClick={() => logoRef.current?.click()} className="group relative flex flex-col items-center justify-center gap-3 p-8 card-glass bg-slate-800/20 border-2 border-dashed border-slate-700/50 hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all">
                      {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="h-20 w-auto object-contain rounded-xl" /> : (
                        <>
                          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <Image className="w-7 h-7 text-emerald-400/60" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cliquer pour uploader le logo</p>
                          <p className="text-[9px] text-slate-600">PNG, JPG, SVG · Max 5MB</p>
                        </>
                      )}
                      {uploading && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm"><Loader2 className="w-9 h-9 text-emerald-400 animate-spin" /></div>}
                      {logoPreview && !uploading && <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors"><Upload className="w-3.5 h-3.5" /> Changer le logo</div>}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
                  </div>
                </div>

                {(profile?.role === 'Owner' || !profile) && (
                  <div className="pt-5 border-t border-slate-800/50">
                    <TeamManagement agencyId={profile?.agency_id ?? null} />
                  </div>
                )}
              </div>
            )}

            {tab === 'ai' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Schéma IA Gemini</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Identité Digitale &amp; Logique de Réponse</p>
                  </div>
                  <Cpu className="w-9 h-9 text-emerald-500/20" />
                </div>
                <div>
                  <label className="label-modern">Persona de l&apos;Agent Master</label>
                  <textarea rows={10} value={config.persona_prompt} onChange={e => setConfig({ ...config, persona_prompt: e.target.value })} className="input-modern min-h-[200px] p-5 rounded-xl text-sm font-medium leading-relaxed resize-none font-mono shadow-inner" placeholder="Définissez comment l'IA interagit avec les clients..." />
                  <p className="text-[9px] text-slate-500 font-bold italic mt-2 px-1">Compilé comme instruction système pour Google Gemini 1.5 Pro.</p>
                </div>
              </div>
            )}

            {tab === 'api' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Passerelles API</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Liaisons WhatsApp Business &amp; Backend</p>
                  </div>
                  <Zap className="w-9 h-9 text-amber-400/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label-modern">Identifiant Téléphone ID (Meta)</label>
                    <input type="text" className="input-modern" value={config.whatsapp_phone_id} onChange={e => setConfig({ ...config, whatsapp_phone_id: e.target.value })} placeholder="ID de téléphone Meta Cloud" />
                  </div>
                  <div>
                    <label className="label-modern">Jeton de Vérification (Verify Token)</label>
                    <input type="text" className="input-modern" value={config.whatsapp_verify_token} onChange={e => setConfig({ ...config, whatsapp_verify_token: e.target.value })} placeholder="Verify Token pour le Webhook" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-modern">Point d&apos;Accès Backend URL</label>
                    <div className="flex gap-3">
                      <input type="text" className="input-modern flex-1 text-emerald-400" value={config.backend_url} onChange={e => setConfig({ ...config, backend_url: e.target.value })} />
                      <div className="input-modern bg-emerald-500/5 border-emerald-500/20 flex items-center gap-2 px-4">
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

        {msg.text && (
          <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 10, x: '-50%' }} className={`fixed bottom-6 left-1/2 px-6 py-2.5 rounded-xl font-black text-xs tracking-widest border shadow-lg z-50 ${msg.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20'}`}>
            {msg.text}
          </motion.div>
        )}
      </div>
    </div>
  );
}
