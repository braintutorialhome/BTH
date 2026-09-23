import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student } from '../../../types';
import { 
  CreditCard, Calendar, Bell, ArrowRight, BookMarked, 
  AlertCircle, ExternalLink, FileCheck, Eye, User, CalendarX, 
  MessageSquareQuote, CheckCircle2, Award, Clock, Sparkles,
  Layers, ArrowUpRight, TrendingUp, Phone, MessageSquare, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { formatClassName, getISTToday, safeFormat } from '../../../lib/utils';
import { FormattedNoticeContent } from '../../../components/notice/FormattedNoticeContent';

interface StudentHomeProps {
  student: Student;
}

export default function StudentHome({ student }: StudentHomeProps) {
  const { 
    fees = [], 
    attendance = [], 
    testResults = [], 
    notices = [], 
    dueFees = [], 
    remarks = [], 
    materials = [], 
    externalTests = [], 
    resultLinks = [] 
  } = useStorage();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time & Greeting (IST)
  const kolkataTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(currentTime);

  const kolkataHour = parseInt(new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false
  }).format(currentTime), 10);

  let greeting = 'Good Evening';
  if (kolkataHour >= 5 && kolkataHour < 12) greeting = 'Good Morning';
  else if (kolkataHour >= 12 && kolkataHour < 17) greeting = 'Good Afternoon';

  // Fee Analytics
  const studentPayments = fees.filter(f => f.studentId === student.id && (f.status === 'paid' || !f.status));
  const totalPaid = studentPayments.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const myDueFees = dueFees.filter(df => df.studentId === student.id);
  const totalDue = myDueFees.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Attendance Analytics (Absent records)
  const absentRecords = attendance.filter(a => 
    (a.studentId === student.id || (student.rollNumber && a.studentId === student.rollNumber)) && 
    a.status === 'absent'
  );
  const absentCount = absentRecords.length;

  // Student Remarks
  const studentRemarks = remarks.filter(r => 
    r.studentId === student.id || 
    (student.rollNumber && r.studentId === student.rollNumber)
  );

  // Filter Notices matching student's class or All
  const relevantNotices = notices
    .filter(n => {
      if (n.targetClass && n.targetClass !== 'All' && student.class) {
        return n.targetClass.toLowerCase() === student.class.toLowerCase();
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const latestNotice = relevantNotices.length > 0 ? relevantNotices[0] : null;

  // Recent 3 Materials
  const recentMaterials = [...(materials || [])]
    .sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime())
    .slice(0, 3);

  // Recent 2 Remarks
  const recentRemarks = [...studentRemarks]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 2);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* =========================================================================
          1. HERO HEADER: Student Identity, Dynamic IST Clock, Fast Actions
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0c1222]/90 via-[#0a0f1d]/95 to-[#050813] border border-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar & Student Profile Details */}
          <div className="flex items-center gap-5 sm:gap-6 min-w-0">
            <Link 
              to="/student/profile" 
              className="relative shrink-0 group focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-3xl"
              title="Click to view full student profile"
            >
              {student.avatarUrl ? (
                <img 
                  src={student.avatarUrl} 
                  alt={student.name} 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-indigo-500/30 shadow-xl shadow-indigo-600/20 group-hover:scale-105 group-hover:border-indigo-400 transition-all duration-300" 
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 border-2 border-indigo-500/30 flex items-center justify-center font-black text-white text-2xl sm:text-3xl shadow-xl shadow-indigo-600/20 group-hover:scale-105 group-hover:border-indigo-400 transition-all duration-300">
                  {student.name.charAt(0)}
                </div>
              )}
              <span 
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0c1222] rounded-full shadow-md"
                title="Active Enrolled Student"
              />
            </Link>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                  <Clock size={12} /> {kolkataTime} (IST)
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> {greeting}, {student.name.split(' ')[0]}!
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-tight truncate">
                {student.name}
              </h1>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 font-medium">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold">
                  Roll: {student.rollNumber || 'N/A'}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
                  {formatClassName(student.class)}
                </span>
                {student.status && (
                  <span className={`px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider text-[10px] border ${
                    student.status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {student.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Navigation Shortcuts */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <Link 
              to="/student/about-us" 
              className="px-4 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-cyan-500/20 whitespace-nowrap"
            >
              <User size={15} className="text-cyan-400" />
              <span>About Us</span>
            </Link>
            <Link 
              to="/student/overview" 
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/25 active:scale-95 border border-indigo-400/30 whitespace-nowrap"
            >
              <Eye size={16} />
              <span>My Overview</span>
            </Link>
            <Link 
              to="/student/notices" 
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-white/5 whitespace-nowrap"
            >
              <Bell size={15} className="text-indigo-400" />
              <span>Notices</span>
              {relevantNotices.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                  {relevantNotices.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CRITICAL ATTENTION BANNER (Only when outstanding dues exist)
         ========================================================================= */}
      {totalDue > 0 && (
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-[30px] p-6 md:p-8 bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-rose-950/80 border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl shadow-rose-950/50"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertCircle size={30} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Payment Alert</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {myDueFees.length} Pending {myDueFees.length === 1 ? 'Bill' : 'Bills'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                Outstanding Balance: ₹{totalDue.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-rose-200/80 font-medium mt-1">
                Please clear outstanding dues to maintain uninterrupted admission privileges and receipt access.
              </p>
            </div>
          </div>
          <Link 
            to="/student/due-fees" 
            className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <span>View Due Breakdown</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* =========================================================================
          3. CORE METRICS TILES: Fees Paid, Due Balance, Absent Records, Remarks
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Fees Paid */}
        <Link 
          to="/student/fees" 
          className="group relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br from-indigo-500/10 via-white/[0.02] to-transparent border border-white/5 hover:border-indigo-500/40 transition-all duration-300 shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <CreditCard size={22} />
            </div>
            <span className="text-slate-500 group-hover:text-indigo-400 transition-colors">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Fees Paid</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-indigo-400/80 font-medium mt-2 flex items-center gap-1">
            <span>{studentPayments.length} Paid {studentPayments.length === 1 ? 'Receipt' : 'Receipts'}</span>
          </p>
        </Link>

        {/* Pending Due Status */}
        <Link 
          to="/student/due-fees" 
          className={`group relative overflow-hidden rounded-[28px] p-6 border transition-all duration-300 shadow-xl hover:-translate-y-1 ${
            totalDue > 0
              ? 'bg-gradient-to-br from-rose-500/10 via-white/[0.02] to-transparent border-rose-500/30 hover:border-rose-500/60'
              : 'bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-transparent border-white/5 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 ${
              totalDue > 0 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 group-hover:bg-rose-600 group-hover:text-white' 
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white'
            }`}>
              {totalDue > 0 ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Due Balance</p>
          <h3 className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${totalDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totalDue > 0 ? `₹${totalDue.toLocaleString('en-IN')}` : '₹0 (Clear)'}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium mt-2">
            {totalDue > 0 ? `${myDueFees.length} Pending dues` : 'No outstanding dues'}
          </p>
        </Link>

        {/* Absent Records */}
        <Link 
          to="/student/attendance" 
          className="group relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br from-amber-500/10 via-white/[0.02] to-transparent border border-white/5 hover:border-amber-500/40 transition-all duration-300 shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <CalendarX size={22} />
            </div>
            <span className="text-slate-500 group-hover:text-amber-400 transition-colors">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Absent Records</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {absentCount} {absentCount === 1 ? 'Date' : 'Dates'}
          </h3>
          <p className="text-[11px] text-amber-400/80 font-medium mt-2">
            {absentCount === 0 ? 'Consistent attendance!' : 'View absent dates breakdown'}
          </p>
        </Link>

        {/* Teacher Observations / Remarks */}
        <Link 
          to="/student/remarks" 
          className="group relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br from-purple-500/10 via-white/[0.02] to-transparent border border-white/5 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <MessageSquareQuote size={22} />
            </div>
            <span className="text-slate-500 group-hover:text-purple-400 transition-colors">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Teacher Remarks</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {studentRemarks.length} {studentRemarks.length === 1 ? 'Note' : 'Notes'}
          </h3>
          <p className="text-[11px] text-purple-400/80 font-medium mt-2">
            Personal observations & reviews
          </p>
        </Link>
      </div>

      {/* =========================================================================
          4. TWO-COLUMN WORKSPACE: Latest Official Notice + Quick Navigation Grid
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (7 cols): Latest Announcement Card */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-[36px] bg-[#0c1222]/80 border border-white/10 p-6 sm:p-8 flex-1 flex flex-col justify-between relative overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 pointer-events-none">
              <Bell size={140} className="text-indigo-400" />
            </div>

            <div>
              {/* Header row */}
              <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Latest Notice</h2>
                    <p className="text-[10px] text-slate-400 font-semibold">Institute Circular & Announcements</p>
                  </div>
                </div>

                <Link 
                  to="/student/notices" 
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group transition-colors"
                >
                  <span>All Notices ({relevantNotices.length})</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Content */}
              {latestNotice ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {latestNotice.isPinned && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        📌 Pinned
                      </span>
                    )}
                    {latestNotice.isImportant && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        High Priority
                      </span>
                    )}
                    {latestNotice.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {latestNotice.category}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400 ml-auto">
                      {safeFormat(latestNotice.date, 'dd MMM yyyy')}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-snug">
                    {latestNotice.title}
                  </h3>

                  <div className="max-h-52 overflow-y-auto pr-2 custom-scrollbar text-slate-300 text-sm leading-relaxed">
                    <FormattedNoticeContent content={latestNotice.content} className="text-sm leading-relaxed text-slate-300" />
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center">
                  <p className="text-slate-400 font-bold text-sm">No announcements at this time</p>
                  <p className="text-slate-600 text-xs mt-1">Check back later for circulars, exam schedules, and holiday notifications.</p>
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Brain Tutorial Home Circular
              </span>
              <Link 
                to="/student/notices" 
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
              >
                Open Notice Board
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Organized Feature Hub */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" />
              Student Academic Hub
            </h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fast Access</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 flex-1">
            {/* Exam Portal */}
            <Link 
              to="/student/test-master" 
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <ExternalLink size={18} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Exam Portal</p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Online Tests</h4>
                <p className="text-[10px] text-slate-500 mt-1">{externalTests.length} Tests Ready</p>
              </div>
            </Link>

            {/* Exam Results */}
            <Link 
              to="/student/results" 
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <FileCheck size={18} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Performance</p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Exam Results</h4>
                <p className="text-[10px] text-slate-500 mt-1">{resultLinks.length} Score Sheets</p>
              </div>
            </Link>

            {/* Study Material */}
            <Link 
              to="/student/materials" 
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <BookMarked size={18} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Curriculum</p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Study Materials</h4>
                <p className="text-[10px] text-slate-500 mt-1">{materials.length} Documents</p>
              </div>
            </Link>

            {/* Due Fees Breakdown */}
            <Link 
              to="/student/due-fees" 
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-rose-500/30 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <AlertCircle size={18} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Accounts</p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Due Fees</h4>
                <p className="text-[10px] text-slate-500 mt-1">{totalDue > 0 ? `₹${totalDue} Pending` : 'All Cleared'}</p>
              </div>
            </Link>

            {/* Attendance View */}
            <Link 
              to="/student/attendance" 
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <CalendarX size={18} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Attendance</p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Absent Dates</h4>
                <p className="text-[10px] text-slate-500 mt-1">{absentCount} Total Absences</p>
              </div>
            </Link>

            {/* Teacher Remarks */}
            <Link 
              to="/student/remarks" 
              className="p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <MessageSquareQuote size={18} />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-slate-400">Feedback</p>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Observations</h4>
                <p className="text-[10px] text-slate-500 mt-1">{studentRemarks.length} Recorded</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. ACADEMIC ACTIVITY FEEDS: Recent Study Materials & Teacher Observations
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Study Materials */}
        <div className="rounded-[32px] bg-white/[0.02] border border-white/5 p-6 sm:p-7 space-y-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <BookMarked size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Recent Study Materials</h3>
                <p className="text-[10px] text-slate-500 font-semibold">Latest course materials & notes</p>
              </div>
            </div>
            <Link 
              to="/student/materials" 
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentMaterials.length > 0 ? (
              recentMaterials.map((mat) => (
                <a
                  key={mat.id}
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/20 flex items-center justify-between gap-3 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-black shrink-0 border border-cyan-500/20">
                      {mat.type.toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {mat.title}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Uploaded {safeFormat(mat.uploadDate, 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
                </a>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No study materials published yet</p>
            )}
          </div>
        </div>

        {/* Recent Teacher Remarks */}
        <div className="rounded-[32px] bg-white/[0.02] border border-white/5 p-6 sm:p-7 space-y-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <MessageSquareQuote size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Teacher Feedback</h3>
                <p className="text-[10px] text-slate-500 font-semibold">Latest observations & conduct notes</p>
              </div>
            </div>
            <Link 
              to="/student/remarks" 
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentRemarks.length > 0 ? (
              recentRemarks.map((rem) => (
                <Link
                  key={rem.id}
                  to="/student/remarks"
                  className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/20 flex flex-col gap-1.5 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {rem.category}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">
                      {safeFormat(rem.date, 'dd MMM yyyy')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                    {rem.remark}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No teacher remarks recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
