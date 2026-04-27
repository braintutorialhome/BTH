import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Calendar, User, Search, Check, X, Users } from 'lucide-react';

export default function AttendanceManagement() {
  const { students, attendance, markAttendance } = useStorage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const approved = students.filter(s => s.status === 'approved');
  const filtered = approved.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStatus = (studentId: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === selectedDate)?.status;
  };

  const handleMark = (studentId: string, status: 'present' | 'absent') => {
    markAttendance(selectedDate, studentId, status);
  };

  const presentCount = attendance.filter(a => a.date === selectedDate && a.status === 'present').length;
  const totalMarked = attendance.filter(a => a.date === selectedDate).length;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="glass p-10 rounded-[40px] flex flex-col justify-between">
           <div className="space-y-2">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operation Date</p>
             <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white/5 border-none p-0 text-3xl font-black text-white focus:ring-0 outline-none cursor-pointer"
            />
           </div>
           <p className="text-[10px] font-bold text-indigo-400 mt-6 flex items-center gap-2">
             <Calendar size={12}/> Select date to view/mark
           </p>
         </div>

         <div className="glass p-10 rounded-[40px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                 <Check size={28} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Present</p>
                  <h3 className="text-4xl font-black text-white">{presentCount}</h3>
               </div>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-6">
               <div className="h-full bg-emerald-500" style={{ width: `${(presentCount/approved.length || 1)*100}%` }}></div>
            </div>
         </div>

         <div className="glass p-10 rounded-[40px] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-8 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[1.7]">
               <Users size={120} />
            </div>
            <div className="flex justify-between items-start">
               <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                 <Users size={28} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Marked</p>
                  <h3 className="text-4xl font-black text-white">{totalMarked}/{approved.length}</h3>
               </div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-widest">Enrollment Status</p>
         </div>
      </div>

      <div className="glass rounded-[40px] overflow-hidden">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row gap-8 items-center justify-between bg-white/[0.01]">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Attendance Roll Call</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass w-full pl-14 py-4 rounded-2xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-10 py-6">Student Info</th>
                <th className="px-10 py-6">Current Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(s => {
                const status = getAttendanceStatus(s.id);
                return (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center font-black group-hover:bg-indigo-600 transition-colors">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white tracking-tight">{s.name}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.rollNumber} • {s.class}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {status ? (
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border flex items-center gap-2 w-fit ${
                          status === 'present' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {status === 'present' ? <Check size={12}/> : <X size={12}/>} {status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Not Marked</span>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleMark(s.id, 'present')}
                          className={`p-4 rounded-2xl transition-all shadow-lg ${
                            status === 'present' 
                              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                              : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-emerald-400'
                          }`}
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => handleMark(s.id, 'absent')}
                          className={`p-4 rounded-2xl transition-all shadow-lg ${
                            status === 'absent' 
                              ? 'bg-rose-500 text-white shadow-rose-500/20' 
                              : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-rose-400'
                          }`}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
