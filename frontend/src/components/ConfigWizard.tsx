import { useState } from 'react';
import { Terminal, Save, Smartphone, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfigData {
  persona_prompt: string;
  whatsapp_phone_id: string;
  whatsapp_verify_token: string;
  backend_url: string;
}

interface ConfigWizardProps {
  initialData: ConfigData;
  onSave: (data: ConfigData) => Promise<void>;
}

export default function ConfigWizard({ initialData, onSave }: ConfigWizardProps) {
  const [formData, setFormData] = useState<ConfigData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Intelligence Block */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <Terminal className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold dark:text-white uppercase tracking-tight">AI Persona Definition</h3>
        </div>
        
        <div className="space-y-4 relative z-10">
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">System Prompt Architecture</label>
          <textarea 
            value={formData.persona_prompt}
            onChange={(e) => setFormData({...formData, persona_prompt: e.target.value})}
            className="w-full h-48 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-slate-900 dark:text-slate-300 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
            placeholder="Introduce the bot persona here..."
          />
          <p className="text-[10px] text-slate-400 font-mono italic">
            Note: This content is injected into Gemini Gemini-2.0-Flash-Lite for every user session.
          </p>
        </div>
      </div>

      {/* Connectivity Block */}
      <div className="glass-panel p-8 rounded-3xl border-l-4 border-l-primary">
        <div className="flex items-center gap-4 mb-8">
          <Smartphone className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold dark:text-white uppercase tracking-tight">Channel Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Phone ID
            </label>
            <input 
              type="text"
              value={formData.whatsapp_phone_id}
              onChange={(e) => setFormData({...formData, whatsapp_phone_id: e.target.value})}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 text-slate-950 dark:text-white font-mono text-sm shadow-sm"
              placeholder="e.g. 1093229547216157"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
              <Mail className="w-3.5 h-3.5" /> Verify Token
            </label>
            <input 
              type="text"
              value={formData.whatsapp_verify_token}
              onChange={(e) => setFormData({...formData, whatsapp_verify_token: e.target.value})}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 text-slate-950 dark:text-white font-mono text-sm shadow-sm"
              placeholder="e.g. aqarbot_2024"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-3">
            <label className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest font-bold text-accent">
              <Terminal className="w-3.5 h-3.5" /> Backend Global Endpoint
            </label>
            <input 
              type="text"
              value={formData.backend_url || import.meta.env.VITE_API_URL || 'http://localhost:8000'}
              onChange={(e) => setFormData({...formData, backend_url: e.target.value})}
              className="w-full p-4 rounded-xl border border-accent/20 dark:border-accent/10 bg-accent/5 dark:bg-accent/5 text-slate-950 dark:text-white font-mono text-sm shadow-sm focus:ring-1 focus:ring-accent"
              placeholder={import.meta.env.VITE_API_URL || "http://localhost:8000"}
            />
          </div>
        </div>
      </div>

      {/* Persistence Action */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSaving}
          className="bg-primary hover:bg-emerald-600 text-black font-bold tracking-[0.2em] uppercase py-4 px-12 rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black animate-spin rounded-full" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'SYNCING CORE...' : 'UPDATE ARCHITECTURE'}
        </motion.button>
      </div>
    </form>
  );
}
