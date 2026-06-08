import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Plus, Trash2, Link as LinkIcon, ExternalLink, Search, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminResults: React.FC = () => {
  const { resultLinks, addResultLink, deleteResultLink } = useStorage();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    
    // Ensure URL has protocol
    let finalUrl = formData.url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    addResultLink({
      title: formData.title,
      description: formData.description,
      url: finalUrl
    });
    
    setFormData({ title: '', description: '', url: '' });
    setIsAdding(false);
  };

  const filteredResults = resultLinks.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-black text-xl text-white tracking-tight">Result Management</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Post and manage result links for students</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="indigo-button px-8 py-3.5 text-xs font-black uppercase tracking-widest"
          >
            Publish Result
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/5 p-8 rounded-[32px] mb-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white tracking-tight uppercase">Add New Result Link</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="text-xs font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Result Title</label>
                  <input
                    type="text"
                    required
                    className="input-glass w-full py-3"
                    placeholder="e.g. Annual Exams 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Result URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      className="input-glass w-full pl-10 py-3"
                      placeholder="e.g. drive.google.com/..."
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description (Optional)</label>
                  <textarea
                    rows={2}
                    className="input-glass w-full py-3 resize-none"
                    placeholder="Short description or instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="indigo-button px-8 py-3.5 text-xs font-black uppercase tracking-widest"
                  >
                    Publish Result
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Search Results</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title or description..."
              className="input-glass w-full pl-10 py-3 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-[40px] overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white tracking-tight uppercase">Published Results</h3>
          <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/20">{filteredResults.length} Results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs uppercase font-black tracking-wider">
                <th className="px-8 py-5">Result Details</th>
                <th className="px-8 py-5">URL</th>
                <th className="px-8 py-5">Date Published</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <motion.tr 
                    key={result.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">{result.title}</span>
                        {result.description && (
                          <span className="text-slate-400 mt-1">{result.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 font-bold gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Result
                      </a>
                    </td>
                    <td className="px-8 py-5 text-slate-300">
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => {
                          if(confirm('Are you sure you want to delete this result link?')) {
                            deleteResultLink(result.id);
                          }
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-gray-500 italic">
                    <div className="flex flex-col items-center justify-center opacity-45">
                      <FileText size={48} className="text-teal-400 mb-4" />
                      <p className="text-white font-black uppercase tracking-wider text-sm">No result links published yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
