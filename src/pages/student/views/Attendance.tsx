import React, { useState, useMemo } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student } from '../../../types';
import { 
  CalendarX, Calendar, AlertTriangle, CheckCircle2, 
  Search, Info, Phone, MessageSquare, ArrowUpDown, Filter
} from 'lucide-react';
import { formatClassName } from '../../../lib/utils';
import { motion } from 'motion/react';

interface StudentAttendanceProps {
  student: Student;
}

export default function StudentAttendance({ student }: StudentAttendanceProps) {
  const { attendance } = useStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter attendance records strictly for this student where status is 'absent'
  const studentAbsentRecords = useMemo(() => {
    return attendance.filter(a => {
      const isThisStudent = a.studentId === student.id || (student.rollNumber && a.studentId === student.rollNumber);
      return isThisStudent && a.status === 'absent';
    });
  }, [attendance, student.id, student.rollNumber]);

  // Extract unique months (YYYY-MM) from absent records for filter dropdown
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    studentAbsentRecords.forEach(record => {
      if (record.date) {
        const monthKey = record.date.substring(0, 7); // 'YYYY-MM'
        monthsSet.add(monthKey);
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [studentAbsentRecords]);

  // Apply search & month filtering
  const filteredAbsentRecords = useMemo(() => {
    return studentAbsentRecords
      .filter(record => {
        if (selectedMonth !== 'all' && !record.date.startsWith(selectedMonth)) {
          return false;
        }

        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        const dateObj = new Date(record.date);
        const dateStr = record.date;
        const readableDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).toLowerCase()
          : '';

        return dateStr.includes(term) || readableDate.includes(term);
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [studentAbsentRecords, selectedMonth, searchTerm, sortOrder]);

  const formatAbsentDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return { fullDate: dateString, dayName: '', year: '' };
      
      const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });
      const dayNum = dateObj.toLocaleDateString('en-IN', { day: 'numeric' });
      const monthName = dateObj.toLocaleDateString('en-IN', { month: 'short' });
      const year = dateObj.getFullYear();
      
      return {
        dayName,
        dayNum,
        monthName,
        year: String(year),
        formatted: `${dayName}, ${dayNum} ${monthName} ${year}`
      };
    } catch {
      return { fullDate: dateString, dayName: '', year: '', formatted: dateString };
    }
  };

  const formatMonthLabel = (monthKey: string) => {
    try {
      const [y, m] = monthKey.split('-');
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } catch {
      return monthKey;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 selection:bg-rose-500/30">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#020712]/80 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-6 pointer-events-none">
          <CalendarX size={140} className="text-rose-500" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4.5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10 shrink-0">
              <CalendarX size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  Absent Records Only
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-xs text-slate-400 font-semibold">{formatClassName(student.class)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                Absent Attendance List
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Student: <span className="text-white font-bold">{student.name}</span> • Roll No:{' '}
                <span className="text-indigo-400 font-bold">{student.rollNumber || 'N/A'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end bg-white/[0.02] border border-white/5 p-4 rounded-2xl shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Absent Days</p>
            <p className="text-3xl sm:text-4xl font-black text-rose-400 mt-0.5">
              {studentAbsentRecords.length}
              <span className="text-xs text-slate-500 font-bold ml-1.5 uppercase">
                {studentAbsentRecords.length === 1 ? 'day' : 'days'}
              </span>
            </p>
          </div>
        </div>

        {/* Notice advice */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-amber-400 shrink-0" />
            <span>This list strictly displays dates on which you were marked absent during tutorial sessions.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="tel:+919647046334" 
              className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Phone size={12} className="text-indigo-400" /> Support
            </a>
            <a 
              href="https://wa.me/919647046334" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <MessageSquare size={12} className="text-emerald-400" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-lg backdrop-blur-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search absent date (e.g. 2024, Monday, Oct)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {availableMonths.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <Filter size={13} className="text-slate-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-xs text-white font-bold focus:ring-0 outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-[#020712] text-white">All Months ({studentAbsentRecords.length})</option>
                {availableMonths.map(m => (
                  <option key={m} value={m} className="bg-[#020712] text-white">
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-colors active:scale-95"
            title="Toggle sort order"
          >
            <ArrowUpDown size={13} className="text-indigo-400" />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Absent Dates List */}
      {filteredAbsentRecords.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Showing {filteredAbsentRecords.length} absent {filteredAbsentRecords.length === 1 ? 'date' : 'dates'}</span>
            <span>Status: Absent</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredAbsentRecords.map((record, index) => {
              const formatted = formatAbsentDate(record.date);
              return (
                <motion.div
                  key={record.id || `${record.date}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  className="p-4 sm:p-5 rounded-2xl bg-[#020712]/60 hover:bg-[#020712]/90 border border-white/10 hover:border-rose-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-md"
                >
                  <div className="flex items-center gap-4">
                    {/* Date Block */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <span className="text-xs uppercase font-bold tracking-wider leading-none">
                        {formatted.monthName || 'Date'}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-white mt-0.5 leading-none">
                        {formatted.dayNum || '--'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                          {formatted.formatted || record.date}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                        <span className="text-rose-300 font-semibold">Marked Absent</span>
                        <span>•</span>
                        <span>Official Record ID: <span className="font-mono text-slate-500 text-[10px]">{record.id ? record.id.slice(0, 8) : `ABS-${index + 1}`}</span></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-black text-xs uppercase tracking-wider shadow-sm">
                      <AlertTriangle size={12} />
                      <span>Absent</span>
                    </span>
                    <span className="text-xs text-slate-500 font-bold font-mono">
                      #{index + 1}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : studentAbsentRecords.length === 0 ? (
        /* Empty State: 0 Absent records across entire student history */
        <div className="p-10 sm:p-14 rounded-[32px] bg-[#020712]/60 border border-white/10 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            No Absent Records Found!
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mt-2 leading-relaxed">
            You have a 100% attendance record with zero absent entries logged for your profile ({student.rollNumber || student.name}). Keep up the great attendance!
          </p>
          <div className="mt-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold inline-flex items-center gap-2">
            <CheckCircle2 size={14} /> Full Attendance Recorded
          </div>
        </div>
      ) : (
        /* Empty State: Search filter yielded 0 matches */
        <div className="p-10 rounded-[32px] bg-[#020712]/60 border border-white/10 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-tight">
            No absent dates match your filter
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Try clearing your search query or selecting a different month from the filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedMonth('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
