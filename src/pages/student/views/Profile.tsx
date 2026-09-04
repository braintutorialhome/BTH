import React from 'react';
import { Link } from 'react-router-dom';
import { Student } from '../../../types';
import { User, Phone, MapPin, Calendar, Book, Layers, ShieldCheck, Eye } from 'lucide-react';

export default function StudentProfile({ student }: { student: Student }) {

  const infoItems = [
    { label: "Guardian's Name", value: student.fatherName, icon: ShieldCheck, color: 'indigo' },
    { label: 'Date of Birth', value: (() => {
      const date = new Date(student.dob);
      if (isNaN(date.getTime())) return student.dob;
      const day = date.getDate();
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    })(), icon: Calendar, color: 'purple' },
    { label: 'Date of Joining', value: (() => {
      if (!student.dateOfJoining) return 'N/A';
      const date = new Date(student.dateOfJoining);
      if (isNaN(date.getTime())) return student.dateOfJoining;
      const day = date.getDate();
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    })(), icon: Calendar, color: 'indigo' },
    { label: 'Biological Marker', value: student.gender, icon: User, color: 'blue' },
    { label: 'Subjects', value: student.subject, icon: Book, color: 'emerald' },
    { label: 'Present Class', value: student.class, icon: Layers, color: 'orange' },
    { label: 'Session', value: student.semester || 'N/A', icon: Layers, color: 'rose' },
    { label: 'Mobile Number', value: student.mobile, icon: Phone, color: 'sky' },
    { label: 'WhatsApp Number', value: student.whatsapp || 'N/A', icon: Phone, color: 'emerald' },
    { label: 'Address', value: student.address, icon: MapPin, color: 'amber' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
           <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Profile</p>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Student Profile <span className="text-slate-700">/</span> {student.rollNumber}</h1>
        </div>
        <Link 
          to="/student/overview" 
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 border border-cyan-400/30 w-fit"
        >
          <Eye size={15} />
          <span>View My Overview</span>
        </Link>
      </div>

      <div className="glass rounded-[60px] border border-white/5 overflow-hidden shadow-2xl relative group">
        <div className="h-64 bg-gradient-to-r from-indigo-600 via-indigo-900 to-slate-950 relative overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
           <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.7] transition-transform duration-1000">
             <User size={200} />
           </div>
        </div>
        
        <div className="px-12 pb-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 -mt-20 mb-16">
            <div className="flex flex-col md:flex-row items-end gap-8">
              <div 
                className="w-48 h-48 rounded-[40px] border-[10px] border-[#0f172a] bg-slate-900 flex items-center justify-center text-7xl font-black text-white shadow-2xl relative overflow-hidden"
              >
                {student.avatarUrl ? (
                  <img 
                    src={student.avatarUrl} 
                    alt={student.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-[30px]" 
                  />
                ) : (
                  student.name.charAt(0)
                )}
              </div>

              <div className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                   <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{student.name}</h2>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Registry: {student.subject} • {student.class}</p>
              </div>
            </div>
            
            <div className="glass px-8 py-4 rounded-3xl border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3 mb-4">
              <ShieldCheck className="text-emerald-400" size={18} />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Authorized Status: {student.status}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {infoItems.map((item, idx) => (
              <div key={idx} className="glass p-8 rounded-[32px] border-white/5 hover:bg-white/[0.03] transition-all group/item">
                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-500/10 text-${item.color}-400 flex items-center justify-center mb-6 border border-${item.color}-500/10 transition-transform group-hover/item:scale-110`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">{item.label}</p>
                  <p className="text-lg font-black text-white tracking-tight">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-8">
         <p className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
           <AlertCircle size={14} /> Contact central registry for identity modifications
         </p>
      </div>
    </div>
  );
}

const AlertCircle = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
