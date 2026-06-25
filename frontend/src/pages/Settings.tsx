import { useState, useEffect } from 'react';
import { Bot, Briefcase, Smile, MessageSquareText } from 'lucide-react';
import { getSettingsData, updateSettingsData } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

type AITone = 'Sérieux' | 'Amical' | 'Commercial';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Settings() {
  const [tone, setTone] = useState<AITone>('Sérieux');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  const tones: { id: AITone; icon: any; description: string }[] = [
    { id: 'Sérieux', icon: Briefcase, description: 'Professional, direct, and formal. Ideal for high-end properties.' },
    { id: 'Amical', icon: Smile, description: 'Friendly, warm, and approachable. Uses Darija casually.' },
    { id: 'Commercial', icon: MessageSquareText, description: 'Sales-focused, persuasive, and highlights property benefits aggressively.' }
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettingsData();
        if (data.ai_tone) {
          setTone(data.ai_tone as AITone);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage({ text: '', type: '' });
    try {
      await updateSettingsData(tone);
      setSaveMessage({ text: 'CONFIGURATION SYNCED SUCCESS', type: 'success' });
      setTimeout(() => setSaveMessage({ text: '', type: '' }), 4000);
    } catch (error) {
      console.error('Failed to save settings', error);
      setSaveMessage({ text: 'SYNC FAILURE: ERROR 500', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Bot className="w-10 h-10 text-primary animate-pulse-slow" />
          <p className="text-primary dark:text-tertiary font-mono tracking-widest text-lg neon-text">LOADING NEURAL CORE...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl space-y-6"
    >
      <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-tertiary/30 rounded-br-3xl"></div>

        <div className="flex items-center gap-5 mb-10 relative z-10">
          <div className="p-4 bg-primary/10 dark:bg-black/40 rounded-2xl text-primary dark:text-tertiary border border-primary/20 dark:border-tertiary/20 shadow-inner">
            <Bot className="w-10 h-10 animate-float" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Core Configuration</h2>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mt-1 uppercase tracking-wider">Neural Engine Parameters</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div>
            <h3 className="text-sm font-mono tracking-widest text-slate-900 dark:text-white mb-6 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow"></span>
              Select Conversation Tone
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tones.map((t) => {
                const Icon = t.icon;
                const isActive = tone === t.id;
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden ${
                      isActive 
                        ? 'border-primary dark:border-tertiary bg-primary/5 dark:bg-tertiary/10 shadow-[0_0_20px_rgba(33,160,65,0.15)]' 
                        : 'border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 bg-white/50 dark:bg-black/20'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    )}
                    <Icon className={`w-8 h-8 mb-5 relative z-10 transition-colors ${isActive ? 'text-primary dark:text-tertiary drop-shadow-[0_0_8px_rgba(33,160,65,0.5)]' : 'text-slate-400 dark:text-slate-500'}`} />
                    <h4 className={`text-lg font-bold mb-3 relative z-10 uppercase tracking-wide ${isActive ? 'text-primary dark:text-white' : 'text-slate-900 dark:text-slate-300'}`}>
                      {t.id}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 relative z-10 leading-relaxed">{t.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="h-8 flex items-center">
              <AnimatePresence mode="wait">
                {saveMessage.text && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-xs font-mono font-bold tracking-widest uppercase ${saveMessage.type === 'success' ? 'text-tertiary drop-shadow-[0_0_8px_rgba(33,160,65,0.4)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}
                  >
                    {saveMessage.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-blue-700 dark:bg-tertiary dark:hover:bg-[#1fa344] disabled:bg-primary/50 dark:disabled:bg-tertiary/30 disabled:cursor-not-allowed text-white font-mono font-bold tracking-widest text-sm uppercase py-3 px-8 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg dark:shadow-[0_0_20px_rgba(33,160,65,0.2)]"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  SYNCING...
                </>
              ) : 'UPDATE CORE'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
