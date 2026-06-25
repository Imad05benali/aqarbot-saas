import { useState, useEffect } from 'react';
import { Building, Plus, Trash2, Activity, X } from 'lucide-react';
import { getProperties, createProperty, deleteProperty } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

type Property = {
  id: number;
  title: string;
  description: string;
  price: number;
  sector: string;
  city: string;
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
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
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
    price: '',
    sector: '',
    city: '',
    agency_id: 0, // In MVP, backend assigns or dummy 0
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getProperties();
      setProperties(data.properties || []);
      setError('');
    } catch (err: any) {
      setError('Failed to load properties.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty(id);
      fetchData(); // Refresh list
    } catch (err: any) {
      alert('Failed to delete property');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProperty({
        ...formData,
        price: parseFloat(formData.price),
        agency_id: 0 // Replace with actual current agency ID logic if needed
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', price: '', sector: '', city: '', agency_id: 0 });
      fetchData(); // Refresh list
    } catch (err: any) {
      alert('Failed to add property');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-10 h-10 text-tertiary animate-pulse-slow" />
          <p className="text-primary dark:text-tertiary font-mono tracking-widest text-lg neon-text">LOADING PROPERTIES...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-[1440px] mx-auto"
    >
      {/* Header Area */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building className="w-8 h-8 text-primary dark:text-tertiary" />
            Inventory Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm">
            Manage your properties. The AI uses these properties to respond to clients.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-blue-700 dark:bg-tertiary dark:hover:bg-[#1fa344] text-white font-bold tracking-widest uppercase py-3 px-6 rounded-xl transition-all duration-300 shadow-lg dark:shadow-[0_0_20px_rgba(33,160,65,0.3)] hover:scale-[1.02] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20 font-mono">
          {error}
        </div>
      )}

      {/* Properties Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl overflow-hidden neon-border relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-black/20 text-slate-500 dark:text-slate-400 text-xs font-mono">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">TITLE</th>
                <th className="px-6 py-4 font-semibold tracking-wider">SECTOR</th>
                <th className="px-6 py-4 font-semibold tracking-wider">CITY</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">PRICE (MAD)</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-mono text-sm">
                    NO PROPERTIES FOUND IN INVENTORY
                  </td>
                </tr>
              ) : (
                properties.map((prop, i) => (
                  <motion.tr 
                    key={prop.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{prop.title}</td>
                    <td className="px-6 py-4">{prop.sector}</td>
                    <td className="px-6 py-4">{prop.city}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white text-right">
                      {prop.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(prop.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

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
                  <Plus className="w-6 h-6 text-primary dark:text-tertiary" />
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-tertiary focus:border-transparent transition-all outline-none"
                    placeholder="e.g. Modern Apartment in Maarif"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">Sector</label>
                    <input
                      type="text"
                      required
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-tertiary focus:border-transparent transition-all outline-none"
                      placeholder="e.g. Maarif"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider text-slate-700 dark:text-slate-300 mb-2 uppercase">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-tertiary focus:border-transparent transition-all outline-none"
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
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-tertiary focus:border-transparent transition-all outline-none font-mono"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-tertiary focus:border-transparent transition-all outline-none resize-none"
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
                    className="bg-primary hover:bg-blue-700 dark:bg-tertiary dark:hover:bg-[#1fa344] text-white font-bold tracking-widest uppercase py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? 'SAVING...' : 'SAVE PROPERTY'}
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
