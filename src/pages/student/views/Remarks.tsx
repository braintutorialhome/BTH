import React, { useState, useMemo } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student } from '../../../types';
import { 
  MessageSquareQuote, MessageSquare, Search, Filter, 
  Sparkles, Calendar, GraduationCap, ThumbsUp, AlertCircle,
  Clock, ArrowUpDown, Info, CheckCircle2, UserCheck
} from 'lucide-react';
import { formatClassName, safeFormat } from '../../../lib/utils';
import { motion } from 'motion/react';

interface StudentRemarksProps {
  student: Student;
}

type RemarkCategory = 'academic' | 'behavior' | 'attendance' | 'general' | 'appreciation';

const CATEGORY_CONFIG: Record<RemarkCategory, { label: string; bg: string; text: string; border: string; icon: any }> = {
  academic: {
    label: 'Academic Performance',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    icon: GraduationCap
  },
  appreciation: {
    label: 'Appreciation & Praise',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: ThumbsUp
  },
  behavior: {
    label: 'Conduct & Behavior',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    icon: AlertCircle
  },
  attendance: {
    label: 'Attendance Note',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    icon: Calendar
  },
  general: {
    label: 'General Feedback',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
    icon: Sparkles
  }
};

export default function StudentRemarks({ student }: StudentRemarksProps) {
  const { remarks } = useStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter remarks strictly for this logged-in student (read-only)
  const studentRemarks = useMemo(() => {
    return remarks.filter(r => 
      r.studentId === student.id || 
      (student.rollNumber && r.studentId === student.rollNumber)
    );
  }, [remarks, student.id, student.rollNumber]);

  // Filtered and sorted remarks
  const filteredRemarks = useMemo(() => {
    return studentRemarks
      .filter(r => {
        if (categoryFilter !== 'all' && r.category !== categoryFilter) {
          return false;
        }

        if (!searchTerm.trim()) return true;

        const term = searchTerm.toLowerCase();
        const title = (r.title || '').toLowerCase();
        const text = (r.remark || '').toLowerCase();
        const dateStr = safeFormat(r.date, 'dd MMMM yyyy').toLowerCase();

        return title.includes(term) || text.includes(term) || dateStr.includes(term);
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [studentRemarks, categoryFilter, searchTerm, sortOrder]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-slate-900/60 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-6 pointer-events-none">
          <MessageSquareQuote size={140} className="text-indigo-400" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4.5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/10 shrink-0">
              <MessageSquareQuote size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Student Portal
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-xs text-slate-400 font-semibold">Teacher Observations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                Faculty Remarks
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Official feedback, performance reviews, and behavioral guidance recorded by your instructors.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                {student.name}
              </span>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                Roll: {student.rollNumber || 'N/A'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold mt-1">
              {formatClassName(student.class)}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
          <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Remarks</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{studentRemarks.length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Feedback</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">
              {studentRemarks.filter(r => r.category === 'academic').length}
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Praise & Appreciation</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {studentRemarks.filter(r => r.category === 'appreciation').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {studentRemarks.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search remarks by topic, notes, date..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <Filter size={13} className="text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none text-xs text-white font-bold focus:ring-0 outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-[#020712] text-white">All Categories</option>
                <option value="academic" className="bg-[#020712] text-white">Academic</option>
                <option value="appreciation" className="bg-[#020712] text-white">Appreciation</option>
                <option value="behavior" className="bg-[#020712] text-white">Conduct & Behavior</option>
                <option value="attendance" className="bg-[#020712] text-white">Attendance Note</option>
                <option value="general" className="bg-[#020712] text-white">General</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-colors active:scale-95"
              title="Toggle sort order"
            >
              <ArrowUpDown size={13} className="text-indigo-400" />
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Remarks Cards List (Read-Only) */}
      {filteredRemarks.length > 0 ? (
        <div className="space-y-4">
          {filteredRemarks.map((remark, index) => {
            const catInfo = CATEGORY_CONFIG[remark.category || 'general'] || CATEGORY_CONFIG.general;
            const CatIcon = catInfo.icon;

            return (
              <motion.div
                key={remark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
                className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-indigo-500/20 transition-all shadow-md flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${catInfo.bg} ${catInfo.text} border ${catInfo.border}`}>
                      <CatIcon size={13} />
                      <span>{catInfo.label}</span>
                    </span>

                    {remark.title && (
                      <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                        {remark.title}
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <Clock size={12} className="text-slate-500" />
                    <span>{safeFormat(remark.date, 'dd MMMM yyyy, hh:mm a')}</span>
                    {remark.updatedAt && (
                      <span className="text-slate-600 text-[10px]">(Updated)</span>
                    )}
                  </div>
                </div>

                {/* Remark Text */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-5 relative">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                    {remark.remark}
                  </p>
                </div>

                {/* Attribution footer */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <UserCheck size={13} className="text-indigo-400" />
                    <span>Provided by: <span className="text-slate-400 font-semibold">{remark.addedBy || 'Administration / Faculty'}</span></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Brain Tutorial Home
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : studentRemarks.length === 0 ? (
        /* Empty State when no remarks have been posted for this student */
        <div className="p-12 sm:p-16 rounded-[32px] bg-[#020712]/60 border border-white/10 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/10">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">No Remarks Recorded Yet</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mt-2 leading-relaxed">
            Your instructors have not recorded any official remarks or feedback notes for your profile yet. Keep up the good work and check back later.
          </p>
        </div>
      ) : (
        /* Empty search results */
        <div className="p-10 rounded-[32px] bg-slate-900/40 border border-white/10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center mb-3">
            <Search size={20} />
          </div>
          <h3 className="text-base font-bold text-white uppercase tracking-tight">No matching remarks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Try resetting your search query or choosing another category filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Advisory Info Card */}
      <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
          <Info size={18} />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">
            Student Guidance & Improvement Note
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Faculty remarks reflect ongoing evaluation of homework, classroom participation, and test performance. 
            If you need further guidance or clarification regarding any remark, please reach out to your faculty mentor during tutoring hours.
          </p>
        </div>
      </div>
    </div>
  );
}
