import { useState, useRef } from 'react';
import { Upload, FileCheck, Trash2, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataRow {
  id: number;
  City: string;
  Nighberd: string;
  Type: string;
  new_price: number | string;
  [key: string]: any;
}

interface CRMDataTableProps {
  data: DataRow[];
  onDelete?: (id: number) => void;
  onBulkUpload?: (file: File) => void;
  title?: string;
}

export default function CRMDataTable({ data, onDelete, onBulkUpload, title: _title = "Catalogue de Données" }: CRMDataTableProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => 
    row.City?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.Nighberd?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.Type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) onBulkUpload?.(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
          isDragging ? 'border-primary bg-primary/10' : 'border-slate-200 dark:border-white/10 hover:border-primary/40'
        }`}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={(e) => e.target.files?.[0] && onBulkUpload?.(e.target.files[0])} />
        <div className="p-4 bg-primary/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h4 className="text-sm font-black dark:text-white uppercase tracking-widest flex items-center gap-3">
          Ingestion des Données CSV
          <span className="text-[10px] text-slate-500 font-mono opacity-60">· Synchronisation Cerveau AqarBot</span>
        </h4>
      </motion.div>

      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Rechercher dans le Catalogue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/40 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Standardized CRM Table */}
      <div className="glass-panel rounded-2xl overflow-hidden neon-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-black/20 text-slate-500 dark:text-slate-400 text-[10px] font-mono tracking-widest uppercase">
              <tr>
                <th className="px-6 py-5 font-bold">Localisation (Ville / Quartier)</th>
                <th className="px-6 py-5 font-bold">Type de Bien</th>
                <th className="px-6 py-5 font-bold text-right">Prix Cible (MAD)</th>
                <th className="px-6 py-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              <AnimatePresence mode="popLayout">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500 font-mono text-sm">
                      AUCUNE DONNÉE ANALYTIQUE TROUVÉE DANS LE CATALOGUE
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{row.City}</span>
                          <span className="text-[10px] font-mono opacity-60 uppercase">{row.Nighberd}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent font-bold text-[10px] uppercase border border-accent/20">
                          {row.Type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-950 dark:text-white text-right">
                        {typeof row.new_price === 'number' ? row.new_price.toLocaleString() : row.new_price}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => onDelete?.(row.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group/btn"
                          >
                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-mono text-primary/60 px-2 uppercase tracking-tight">
        <FileCheck className="w-3 h-3" /> Système Synchronisé avec le Store RAG Supabase
      </div>
    </div>
  );
}
