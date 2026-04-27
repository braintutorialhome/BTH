import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { BookOpen, FileText, Video, ExternalLink, Box } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function StudentMaterials() {
  const { materials } = useStorage();

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-2">
         <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Study Materials</p>
         <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Study Materials <span className="text-slate-700">/</span> Academic Assets</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {materials.map(m => (
          <div key={m.id} className="glass p-10 rounded-[50px] border border-white/5 hover:bg-white/[0.03] transition-all group flex flex-col justify-between relative overflow-hidden group">
             {/* Hover glow */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-0 group-hover:opacity-[0.03] rounded-full blur-3xl transition-opacity"></div>
             
             <div className="space-y-10 relative z-10">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6 ${
                  m.type === 'pdf' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                  m.type === 'video' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {m.type === 'pdf' ? <FileText size={32}/> : m.type === 'video' ? <Video size={32}/> : <BookOpen size={32}/>}
                </div>
                <div>
                   <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors mb-3">{m.title}</h3>
                   <div className="flex items-center gap-4">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                            m.type === 'pdf' ? 'bg-rose-500' : m.type === 'video' ? 'bg-blue-500' : 'bg-emerald-500'
                         }`}></div> {m.type} Archive
                      </span>
                      <span className="text-slate-800 text-xs">/</span>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-600">
                        Released {safeFormat(m.uploadDate, 'dd MMM yyyy')}
                      </span>
                   </div>
                </div>
             </div>
             
             <div className="mt-12 relative z-10">
               <a 
                 href={m.url} 
                 target="_blank" 
                 rel="noreferrer"
                 className="w-full py-5 glass-button border-white/5 bg-white/5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white transition-all group/btn"
               >
                 Initiate Retrieval <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
               </a>
             </div>
          </div>
        ))}
        {materials.length === 0 && (
          <div className="col-span-full py-32 text-center glass rounded-[60px] border-2 border-dashed border-white/5">
            <Box size={50} className="mx-auto mb-8 text-slate-800" />
            <p className="text-slate-600 font-bold uppercase tracking-widest text-[11px]">No encrypted data streams available</p>
          </div>
        )}
      </div>
    </div>
  );
}
