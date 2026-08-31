import { useState, useEffect } from 'react';
import { Plus, Activity, X, Database } from 'lucide-react';
import { getProperties, createProperty, deleteProperty } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import CRMDataTable from '../components/CRMDataTable';

type Property = {
  id: number;
  title: string;
  description: string;
  new_price: number;
  Nighberd: string;
  City: string;
  Type: string;
  agency_id: number;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
  }
};

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    new_price: '',
    Nighberd: '',
    City: '',
    Type: 'Appartement',
    agency_id: 0, 
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getProperties();
      setProperties(data.properties || []);
      setError('');
    } catch (err: any) {
      setError('Connection to AqarCore lost.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Erase this data point from AqarBot brain?')) return;
    try {
      await deleteProperty(id);
      fetchData();
    } catch (err: any) {
      setError('Erase failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProperty({
        ...formData,
        new_price: parseFloat(formData.new_price),
        agency_id: 0 
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', new_price: '', Nighberd: '', City: '', Type: 'Appartement', agency_id: 0 });
      fetchData();
    } catch (err: any) {
      setError('Entry creation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-primary animate-pulse-slow" />
          <p className="text-primary dark:text-tertiary font-mono tracking-widest text-lg neon-text">SCANNING CATALOG...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-[1440px] mx-auto pb-20"
    >
      {/* Module Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Database className="w-10 h-10 text-primary" />
            Moroccan Property Catalog
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm uppercase tracking-tighter">
            Systemic Inventory & RAG Context Controller
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-emerald-600 text-black font-bold tracking-widest uppercase py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Fast Entry
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <CRMDataTable 
          data={properties} 
          onDelete={handleDelete}
          onBulkUpload={(file) => {
            alert(`Simulation: Ingesting ${file.name}...`);
          }}
        />
      </motion.div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20 font-mono text-xs">
          {error}
        </div>
      )}

      {/* Add Property Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-6 h-6 text-primary" />
                  Add New Property
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="e.g. Modern Apartment in Maarif"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">Sector</label>
                    <input
                      type="text"
                      required
                      value={formData.Nighberd}
                      onChange={(e) => setFormData({...formData, Nighberd: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="e.g. Maarif"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">City</label>
                    <input
                      type="text"
                      required
                      value={formData.City}
                      onChange={(e) => setFormData({...formData, City: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                      placeholder="e.g. Casablanca"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">Price (MAD)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.new_price}
                    onChange={(e) => setFormData({...formData, new_price: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-mono"
                    placeholder="e.g. 1200000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none px-4"
                    placeholder="Describe the property..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-emerald-600 text-black font-bold tracking-widest uppercase py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? 'PROCESSING...' : 'SAVE DATA POINT'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
