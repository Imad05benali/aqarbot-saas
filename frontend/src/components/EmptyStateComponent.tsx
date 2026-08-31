import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyStateComponent({ type }: { type: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 glacier-card rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
          <Bot className="w-10 h-10 text-slate-500" />
        </div>
        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic mb-3">
          Aucun {type === 'leads' ? 'lead capturé' : 'élément trouvé'}
        </h3>
        <p className="text-sm font-bold text-slate-400 max-w-[280px]">
          Votre Chatbot AqarBot est prêt à l'action !
        </p>
      </div>
    </motion.div>
  );
}
