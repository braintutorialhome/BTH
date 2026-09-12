import React, { useState, useMemo } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student, StudentRemark } from '../../../types';
import { 
  MessageSquare, Plus, Trash2, Edit2, Search, Filter, 
  CheckCircle2, AlertCircle, Sparkles, User, Calendar, 
  GraduationCap, ThumbsUp, X, ChevronRight, MessageSquareQuote,
  Clock, ArrowUpDown
} from 'lucide-react';
import { formatClassName, safeFormat, getISTToday } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type RemarkCategory = 'academic' | 'behavior' | 'attendance' | 'general' | 'appreciation';

const CATEGORY_CONFIG: Record<RemarkCategory, { label: string; bg: string; text: string; border: string; icon: any }> = {
  academic: {
    label: 'Academic',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    icon: GraduationCap
  },
  appreciation: {
    label: 'Appreciation',
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
    label: 'General',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
    icon: Sparkles
  }
};

export default function StudentRemarksManagement() {
  const { students, remarks, addRemark, updateRemark, deleteRemark, currentUser } = useStorage();
  
  // Tabs: 'remarks' (all remarks list) | 'students' (student directory with remark actions)
  const [activeTab, setActiveTab] = useState<'remarks' | 'students'>('remarks');
  
  // Filters for Remarks List
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter for Student Directory
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRemark, setEditingRemark] = useState<StudentRemark | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form fields
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [category, setCategory] = useState<RemarkCategory>('academic');
  const [formDate, setFormDate] = useState(getISTToday());

  // Distinct approved classes
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach(s => {
      if (s.class) classSet.add(s.class);
    });
    return Array.from(classSet).sort();
  }, [students]);

  // Approved students list for dropdown and directory
  const activeStudents = useMemo(() => {
    return students
      .filter(s => s.status === 'approved')
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [students]);

  // Filtered Remarks
  const filteredRemarks = useMemo(() => {
    return remarks
      .filter(r => {
        const student = students.find(s => s.id === r.studentId || (s.rollNumber && s.rollNumber === r.studentId));
        
        // Class filter
        if (classFilter !== 'all') {
          if (!student || student.class !== classFilter) return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && r.category !== categoryFilter) {
          return false;
        }

        // Search term
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const studentName = (student?.name || '').toLowerCase();
        const rollNo = (student?.rollNumber || '').toLowerCase();
        const remarkTitle = (r.title || '').toLowerCase();
        const body = (r.remark || '').toLowerCase();

        return studentName.includes(term) || rollNo.includes(term) || remarkTitle.includes(term) || body.includes(term);
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [remarks, students, classFilter, categoryFilter, searchTerm, sortOrder]);

  // Filtered Students in directory
  const filteredDirectoryStudents = useMemo(() => {
    return activeStudents.filter(s => {
      if (studentClassFilter !== 'all' && s.class !== studentClassFilter) return false;
      if (!studentSearch.trim()) return true;
      const term = studentSearch.toLowerCase();
      return (s.name || '').toLowerCase().includes(term) || 
             (s.rollNumber || '').toLowerCase().includes(term) ||
             (s.phone || '').includes(term);
    });
  }, [activeStudents, studentClassFilter, studentSearch]);

  // Open modal to add new remark
  const handleOpenAdd = (preselectedStudentId?: string) => {
    setEditingRemark(null);
    setSelectedStudentId(preselectedStudentId || (activeStudents[0]?.id || ''));
    setTitle('');
    setRemarkText('');
    setCategory('academic');
    setFormDate(getISTToday());
    setIsModalOpen(true);
  };

  // Open modal to edit remark
  const handleOpenEdit = (remark: StudentRemark) => {
    setEditingRemark(remark);
    setSelectedStudentId(remark.studentId);
    setTitle(remark.title || '');
    setRemarkText(remark.remark);
    setCategory(remark.category || 'academic');
    setFormDate(remark.date.split('T')[0] || getISTToday());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRemark(null);
    setSelectedStudentId('');
    setTitle('');
    setRemarkText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !remarkText.trim()) return;

    if (editingRemark) {
      updateRemark({
        ...editingRemark,
        studentId: selectedStudentId,
        title: title.trim() || undefined,
        remark: remarkText.trim(),
        category,
        date: formDate ? (formDate.includes('T') ? formDate : `${formDate}T12:00:00+05:30`) : editingRemark.date,
        addedBy: editingRemark.addedBy || currentUser?.name || 'Administrator'
      });
    } else {
      addRemark({
        studentId: selectedStudentId,
        title: title.trim() || undefined,
        remark: remarkText.trim(),
        category,
        date: formDate ? `${formDate}T12:00:00+05:30` : undefined,
        addedBy: currentUser?.name || 'Administrator'
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    deleteRemark(id);
    setConfirmDeleteId(null);
  };

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
                  Student Management
                </span>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-xs text-slate-400 font-semibold">Faculty Feedback</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
                Student Remarks
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Record, edit, and organize academic performance, behavioral feedback, and appreciation notes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => handleOpenAdd()}
              className="indigo-button w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              <Plus size={16} />
              <span>Add New Remark</span>
            </button>
          </div>
        </div>

        {/* Quick Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Remarks</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">{remarks.length}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Students with Remarks</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">
              {new Set(remarks.map(r => r.studentId)).size}
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Notes</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {remarks.filter(r => r.category === 'academic').length}
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Appreciations</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
              {remarks.filter(r => r.category === 'appreciation').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('remarks')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'remarks'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <MessageSquare size={14} />
          <span>All Remarks ({remarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <User size={14} />
          <span>Students Directory ({activeStudents.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL REMARKS */}
      {activeTab === 'remarks' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search remark by student name, roll number, topic..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Class Filter */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                <Filter size={13} className="text-slate-400" />
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="bg-transparent border-none text-xs text-white font-bold focus:ring-0 outline-none cursor-pointer pr-1"
                >
                  <option value="all" className="bg-[#020712] text-white">All Classes</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c} className="bg-[#020712] text-white">
                      {formatClassName(c)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                <Sparkles size={13} className="text-slate-400" />
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

          {/* Remarks List */}
          {filteredRemarks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredRemarks.map((remark, index) => {
                const student = students.find(s => s.id === remark.studentId || (s.rollNumber && s.rollNumber === remark.studentId));
                const catInfo = CATEGORY_CONFIG[remark.category || 'general'] || CATEGORY_CONFIG.general;
                const CatIcon = catInfo.icon;

                return (
                  <motion.div
                    key={remark.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col gap-4 group shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-indigo-400 flex items-center justify-center font-black text-sm uppercase shrink-0">
                          {student?.name ? student.name.slice(0, 2) : 'ST'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-white tracking-tight">
                              {student?.name || 'Unknown Student'}
                            </h3>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs font-bold text-indigo-400">
                              Roll No: {student?.rollNumber || 'N/A'}
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs font-semibold text-slate-400">
                              {formatClassName(student?.class)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                            <Clock size={11} />
                            <span>{safeFormat(remark.date, 'dd MMM yyyy, hh:mm a')}</span>
                            {remark.updatedAt && (
                              <span className="text-slate-600 text-[10px]">(Edited)</span>
                            )}
                            {remark.addedBy && (
                              <span>• By: <span className="text-slate-400">{remark.addedBy}</span></span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Category Badge & Action Buttons */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${catInfo.bg} ${catInfo.text} border ${catInfo.border}`}>
                          <CatIcon size={12} />
                          <span>{catInfo.label}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(remark)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-indigo-600/20 hover:text-indigo-400 text-slate-400 border border-white/10 transition-colors"
                            title="Edit Remark"
                          >
                            <Edit2 size={14} />
                          </button>
                          
                          {confirmDeleteId === remark.id ? (
                            <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
                              <button
                                onClick={() => handleDelete(remark.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-white/5 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(remark.id)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-rose-600/20 hover:text-rose-400 text-slate-400 border border-white/10 transition-colors"
                              title="Delete Remark"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remark Content */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      {remark.title && (
                        <h4 className="text-sm font-bold text-indigo-300 mb-1.5 flex items-center gap-2">
                          <MessageSquare size={13} className="text-indigo-400" />
                          <span>{remark.title}</span>
                        </h4>
                      )}
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {remark.remark}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : remarks.length === 0 ? (
            /* Empty State when zero remarks exist */
            <div className="p-12 sm:p-16 rounded-[32px] bg-[#020712]/60 border border-white/10 text-center flex flex-col items-center justify-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/10">
                <MessageSquareQuote size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">No Remarks Recorded Yet</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mt-2 leading-relaxed">
                Add official observations, appreciation notes, or academic guidance for your students to help them improve.
              </p>
              <button
                onClick={() => handleOpenAdd()}
                className="mt-6 indigo-button px-6 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add First Remark</span>
              </button>
            </div>
          ) : (
            /* Empty filter results */
            <div className="p-10 rounded-[32px] bg-slate-900/40 border border-white/10 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center mb-3">
                <Search size={20} />
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">No remarks match your filter</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Try clearing search terms or selecting a different class or category.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setClassFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search student by name, roll number, phone..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                <Filter size={13} className="text-slate-400" />
                <select
                  value={studentClassFilter}
                  onChange={(e) => setStudentClassFilter(e.target.value)}
                  className="bg-transparent border-none text-xs text-white font-bold focus:ring-0 outline-none cursor-pointer pr-1"
                >
                  <option value="all" className="bg-[#020712] text-white">All Classes</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c} className="bg-[#020712] text-white">
                      {formatClassName(c)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          {filteredDirectoryStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDirectoryStudents.map(student => {
                const studentRemarks = remarks.filter(
                  r => r.studentId === student.id || (student.rollNumber && r.studentId === student.rollNumber)
                );

                return (
                  <div
                    key={student.id}
                    className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm uppercase">
                            {student.name ? student.name.slice(0, 2) : 'ST'}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">{student.name}</h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Roll No: <span className="text-indigo-400 font-bold">{student.rollNumber || 'N/A'}</span>
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                          {formatClassName(student.class)}
                        </span>
                      </div>

                      {/* Remark count badge */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Total Remarks:</span>
                        <span className={`font-black ${studentRemarks.length > 0 ? 'text-indigo-400' : 'text-slate-600'}`}>
                          {studentRemarks.length} {studentRemarks.length === 1 ? 'Remark' : 'Remarks'}
                        </span>
                      </div>

                      {/* Latest remark snippet if any */}
                      {studentRemarks.length > 0 && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latest Remark</p>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2 italic">
                            "{studentRemarks[0].remark}"
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 text-right">
                            {safeFormat(studentRemarks[0].date, 'dd MMM yyyy')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleOpenAdd(student.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus size={14} />
                        <span>Add Remark</span>
                      </button>

                      {studentRemarks.length > 0 && (
                        <button
                          onClick={() => {
                            setSearchTerm(student.name);
                            setActiveTab('remarks');
                          }}
                          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1 border border-white/10 transition-colors"
                          title="View all remarks for this student"
                        >
                          <MessageSquare size={13} />
                          <span>View ({studentRemarks.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 rounded-[32px] bg-slate-900/40 border border-white/10 text-center flex flex-col items-center justify-center">
              <p className="text-xs text-slate-400">No students found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT REMARK MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#020712] border border-white/15 rounded-[28px] p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                    {editingRemark ? <Edit2 size={18} /> : <Plus size={18} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight">
                      {editingRemark ? 'Edit Student Remark' : 'Add New Student Remark'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {editingRemark ? 'Update remark details and observations' : 'Provide constructive notes, praise, or performance feedback'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 mt-5">
                {/* Student Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select Student <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled className="bg-[#020712] text-slate-400">Select a student...</option>
                    {activeStudents.map(st => (
                      <option key={st.id} value={st.id} className="bg-[#020712] text-white">
                        {st.name} — Roll: {st.rollNumber || 'N/A'} ({formatClassName(st.class)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Remark Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CATEGORY_CONFIG) as RemarkCategory[]).map(catKey => {
                      const item = CATEGORY_CONFIG[catKey];
                      const Icon = item.icon;
                      const isSelected = category === catKey;

                      return (
                        <button
                          type="button"
                          key={catKey}
                          onClick={() => setCategory(catKey)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon size={14} className={isSelected ? 'text-white' : item.text} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title / Topic */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Topic / Subject <span className="text-slate-500 text-[10px] normal-case">(Optional headline)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Mathematics Test Progress, Excellent Homework"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Remark Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Remark / Observations <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    required
                    rows={4}
                    placeholder="Write detailed remarks, feedback, points to improve or congratulations..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedStudentId || !remarkText.trim()}
                    className="indigo-button px-6 py-2.5 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingRemark ? 'Save Changes' : 'Publish Remark'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
