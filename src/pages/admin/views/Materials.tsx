import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Plus, BookOpen, Trash2, FileText, Video, ExternalLink, X } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function StudyMaterialManagement() {
  const { materials, addMaterial, deleteMaterial } = useStorage();
  const [showAdd, setShowAdd] = useState(false);
  const [newMat, setNewMat] = useState({ title: '', type: 'pdf', url: '', description: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMat.title || !newMat.url) return;
    addMaterial(newMat as any);
    setShowAdd(false);
    setNewMat({ title: '', type: 'pdf', url: '', description: '' });
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center bg-white/5 p-8 rounded-[40px] border border-white/5">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg border border-emerald-500/20">
             <BookOpen size={32} />
           </div>
           <div>
             <h3 className="font-black text-2xl text-white tracking-tight">Digital Library</h3>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Manage and sharing learning assets</p>
           </div>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="px-10 py-4 glass-button text-xs font-black uppercase tracking-widest border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white"
        >
          Add New Asset
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[60] flex items-center justify-center p-6">
          <div className="glass rounded-[50px] shadow-2xl w-full max-w-xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-10 bg-emerald-600 text-white flex justify-between items-center">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Add Asset</h2>
              <button onClick={() => setShowAdd(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Title</label>
                <input 
                  required
                  type="text" 
                  value={newMat.title}
                  onChange={(e) => setNewMat({...newMat, title: e.target.value})}
                  className="input-glass w-full py-4 rounded-2xl font-bold"
                  placeholder="e.g. Advanced JavaScript Handbook"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resource Type</label>
                  <select 
                    value={newMat.type}
                    onChange={(e) => setNewMat({...newMat, type: e.target.value as any})}
                    className="input-glass w-full py-4 px-6 rounded-2xl font-bold appearance-none cursor-pointer"
                  >
                    <option value="pdf">📄 PDF Document</option>
                    <option value="note">📝 Text Note</option>
                    <option value="video">🎥 Video URL</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Public URL</label>
                   <input 
                    required
                    type="url" 
                    value={newMat.url}
                    onChange={(e) => setNewMat({...newMat, url: e.target.value})}
                    className="input-glass w-full py-4 rounded-2xl text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20">
                Confirm & Upload
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materials.map(m => (
          <div key={m.id} className="glass p-8 rounded-[40px] group hover:bg-white/10 transition-all border border-white/5 relative flex flex-col justify-between min-h-[240px]">
             <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    m.type === 'pdf' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                    m.type === 'video' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {m.type === 'pdf' ? <FileText size={28}/> : m.type === 'video' ? <Video size={28}/> : <BookOpen size={28}/>}
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this study material asset?')) {
                        deleteMaterial(m.id);
                      }
                    }}
                    className="p-3 text-slate-500 hover:text-rose-500 hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight leading-tight mb-2">{m.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Updated {safeFormat(m.uploadDate, 'MMM dd, yyyy')}
                </p>
             </div>

             <a 
               href={m.url} 
               target="_blank" 
               rel="noreferrer"
               className="mt-8 py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all"
             >
               Access Resource <ExternalLink size={14} />
             </a>
          </div>
        ))}
        {materials.length === 0 && (
          <div className="col-span-full py-32 text-center glass rounded-[60px] border-2 border-dashed border-white/5">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-700">
               <BookOpen size={40} />
             </div>
             <p className="text-slate-500 font-bold">No assets found in digital vault.</p>
          </div>
        )}
      </div>
    </div>
  );
}
