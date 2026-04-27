import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Plus, Bell, Trash2, Megaphone, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function NoticeManagement() {
  const { notices, addNotice, deleteNotice } = useStorage();
  const [showAdd, setShowAdd] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', isImportant: false });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    addNotice(newNotice);
    setShowAdd(false);
    setNewNotice({ title: '', content: '', isImportant: false });
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center bg-white/5 p-8 rounded-[40px] border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-orange-500/20 text-orange-400 rounded-2xl shadow-lg border border-orange-500/20">
             <Megaphone size={32} />
           </div>
           <div>
             <h3 className="font-black text-2xl text-white tracking-tight">Bulletin Center</h3>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Broadcast news and announcements</p>
           </div>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="indigo-button px-10 py-4 text-xs font-black uppercase tracking-widest"
        >
          Post Notice
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[60] flex items-center justify-center p-6">
          <div className="glass rounded-[50px] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="p-10 bg-gradient-to-r from-orange-600 to-rose-600 text-white flex justify-between items-center">
              <h2 className="text-3xl font-black tracking-tighter uppercase">New Notice</h2>
              <button onClick={() => setShowAdd(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-all">
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notice Headline</label>
                <input 
                  required
                  type="text" 
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  className="input-glass w-full py-4 rounded-2xl font-bold"
                  placeholder="e.g. Holiday Announcement"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Content Description</label>
                <textarea 
                  required
                  rows={4}
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                  className="input-glass w-full py-4 rounded-2xl resize-none"
                  placeholder="Details go here..."
                ></textarea>
              </div>
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full p-1 transition-all ${newNotice.isImportant ? 'bg-orange-500' : 'bg-white/10 border border-white/10'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full transition-transform ${newNotice.isImportant ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Mark as high priority</span>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={newNotice.isImportant}
                  onChange={(e) => setNewNotice({...newNotice, isImportant: e.target.checked})}
                />
              </label>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl">
                Post Notice Now
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {notices.slice().reverse().map(n => (
          <div key={n.id} className={`glass p-10 rounded-[40px] border relative group transition-all hover:translate-x-2 ${
            n.isImportant ? 'border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent' : 'border-white/5'
          }`}>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${n.isImportant ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-slate-500'}`}>
                    <Megaphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{n.title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                      {safeFormat(n.date, 'MMM dd, yyyy • HH:mm')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this notice?')) {
                      deleteNotice(n.id);
                    }
                  }}
                  className="p-4 text-slate-500 hover:text-rose-500 hover:bg-white/5 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
             </div>
             
             <p className="text-slate-400 leading-relaxed text-lg max-w-4xl">
               {n.content}
             </p>

             {n.isImportant && (
               <div className="absolute top-0 right-0 p-8">
                  <span className="bg-orange-600 text-white text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                    <AlertCircle size={10} /> Priority
                  </span>
               </div>
             )}
          </div>
        ))}
        {notices.length === 0 && (
          <div className="py-32 text-center glass rounded-[60px] border-2 border-dashed border-white/5">
             <Bell size={40} className="mx-auto mb-4 text-slate-800" />
             <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px]">No news in bulletin yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
