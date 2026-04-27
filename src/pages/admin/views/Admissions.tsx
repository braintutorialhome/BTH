import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Check, X, FileText, User, MapPin, Calendar } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function AdmissionManagement() {
  const { students, approveStudent, rejectStudent } = useStorage();
  const pending = students.filter(s => s.status === 'pending');

  return (
    <div className="space-y-8 max-w-5xl">
      {pending.length === 0 ? (
        <div className="glass p-20 rounded-[40px] text-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-slate-600" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Clean Slates</h3>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No pending student applications</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pending.map(s => (
            <div key={s.id} className="glass p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-all hover:bg-white/10 group">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  {s.name.charAt(0)}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-2xl tracking-tight text-white mb-1">{s.name}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                       <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <User size={14} className="text-indigo-400" /> {s.fatherName}
                       </span>
                       <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <MapPin size={14} className="text-indigo-400" /> {s.address}
                       </span>
                       {s.dateOfJoining && (
                         <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           <Calendar size={14} className="text-indigo-400" /> Joined on {safeFormat(s.dateOfJoining, 'dd MMM yyyy')}
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black tracking-widest text-indigo-100 uppercase">
                      Class {s.class}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black tracking-widest text-indigo-100 uppercase">
                      {s.subject}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => approveStudent(s.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Approve
                </button>
                <button 
                   onClick={() => rejectStudent(s.id)}
                  className="flex-1 md:flex-none px-6 py-3 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
