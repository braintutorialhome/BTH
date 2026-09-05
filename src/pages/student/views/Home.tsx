import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student } from '../../../types';
import { CreditCard, Brain, Calendar, Bell, ArrowRight, BookMarked, Trophy, AlertCircle, ExternalLink, FileCheck, Eye, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatClassName } from '../../../lib/utils';

export default function StudentHome({ student }: { student: Student }) {
  const { fees, attendance, testResults, notices, dueFees } = useStorage();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kolkataTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(currentTime);

  const kolkataHour = parseInt(new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false
  }).format(currentTime));

  let greeting = 'Good Evening';
  if (kolkataHour >= 5 && kolkataHour < 12) greeting = 'Good Morning';
  else if (kolkataHour >= 12 && kolkataHour < 17) greeting = 'Good Afternoon';

  const studentFees = fees.filter(f => f.studentId === student.id);
  const totalPaid = studentFees.reduce((sum, f) => sum + f.amount, 0);
  
  const studentResults = testResults.filter(r => r.studentId === student.id);
  const avgScore = studentResults.length > 0 
    ? Math.round(studentResults.reduce((sum, r) => sum + (r.score / r.totalQuestions * 100), 0) / studentResults.length)
    : 0;

  const myDueFees = dueFees.filter(df => df.studentId === student.id);
  const totalDue = myDueFees.reduce((sum, item) => sum + item.amount, 0);

  const today = new Date().toISOString().split('T')[0];
  const isPresentToday = attendance.find(a => a.date === today && a.studentId === student.id)?.status === 'present';

  return (
    <div className="space-y-12">
      <div className="p-5 sm:p-6 rounded-[28px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0">
          <Link 
            to="/student/profile" 
            className="relative shrink-0 group focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-2xl sm:rounded-3xl"
            title="View student profile photo & details"
          >
            {student.avatarUrl ? (
              <img 
                src={student.avatarUrl} 
                alt={student.name} 
                referrerPolicy="no-referrer"
                className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl object-cover border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/10 group-hover:border-indigo-400 group-hover:scale-105 transition-all" 
              />
            ) : (
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 border-2 border-indigo-500/40 flex items-center justify-center font-black text-white text-xl sm:text-2xl shadow-lg shadow-indigo-500/10 group-hover:border-indigo-400 group-hover:scale-105 transition-all">
                {student.name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-[#020712] rounded-full shadow-sm" />
          </Link>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-400">{kolkataTime}</span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">{greeting}!</span>
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight uppercase leading-snug break-words">
              {student.name}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate flex items-center gap-1.5">
              <span>Roll: {student.rollNumber || 'N/A'}</span>
              <span>•</span>
              <span>{formatClassName(student.class)}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
           <Link 
             to="/student/overview" 
             className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 border border-cyan-400/30 cursor-pointer"
           >
             <Eye size={15} />
             <span>My Overview</span>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {totalDue > 0 && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="col-span-full bg-rose-500 rounded-[30px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 shadow-2xl shadow-rose-500/20"
          >
            <div className="flex items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Outstanding Due: ₹{totalDue}</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-1">Please clear your dues as soon as possible</p>
              </div>
            </div>
            <Link to="/student/due-fees" className="bg-white text-rose-500 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:scale-105 transition-all">
              View Breakdown
            </Link>
          </motion.div>
        )}
        
        <div className="glass p-10 rounded-[40px] bg-gradient-to-br from-indigo-500/10 to-transparent flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-10 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
               <CreditCard size={28} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Total Fees Payment</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">₹{totalPaid}</h3>
          </div>
          <Link to="/student/fees" className="mt-10 text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 hover:gap-4 transition-all">
            Fees Status <ArrowRight size={14} />
          </Link>
        </div>

        <div className="glass p-10 rounded-[40px] bg-gradient-to-br from-purple-500/10 to-transparent flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-10 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
               <FileCheck size={28} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Academic Performance</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">Reports <span className="text-slate-700 text-lg">Live</span></h3>
          </div>
          <Link to="/student/results" className="mt-10 text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2 hover:gap-4 transition-all">
            Access My Results <ArrowRight size={14} />
          </Link>
        </div>

        <div className="glass p-10 rounded-[40px] bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 group-hover:scale-[1.7] transition-transform">
             <User size={120} />
          </div>
          <div>
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-10 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
               <User size={28} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Student Profile</p>
            <h3 className="text-4xl font-black text-white tracking-tighter truncate">
              {student.name.split(' ')[0]} <span className="text-slate-700 text-lg font-bold">/ {student.rollNumber || 'Active'}</span>
            </h3>
          </div>
          <Link to="/student/profile" className="mt-10 text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 hover:gap-4 transition-all">
            View Profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform">
             <Bell size={100} />
          </div>
          <div className="text-xs font-black uppercase tracking-widest text-slate-600 mb-8 flex items-center gap-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div> Notices
          </div>
          {notices.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{notices[notices.length - 1].title}</h2>
              <p className="text-slate-400 text-lg leading-relaxed line-clamp-3">
                {notices[notices.length - 1].content}
              </p>
              <Link to="/student/notices" className="indigo-button px-8 py-4 text-xs font-black uppercase tracking-widest inline-block mt-4">
                Access Archives
              </Link>
            </div>
          ) : (
            <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No active notices.</p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
           <Link to="/student/test-master" className="glass p-8 rounded-[40px] group hover:bg-slate-400/20 transition-all border border-white/5 flex flex-col justify-between">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                <ExternalLink size={24} />
              </div>
              <div className="mt-8">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white/60">Exam Portal</p>
                <h4 className="text-xl font-black text-white tracking-tight">External Links</h4>
              </div>
           </Link>
           <Link to="/student/results" className="glass p-8 rounded-[40px] group hover:bg-slate-400/20 transition-all border border-white/5 flex flex-col justify-between">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <FileCheck size={24} />
              </div>
              <div className="mt-8">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white/60">Performance</p>
                <h4 className="text-xl font-black text-white tracking-tight">Exam Results</h4>
              </div>
           </Link>
            <Link to="/student/materials" className="lg:col-span-1 glass p-8 rounded-[40px] group hover:bg-slate-400/20 transition-all border border-white/5 flex flex-col justify-between">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <BookMarked size={24} />
              </div>
              <div className="mt-8">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white/60">Study Materials</p>
                <h4 className="text-xl font-black text-white tracking-tight">Documents</h4>
              </div>
            </Link>
        </div>
      </div>
    </div>
  );
}
