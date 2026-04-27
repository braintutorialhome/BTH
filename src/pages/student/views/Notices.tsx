import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student } from '../../../types';
import { Bell, Megaphone, Calendar, ShieldCheck, AlertCircle, Trophy, FileText } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentNotices({ student }: { student: Student }) {
  const { notices } = useStorage();

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Notices</p>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Notices</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key="notices"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="max-w-5xl space-y-10"
        >
          {notices.slice().reverse().map(n => (
            <div key={n.id} className={`glass p-12 rounded-[60px] border relative overflow-hidden group transition-all hover:translate-x-3 ${
              n.isImportant ? 'border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent' : 'border-white/5'
            } shadow-2xl`}>
               {n.isImportant && (
                 <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.8] group-hover:rotate-0 transition-all duration-1000 pointer-events-none">
                   <Bell size={180} />
                 </div>
               )}
               
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10 font-black">
                 <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-3xl ${n.isImportant ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-white/5 text-slate-500 border border-white/5'} transition-all group-hover:rotate-6`}>
                     <Megaphone size={28} />
                   </div>
                   <div className="space-y-1">
                      <p className={`text-xs uppercase tracking-widest ${n.isImportant ? 'text-orange-400' : 'text-slate-600'}`}>{n.isImportant ? 'Priority Notice' : 'Notice'}</p>
                      <span className="text-xs uppercase tracking-widest text-slate-500">
                          {safeFormat(n.date, 'dd MMMM yyyy, HH:mm')}
                      </span>
                   </div>
                 </div>
                 
                 {n.isImportant && (
                   <span className="bg-orange-500/10 text-orange-400 text-xs font-black tracking-widest uppercase px-4 py-2 rounded-full border border-orange-500/20 flex items-center gap-2 animate-pulse">
                      <AlertCircle size={12} /> Critcal Intel
                   </span>
                 )}
               </div>
               
               <div className="relative z-10 space-y-4">
                 <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight group-hover:text-indigo-400 transition-colors">{n.title}</h3>
                 <p className={`text-xl leading-relaxed max-w-4xl ${n.isImportant ? 'text-slate-300 font-medium italic' : 'text-slate-500'}`}>
                   {n.content}
                 </p>
               </div>
  
               <div className="mt-12 flex items-center gap-3 relative z-10">
                  <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className={`h-full ${n.isImportant ? 'bg-orange-500' : 'bg-indigo-600'}`} style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">End of stream</span>
               </div>
            </div>
          ))}
          {notices.length === 0 && (
            <div className="py-40 text-center glass rounded-[80px] border-2 border-dashed border-white/5">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-800">
                 <Megaphone size={48} />
              </div>
              <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Frequency silence • No notices active</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
