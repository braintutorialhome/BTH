import React, { useState, useMemo } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student, Notice } from '../../../types';
import { 
  Bell, Megaphone, Calendar, AlertCircle, Search, 
  Pin, Filter, Sparkles, Clock, X
} from 'lucide-react';
import { safeFormat } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { FormattedNoticeContent } from '../../../components/notice/FormattedNoticeContent';

const CATEGORIES = [
  { id: 'All', label: 'All Notices' },
  { id: 'Urgent', label: 'High Priority' },
  { id: 'Exam', label: 'Exams & Tests' },
  { id: 'Holiday', label: 'Holidays' },
  { id: 'Fee', label: 'Fee Updates' },
  { id: 'Schedule', label: 'Timetable' },
  { id: 'General', label: 'General' }
];

export default function StudentNotices({ student }: { student: Student }) {
  const { notices = [] } = useStorage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter notices relevant to this student (matching class or All)
  const studentNotices = useMemo(() => {
    return (notices || [])
      .filter(n => {
        // Target class check: matches 'All', empty, or student's specific class
        if (n.targetClass && n.targetClass !== 'All' && student.class) {
          if (n.targetClass.toLowerCase() !== student.class.toLowerCase()) {
            return false;
          }
        }

        // Search match
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchTitle = (n.title || '').toLowerCase().includes(q);
          const matchContent = (n.content || '').toLowerCase().includes(q);
          if (!matchTitle && !matchContent) return false;
        }

        // Category filter
        if (selectedCategory !== 'All') {
          if (selectedCategory === 'Urgent') {
            if (!n.isImportant && n.category !== 'Urgent') return false;
          } else if (n.category !== selectedCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Newest date first
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [notices, student.class, searchTerm, selectedCategory]);

  return (
    <div className="space-y-10 pb-20 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white/5 p-6 md:p-8 rounded-[36px] border border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Notice Board</p>
            {student.class && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {student.class}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mt-1">
            Official Notices
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stay updated with institute circulars, schedules, holidays, and exam announcements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Circulars</p>
            <p className="text-xl font-black text-white">{studentNotices.length}</p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search circulars, exams, holidays, schedules..."
            className="input-glass w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Cards */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedCategory + searchTerm}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {studentNotices.map(n => (
            <article 
              key={n.id} 
              className={`glass p-8 md:p-10 rounded-[36px] border relative overflow-hidden transition-all duration-300 ${
                n.isPinned
                  ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent shadow-xl ring-1 ring-amber-500/20'
                  : n.isImportant 
                  ? 'border-rose-500/30 bg-gradient-to-r from-rose-500/5 to-transparent shadow-xl' 
                  : 'border-white/5 shadow-lg'
              }`}
            >
              {/* Background watermark icon for priority notices */}
              {n.isImportant && (
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Bell size={140} />
                </div>
              )}

              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 pb-4 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Pinned Tag */}
                  {n.isPinned && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Pin size={11} className="rotate-45" /> Pinned
                    </span>
                  )}

                  {/* Priority Tag */}
                  {n.isImportant && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                      <AlertCircle size={11} /> High Priority Notice
                    </span>
                  )}

                  {/* Category Tag */}
                  {n.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {n.category}
                    </span>
                  )}

                  {/* Class Target */}
                  {n.targetClass && n.targetClass !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      🎓 For {n.targetClass}
                    </span>
                  )}
                </div>

                {/* Date */}
                <span className="text-xs font-bold text-slate-400">
                  {safeFormat(n.date, 'dd MMMM yyyy, hh:mm a')} IST
                </span>
              </div>

              {/* Notice Title */}
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-tight mb-5 relative z-10">
                {n.title}
              </h2>

              {/* Paragraphs Arranged faithfully as provided */}
              <div className="relative z-10 mb-8 max-w-4xl">
                <FormattedNoticeContent 
                  content={n.content} 
                  className={`text-base md:text-lg leading-relaxed ${
                    n.isImportant ? 'text-slate-200' : 'text-slate-300'
                  }`}
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3 relative z-10">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Official Announcement
                </span>

                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Brain Tutorial Home Circular
                </span>
              </div>
            </article>
          ))}

          {studentNotices.length === 0 && (
            <div className="py-24 text-center glass rounded-[40px] border-2 border-dashed border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                <Megaphone size={32} />
              </div>
              <p className="text-white font-bold text-base">No announcements found</p>
              <p className="text-slate-500 text-xs mt-1">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'No notices match your search criteria' 
                  : 'All quiet on the board. Check back later for updates.'}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
