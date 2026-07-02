import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { toggleAIPause } from '../services/api';

interface TakeoverToggleProps {
  phone: string;
  initialPaused?: boolean;
  onStatusChange?: (newStatus: boolean) => void;
}

export default function TakeoverToggle({ phone, initialPaused = false, onStatusChange }: TakeoverToggleProps) {
  const [isPaused, setIsPaused] = useState(initialPaused);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      const newStatus = !isPaused;
      await toggleAIPause(phone, newStatus);
      setIsPaused(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err) {
      console.error('Takeover toggle failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shadow-md transform hover:scale-105 active:scale-95 ${
        isPaused
          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
          : 'bg-primary/10 text-primary border border-primary/30'
      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isPaused ? (
        <>
          <Pause className="w-3.5 h-3.5 animate-pulse" />
          <span>Manual Mode</span>
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5" />
          <span>AI Active</span>
        </>
      )}
    </button>
  );
}
