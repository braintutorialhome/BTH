import React, { useState, useMemo } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Attendance } from '../../../types';
import { 
  Calendar, User, Search, Check, X, Users, Trash2, Edit2, 
  AlertTriangle, Filter, ArrowUpDown, Plus, Phone, MessageSquare,
  CheckCircle2, Clock, CalendarX, AlertCircle, Sparkles
} from 'lucide-react';
import { safeFormat, formatClassName, getISTToday } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AttendanceManagement() {
  const { students, attendance, markAttendance, deleteAttendance, updateAttendance } = useStorage();
  
  const today = getISTToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState<'roll-call' | 'present-list' | 'absent-list'>('roll-call');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [dateScope, setDateScope] = useState<'selected' | 'today' | 'month' | 'all'>('selected');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Modals & Selection
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<{ record: Attendance; studentName: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntryStudentId, setNewEntryStudentId] = useState('');
  const [newEntryDate, setNewEntryDate] = useState(today);
  const [newEntryStatus, setNewEntryStatus] = useState<'absent' | 'present'>('present');

  // Feedback Toast
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const approvedStudents = useMemo(() => {
    return students.filter(s => s.status === 'approved');
  }, [students]);

  // Unique classes for filter
  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    approvedStudents.forEach(s => {
      if (s.class) classes.add(s.class);
    });
    return Array.from(classes).sort();
  }, [approvedStudents]);

  // Daily Roll Call data
  const rollCallStudents = useMemo(() => {
    return approvedStudents.filter(s => {
      const matchesSearch = 
        String(s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        String(s.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = classFilter === 'all' || s.class === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [approvedStudents, searchTerm, classFilter]);

  const getAttendanceRecord = (studentId: string, date: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === date);
  };

  const presentCountForSelectedDate = attendance.filter(a => a.date === selectedDate && a.status === 'present').length;
  const absentCountForSelectedDate = attendance.filter(a => a.date === selectedDate && a.status === 'absent').length;
  const totalMarkedForSelectedDate = attendance.filter(a => a.date === selectedDate).length;
  const totalAbsentsAllTime = attendance.filter(a => a.status === 'absent').length;
  const totalPresentsAllTime = attendance.filter(a => a.status === 'present').length;

  // Filtered Present Records for "Present List" view
  const presentRecordsWithStudent = useMemo(() => {
    const presents = attendance.filter(a => a.status === 'present');
    
    return presents.map(record => {
      const student = students.find(s => s.id === record.studentId || (s.rollNumber && s.rollNumber === record.studentId));
      return {
        record,
        student
      };
    });
  }, [attendance, students]);

  const filteredPresentList = useMemo(() => {
    return presentRecordsWithStudent
      .filter(({ record, student }) => {
        // Date scope filter
        if (dateScope === 'selected' && record.date !== selectedDate) return false;
        if (dateScope === 'today' && record.date !== today) return false;
        if (dateScope === 'month') {
          const currentMonthPrefix = selectedDate.substring(0, 7);
          if (!record.date.startsWith(currentMonthPrefix)) return false;
        }

        // Class filter
        if (classFilter !== 'all' && student?.class !== classFilter) return false;

        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const nameMatch = (student?.name || '').toLowerCase().includes(term);
          const rollMatch = (student?.rollNumber || '').toLowerCase().includes(term);
          const dateMatch = record.date.includes(term);
          if (!nameMatch && !rollMatch && !dateMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.record.date).getTime();
        const timeB = new Date(b.record.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [presentRecordsWithStudent, dateScope, selectedDate, today, classFilter, searchTerm, sortOrder]);

  // Filtered Absent Records for "Absent List" view
  const absentRecordsWithStudent = useMemo(() => {
    const absents = attendance.filter(a => a.status === 'absent');
    
    return absents.map(record => {
      const student = students.find(s => s.id === record.studentId || (s.rollNumber && s.rollNumber === record.studentId));
      return {
        record,
        student
      };
    });
  }, [attendance, students]);

  const filteredAbsentList = useMemo(() => {
    return absentRecordsWithStudent
      .filter(({ record, student }) => {
        // Date scope filter
        if (dateScope === 'selected' && record.date !== selectedDate) return false;
        if (dateScope === 'today' && record.date !== today) return false;
        if (dateScope === 'month') {
          const currentMonthPrefix = selectedDate.substring(0, 7);
          if (!record.date.startsWith(currentMonthPrefix)) return false;
        }

        // Class filter
        if (classFilter !== 'all' && student?.class !== classFilter) return false;

        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const nameMatch = (student?.name || '').toLowerCase().includes(term);
          const rollMatch = (student?.rollNumber || '').toLowerCase().includes(term);
          const dateMatch = record.date.includes(term);
          if (!nameMatch && !rollMatch && !dateMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.record.date).getTime();
        const timeB = new Date(b.record.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [absentRecordsWithStudent, dateScope, selectedDate, today, classFilter, searchTerm, sortOrder]);

  const handleMark = (studentId: string, status: 'present' | 'absent') => {
    markAttendance(selectedDate, studentId, status);
    const student = students.find(s => s.id === studentId);
    showToast(`Marked ${student?.name || 'Student'} as ${status.toUpperCase()} for ${selectedDate}`);
  };

  const handleClearMark = (recordId: string, studentName: string) => {
    deleteAttendance(recordId);
    showToast(`Cleared attendance mark for ${studentName}`);
  };

  const handleQuickMarkPresent = (record: Attendance, studentName: string) => {
    updateAttendance({ ...record, status: 'present' });
    showToast(`Converted ${studentName}'s record on ${record.date} to PRESENT`);
  };

  const handleQuickMarkAbsent = (record: Attendance, studentName: string) => {
    updateAttendance({ ...record, status: 'absent' });
    showToast(`Converted ${studentName}'s record on ${record.date} to ABSENT`);
  };

  const handleSaveEditedRecord = () => {
    if (!editingRecord) return;
    updateAttendance(editingRecord);
    const student = students.find(s => s.id === editingRecord.studentId);
    showToast(`Updated attendance for ${student?.name || 'Student'} (${editingRecord.date})`);
    setEditingRecord(null);
  };

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;
    deleteAttendance(recordToDelete.record.id);
    showToast(`Deleted ${recordToDelete.record.status} record for ${recordToDelete.studentName} on ${recordToDelete.record.date}`);
    setRecordToDelete(null);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryStudentId) return;
    markAttendance(newEntryDate, newEntryStudentId, newEntryStatus);
    const student = students.find(s => s.id === newEntryStudentId);
    showToast(`Logged ${newEntryStatus.toUpperCase()} record for ${student?.name || 'Student'} on ${newEntryDate}`);
    setIsAddModalOpen(false);
    setNewEntryStudentId('');
  };

  return (
    <div className="space-y-8 selection:bg-indigo-500/30">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900/95 border border-indigo-500/40 text-white shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Selector Card */}
        <div className="glass p-6 sm:p-8 rounded-[32px] border border-white/5 flex flex-col justify-between group relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operation Date</p>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-2xl font-black text-white focus:ring-0 outline-none cursor-pointer"
            />
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
              <Calendar size={13}/> {safeFormat(selectedDate, 'dd MMM yyyy')}
            </span>
            {selectedDate !== today && (
              <button 
                onClick={() => setSelectedDate(today)}
                className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Present Count (Clickable to switch directly to Present List) */}
        <div 
          onClick={() => {
            setActiveTab('present-list');
            setDateScope('selected');
          }}
          className="glass p-6 sm:p-8 rounded-[32px] border border-emerald-500/20 hover:border-emerald-500/50 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-emerald-500/10 to-transparent group"
        >
          <div className="flex justify-between items-start">
            <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Present Today</p>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white group-hover:text-emerald-200 transition-colors">
                {presentCountForSelectedDate}
              </h3>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300">
            <span>View Present List</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Absent Count (Clickable to switch directly to Absent List) */}
        <div 
          onClick={() => {
            setActiveTab('absent-list');
            setDateScope('selected');
          }}
          className="glass p-6 sm:p-8 rounded-[32px] border border-rose-500/20 hover:border-rose-500/50 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-rose-500/10 to-transparent group"
        >
          <div className="flex justify-between items-start">
            <div className="p-3.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <CalendarX size={24} />
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Absent Today</p>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white group-hover:text-rose-200 transition-colors">
                {absentCountForSelectedDate}
              </h3>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-rose-400 group-hover:text-rose-300">
            <span>View Absent List</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Enrollment / Marked Status */}
        <div className="glass p-6 sm:p-8 rounded-[32px] border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="p-3.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Users size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Marked / Enrolled</p>
              <h3 className="text-3xl sm:text-4xl font-black text-white">{totalMarkedForSelectedDate} / {approvedStudents.length}</h3>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-widest flex items-center justify-between">
            <span>All-Time:</span>
            <span className="font-mono font-black flex items-center gap-2">
              <span className="text-emerald-400">{totalPresentsAllTime} P</span>
              <span>•</span>
              <span className="text-rose-400">{totalAbsentsAllTime} A</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-2 bg-white/[0.03] rounded-3xl border border-white/10 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('roll-call')}
            className={`flex-1 sm:flex-initial px-5 sm:px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
              activeTab === 'roll-call'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={16} />
            <span>Daily Roll Call</span>
          </button>

          <button
            onClick={() => setActiveTab('present-list')}
            className={`flex-1 sm:flex-initial px-5 sm:px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all relative ${
              activeTab === 'present-list'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>Present List & Records</span>
            {presentCountForSelectedDate > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black font-mono">
                {presentCountForSelectedDate}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('absent-list')}
            className={`flex-1 sm:flex-initial px-5 sm:px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all relative ${
              activeTab === 'absent-list'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarX size={16} />
            <span>Absent List & Records</span>
            {absentCountForSelectedDate > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black font-mono">
                {absentCountForSelectedDate}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'present-list' && (
          <button
            onClick={() => {
              setNewEntryDate(selectedDate);
              setNewEntryStatus('present');
              setNewEntryStudentId(approvedStudents[0]?.id || '');
              setIsAddModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>Add Present Entry</span>
          </button>
        )}

        {activeTab === 'absent-list' && (
          <button
            onClick={() => {
              setNewEntryDate(selectedDate);
              setNewEntryStatus('absent');
              setNewEntryStudentId(approvedStudents[0]?.id || '');
              setIsAddModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>Add Absent Entry</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ROLL CALL                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'roll-call' && (
        <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between bg-white/[0.01]">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                <span>Daily Roll Call</span>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {safeFormat(selectedDate, 'EEEE, dd MMMM yyyy')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Mark students as present or absent for this specific calendar date
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Class Filter */}
              <div className="relative w-full sm:w-44">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="input-glass w-full py-3.5 px-4 rounded-2xl text-xs font-bold cursor-pointer text-slate-300"
                >
                  <option value="all" className="bg-slate-900 text-white">All Classes</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{formatClassName(c)}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search student or roll..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-glass w-full pl-12 pr-4 py-3.5 rounded-2xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Student Info</th>
                  <th className="px-8 py-5">Class & Subject</th>
                  <th className="px-8 py-5">Status on {safeFormat(selectedDate, 'dd MMM')}</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rollCallStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-slate-500">
                      <Users size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="font-bold text-sm">No approved students found</p>
                      <p className="text-xs text-slate-600 mt-1">Adjust your search or class filter</p>
                    </td>
                  </tr>
                ) : (
                  rollCallStudents.map(s => {
                    const record = getAttendanceRecord(s.id, selectedDate);
                    const status = record?.status;

                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Student info */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center font-black text-white group-hover:bg-indigo-600 transition-colors shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white tracking-tight">{s.name}</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                                {s.rollNumber || 'No Roll'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-slate-300">
                            {formatClassName(s.class)}
                          </span>
                          <p className="text-[10px] text-slate-500 font-medium">{s.subject || 'All Subjects'}</p>
                        </td>

                        {/* Status */}
                        <td className="px-8 py-6">
                          {status ? (
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border flex items-center gap-2 w-fit ${
                              status === 'present' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm shadow-rose-500/10'
                            }`}>
                              {status === 'present' ? <Check size={12}/> : <X size={12}/>} 
                              {status}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                              Not Marked
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button 
                              title="Mark Present"
                              onClick={() => handleMark(s.id, 'present')}
                              className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${
                                status === 'present' 
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                                  : 'bg-white/5 text-slate-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/5'
                              }`}
                            >
                              <Check size={18} />
                            </button>

                            <button 
                              title="Mark Absent"
                              onClick={() => handleMark(s.id, 'absent')}
                              className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 ${
                                status === 'absent' 
                                  ? 'bg-rose-500 text-white shadow-rose-500/30' 
                                  : 'bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 border border-white/5'
                              }`}
                            >
                              <X size={18} />
                            </button>

                            {/* Clear mark button if already marked */}
                            {record && (
                              <button
                                title="Clear/Delete Attendance Record"
                                onClick={() => handleClearMark(record.id, s.name)}
                                className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-all active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRESENT LIST & RECORDS (MODIFY & DELETE)                            */}
      {/* ========================================================================= */}
      {activeTab === 'present-list' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="glass p-6 sm:p-8 rounded-[32px] border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={20} />
                  </span>
                  <span>Present Records Directory</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                    {filteredPresentList.length} {filteredPresentList.length === 1 ? 'Record' : 'Records'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  View, filter, modify dates/statuses, or delete student present records directly
                </p>
              </div>

              {/* Date Scope Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDateScope('selected')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'selected'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Selected Date ({safeFormat(selectedDate, 'dd MMM')})
                </button>
                <button
                  onClick={() => setDateScope('today')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'today'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateScope('month')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'month'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  This Month ({safeFormat(selectedDate, 'MMM yyyy')})
                </button>
                <button
                  onClick={() => setDateScope('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'all'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  All-Time Log
                </button>
              </div>
            </div>

            {/* Sub Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by student, roll, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-glass w-full pl-12 pr-4 py-3 rounded-2xl text-xs"
                />
              </div>

              {/* Class Filter */}
              <div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="input-glass w-full py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer text-slate-300"
                >
                  <option value="all" className="bg-slate-900 text-white">All Classes</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{formatClassName(c)}</option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="input-glass w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between hover:border-white/20 text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpDown size={14} className="text-emerald-400" />
                    <span>Sort by Date:</span>
                  </span>
                  <span className="text-emerald-300 font-mono font-black">
                    {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Present Records List Table / Cards */}
          <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
            {filteredPresentList.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">No Present Records Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {dateScope === 'selected' 
                    ? `No students are marked present on ${safeFormat(selectedDate, 'dd MMMM yyyy')}.`
                    : 'No present records match your current filter criteria.'}
                </p>
                {dateScope !== 'all' && (
                  <button
                    onClick={() => setDateScope('all')}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                  >
                    View All-Time Present History
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-5">Present Date</th>
                      <th className="px-8 py-5">Student Information</th>
                      <th className="px-8 py-5">Class & Section</th>
                      <th className="px-8 py-5">Contact Info</th>
                      <th className="px-8 py-5 text-right">Modify & Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPresentList.map(({ record, student }) => {
                      const studentName = student?.name || 'Unknown Student';
                      const rollNumber = student?.rollNumber || 'N/A';

                      return (
                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Present Date */}
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Calendar size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">
                                  {safeFormat(record.date, 'dd MMM yyyy')}
                                </p>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                  {safeFormat(record.date, 'EEEE')}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Student Details */}
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center font-black text-white group-hover:bg-emerald-600 transition-colors shrink-0">
                                {studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-white tracking-tight">{studentName}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                                  Roll: {rollNumber}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Class & Subject */}
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-slate-300">
                              {student ? formatClassName(student.class) : 'N/A'}
                            </span>
                            <p className="text-[10px] text-slate-500">{student?.subject || 'All Subjects'}</p>
                          </td>

                          {/* Contact Info */}
                          <td className="px-8 py-6">
                            {student?.mobile ? (
                              <div className="space-y-1">
                                <a 
                                  href={`tel:${student.mobile}`}
                                  className="text-xs font-mono font-bold text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                                >
                                  <Phone size={12} className="text-slate-500" />
                                  <span>{student.mobile}</span>
                                </a>
                                {student.whatsapp && (
                                  <a
                                    href={`https://wa.me/91${student.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                                  >
                                    <MessageSquare size={11} /> WhatsApp
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">No contact</span>
                            )}
                          </td>

                          {/* Actions: Modify & Delete */}
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick One-Click Modify to Absent */}
                              <button
                                title="Convert to Absent (Modify)"
                                onClick={() => handleQuickMarkAbsent(record, studentName)}
                                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                              >
                                <X size={14} />
                                <span className="hidden sm:inline">Mark Absent</span>
                              </button>

                              {/* Edit Modal (Change date or details) */}
                              <button
                                title="Modify Record Details"
                                onClick={() => setEditingRecord(record)}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-white/5 transition-all active:scale-95"
                              >
                                <Edit2 size={16} />
                              </button>

                              {/* Delete Record */}
                              <button
                                title="Delete Present Record"
                                onClick={() => setRecordToDelete({ record, studentName })}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition-all active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ABSENT LIST & RECORDS (MODIFY & DELETE)                             */}
      {/* ========================================================================= */}
      {activeTab === 'absent-list' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="glass p-6 sm:p-8 rounded-[32px] border border-rose-500/20 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <CalendarX size={20} />
                  </span>
                  <span>Absent Records Directory</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                    {filteredAbsentList.length} {filteredAbsentList.length === 1 ? 'Record' : 'Records'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  View, filter, modify dates/statuses, or delete student absence entries directly
                </p>
              </div>

              {/* Date Scope Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDateScope('selected')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'selected'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Selected Date ({safeFormat(selectedDate, 'dd MMM')})
                </button>
                <button
                  onClick={() => setDateScope('today')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'today'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateScope('month')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'month'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  This Month ({safeFormat(selectedDate, 'MMM yyyy')})
                </button>
                <button
                  onClick={() => setDateScope('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    dateScope === 'all'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  All-Time Log
                </button>
              </div>
            </div>

            {/* Sub Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by student, roll, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-glass w-full pl-12 pr-4 py-3 rounded-2xl text-xs"
                />
              </div>

              {/* Class Filter */}
              <div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="input-glass w-full py-3 px-4 rounded-2xl text-xs font-bold cursor-pointer text-slate-300"
                >
                  <option value="all" className="bg-slate-900 text-white">All Classes</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">{formatClassName(c)}</option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="input-glass w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-between hover:border-white/20 text-slate-300"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpDown size={14} className="text-indigo-400" />
                    <span>Sort by Date:</span>
                  </span>
                  <span className="text-indigo-300 font-mono font-black">
                    {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Absent Records List Table / Cards */}
          <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
            {filteredAbsentList.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">No Absent Records Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {dateScope === 'selected' 
                    ? `No students are marked absent on ${safeFormat(selectedDate, 'dd MMMM yyyy')}.`
                    : 'No absent records match your current filter criteria.'}
                </p>
                {dateScope !== 'all' && (
                  <button
                    onClick={() => setDateScope('all')}
                    className="mt-6 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                  >
                    View All-Time Absent History
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-5">Absent Date</th>
                      <th className="px-8 py-5">Student Information</th>
                      <th className="px-8 py-5">Class & Section</th>
                      <th className="px-8 py-5">Contact Info</th>
                      <th className="px-8 py-5 text-right">Modify & Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAbsentList.map(({ record, student }) => {
                      const studentName = student?.name || 'Unknown Student';
                      const rollNumber = student?.rollNumber || 'N/A';

                      return (
                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Absent Date */}
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <Calendar size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">
                                  {safeFormat(record.date, 'dd MMM yyyy')}
                                </p>
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                  {safeFormat(record.date, 'EEEE')}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Student Details */}
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center font-black text-white group-hover:bg-rose-600 transition-colors shrink-0">
                                {studentName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-white tracking-tight">{studentName}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                                  Roll: {rollNumber}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Class & Subject */}
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-slate-300">
                              {student ? formatClassName(student.class) : 'N/A'}
                            </span>
                            <p className="text-[10px] text-slate-500">{student?.subject || 'All Subjects'}</p>
                          </td>

                          {/* Contact Info */}
                          <td className="px-8 py-6">
                            {student?.mobile ? (
                              <div className="space-y-1">
                                <a 
                                  href={`tel:${student.mobile}`}
                                  className="text-xs font-mono font-bold text-slate-300 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                                >
                                  <Phone size={12} className="text-slate-500" />
                                  <span>{student.mobile}</span>
                                </a>
                                {student.whatsapp && (
                                  <a
                                    href={`https://wa.me/91${student.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                                  >
                                    <MessageSquare size={11} /> WhatsApp
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">No contact</span>
                            )}
                          </td>

                          {/* Actions: Modify & Delete */}
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick One-Click Modify to Present */}
                              <button
                                title="Convert to Present (Modify)"
                                onClick={() => handleQuickMarkPresent(record, studentName)}
                                className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                              >
                                <Check size={14} />
                                <span className="hidden sm:inline">Mark Present</span>
                              </button>

                              {/* Edit Modal (Change date or details) */}
                              <button
                                title="Modify Record Details"
                                onClick={() => setEditingRecord(record)}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-white/5 transition-all active:scale-95"
                              >
                                <Edit2 size={16} />
                              </button>

                              {/* Delete Record */}
                              <button
                                title="Delete Absent Record"
                                onClick={() => setRecordToDelete({ record, studentName })}
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/5 transition-all active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT / MODIFY ATTENDANCE RECORD                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Modify Attendance</h4>
                    <p className="text-xs text-slate-400">Update record date or status</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingRecord(null)}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Student Identity summary */}
              {(() => {
                const s = students.find(st => st.id === editingRecord.studentId);
                return (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white">
                      {s?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{s?.name || 'Student'}</p>
                      <p className="text-[11px] text-slate-400">{s?.rollNumber || 'N/A'} • {s ? formatClassName(s.class) : ''}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Attendance Date
                  </label>
                  <input
                    type="date"
                    value={editingRecord.date}
                    onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                    className="input-glass w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Attendance Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingRecord({ ...editingRecord, status: 'present' })}
                      className={`p-3.5 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        editingRecord.status === 'present'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      <Check size={16} /> Present
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingRecord({ ...editingRecord, status: 'absent' })}
                      className={`p-3.5 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        editingRecord.status === 'absent'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-500/10'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      <X size={16} /> Absent
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-5 py-3 rounded-2xl bg-white/5 text-slate-300 font-bold text-xs hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedRecord}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save Modifications
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {recordToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-slate-900 border rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6 ${
                recordToDelete.record.status === 'present' ? 'border-emerald-500/30' : 'border-rose-500/30'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto ${
                recordToDelete.record.status === 'present'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                <Trash2 size={26} />
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-xl font-black text-white uppercase tracking-tight">
                  Delete {recordToDelete.record.status === 'present' ? 'Present' : 'Absent'} Record?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete the {recordToDelete.record.status} record for{' '}
                  <span className="font-bold text-white">{recordToDelete.studentName}</span> on{' '}
                  <span className={`font-bold ${recordToDelete.record.status === 'present' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {safeFormat(recordToDelete.record.date, 'dd MMMM yyyy')}
                  </span>?
                </p>
                <p className="text-[11px] text-slate-500">
                  This will completely remove this attendance entry from the database and student history.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRecordToDelete(null)}
                  className="px-6 py-3 rounded-2xl bg-white/5 text-slate-300 font-bold text-xs hover:bg-white/10 transition-colors"
                >
                  Keep Record
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all"
                >
                  Yes, Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD ATTENDANCE ENTRY MANUALLY                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    newEntryStatus === 'present'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {newEntryStatus === 'present' ? <CheckCircle2 size={20} /> : <CalendarX size={20} />}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">
                      Log {newEntryStatus === 'present' ? 'Present' : 'Absent'} Entry
                    </h4>
                    <p className="text-xs text-slate-400">
                      {newEntryStatus === 'present' ? 'Record student present attendance' : 'Record a new student absence'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Student *
                  </label>
                  <select
                    required
                    value={newEntryStudentId}
                    onChange={(e) => setNewEntryStudentId(e.target.value)}
                    className="input-glass w-full py-3.5 px-4 rounded-2xl text-xs font-bold cursor-pointer text-slate-200"
                  >
                    <option value="" disabled className="bg-slate-900">Choose Student...</option>
                    {approvedStudents.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                        {s.name} ({s.rollNumber || 'No Roll'} • {formatClassName(s.class)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Attendance Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEntryDate}
                    onChange={(e) => setNewEntryDate(e.target.value)}
                    className="input-glass w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Attendance Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewEntryStatus('present')}
                      className={`p-3.5 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        newEntryStatus === 'present'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      <Check size={16} /> Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEntryStatus('absent')}
                      className={`p-3.5 rounded-2xl border font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        newEntryStatus === 'absent'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-500/10'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      <X size={16} /> Absent
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-3 rounded-2xl bg-white/5 text-slate-300 font-bold text-xs hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all ${
                      newEntryStatus === 'present'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    }`}
                  >
                    Save Record
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

