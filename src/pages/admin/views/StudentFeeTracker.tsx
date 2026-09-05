import React, { useState, useRef } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { 
  Search, Filter, Users, CreditCard, IndianRupee, Plus, Edit2, Trash2, X, 
  CheckCircle, AlertCircle, Phone, MapPin, Calendar, BookOpen, User, Camera, 
  Upload, Save, ChevronRight, DollarSign, FileText, ArrowUpRight, ArrowDownRight, RefreshCw, FileDown, FileSpreadsheet
} from 'lucide-react';
import { Student, Fee, DueFee } from '../../../types';
import { safeFormat, formatClassName } from '../../../lib/utils';
import { exportStudentToPdf } from '../../../utils/studentPdfExport';
import { exportStudentToCsv } from '../../../utils/studentCsvExport';
import { exportCsvData } from '../../../utils/mobileExportHelper';

export default function StudentFeeTracker() {
  const { 
    students, fees, dueFees, 
    updateStudent, addFee, updateFee, deleteFee, 
    addDueFee, updateDueFee, deleteDueFee 
  } = useStorage();

  // Active filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sessionFilter, setSessionFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Cleared'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'due' | 'roll'>('name');

  // Selected student for detailed drawer/modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Modal states inside detailed view
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isAddingDue, setIsAddingDue] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Fee | null>(null);
  const [editingDue, setEditingDue] = useState<DueFee | null>(null);
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = useState<string | null>(null);
  const [confirmDeleteDueId, setConfirmDeleteDueId] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState<Student | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    month: safeFormat(new Date(), 'MMMM yyyy'),
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  });
  const [dueForm, setDueForm] = useState({
    amount: '',
    remarks: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter approved students
  const approvedStudents = students.filter(s => s.status === 'approved');

  // Helper calculations for a student
  const getStudentFeeStats = (studentId: string) => {
    const studentFees = fees.filter(f => f.studentId === studentId && f.status === 'paid');
    const totalPaid = studentFees.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const studentDues = dueFees.filter(d => d.studentId === studentId);
    const totalDueAssigned = studentDues.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const remainingBalance = totalDueAssigned - totalPaid;

    return {
      totalPaid,
      totalDueAssigned,
      remainingBalance,
      isFullyPaid: remainingBalance <= 0,
      paymentCount: studentFees.length,
      dueCount: studentDues.length
    };
  };

  // Distinct classes, sessions, and subjects for dropdown filters
  const classes = ['All', ...Array.from(new Set(approvedStudents.map(s => s.class).filter((c): c is string => Boolean(c) && c !== 'All'))).sort()];
  const sessions = ['All', ...Array.from(new Set(approvedStudents.map(s => s.semester).filter((sem): sem is string => Boolean(sem) && sem !== 'All'))).sort()];
  const subjects = ['All', ...Array.from(new Set(approvedStudents.map(s => s.subject).filter((s): s is string => Boolean(s) && s !== 'All'))).sort()];

  // Filter & Sort student list
  const filteredStudents = approvedStudents.filter(student => {
    const stats = getStudentFeeStats(student.id);
    
    const matchesSearch = 
      String(student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(student.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(student.fatherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(student.mobile || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'All' || student.class === classFilter;
    const matchesSession = sessionFilter === 'All' || student.semester === sessionFilter;
    const matchesSubject = subjectFilter === 'All' || student.subject === subjectFilter;

    let matchesStatus = true;
    if (statusFilter === 'Pending') {
      matchesStatus = stats.remainingBalance > 0;
    } else if (statusFilter === 'Cleared') {
      matchesStatus = stats.remainingBalance <= 0;
    }

    return matchesSearch && matchesClass && matchesSession && matchesSubject && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'due') {
      const dueA = getStudentFeeStats(a.id).remainingBalance;
      const dueB = getStudentFeeStats(b.id).remainingBalance;
      return dueB - dueA;
    } else if (sortBy === 'roll') {
      return (a.rollNumber || '').localeCompare(b.rollNumber || '');
    }
    return a.name.localeCompare(b.name);
  });

  // Global summary stats
  const totalSystemPaid = fees.reduce((acc, f) => f.status === 'paid' ? acc + (Number(f.amount) || 0) : acc, 0);
  const totalSystemDuesAssigned = dueFees.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalSystemPendingBalance = Math.max(0, totalSystemDuesAssigned - totalSystemPaid);

  const selectedStudent = approvedStudents.find(s => s.id === selectedStudentId);
  const selectedStudentStats = selectedStudent ? getStudentFeeStats(selectedStudent.id) : null;
  const selectedStudentFees = selectedStudent ? fees.filter(f => f.studentId === selectedStudent.id) : [];
  const selectedStudentDues = selectedStudent ? dueFees.filter(d => d.studentId === selectedStudent.id) : [];

  // Handlers
  const handleOpenDetail = (student: Student) => {
    setSelectedStudentId(student.id);
    setProfileForm(student);
    setIsEditingProfile(false);
    setIsAddingPayment(false);
    setIsAddingDue(false);
    setEditingPayment(null);
    setEditingDue(null);
  };

  // Export Fee Tracking Data to CSV with mobile APK support
  const handleExportFeeCSV = async () => {
    const headers = [
      'Student ID', 'Roll No', 'Full Name', 'Father Name', 'Class', 'Session',
      'Subject', 'Mobile', 'Total Dues Assigned (INR)', 'Total Fees Paid (INR)',
      'Remaining Balance (INR)', 'Fee Status'
    ];

    const rows = filteredStudents.map(s => {
      const stats = getStudentFeeStats(s.id);
      const feeStatus = stats.remainingBalance <= 0 ? 'Cleared' : 'Pending';
      return [
        `"${s.id}"`,
        `"${s.rollNumber || 'N/A'}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${(s.fatherName || 'N/A').replace(/"/g, '""')}"`,
        `"${formatClassName(s.class)}"`,
        `"${s.semester || 'N/A'}"`,
        `"${(s.subject || 'N/A').replace(/"/g, '""')}"`,
        `"${s.mobile || 'N/A'}"`,
        stats.totalDueAssigned,
        stats.totalPaid,
        stats.remainingBalance,
        `"${feeStatus}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const filename = `Fee_Tracker_${new Date().toISOString().split('T')[0]}.csv`;
    await exportCsvData(csvContent, filename);
  };

  const handleExportStudentPdf = async (student: Student) => {
    const stats = getStudentFeeStats(student.id);
    const studentPayments = fees.filter(f => f.studentId === student.id && f.status === 'paid');
    const studentDues = dueFees.filter(d => d.studentId === student.id);
    await exportStudentToPdf(student, stats, studentPayments, studentDues);
  };

  const handleExportStudentCsv = async (student: Student) => {
    const stats = getStudentFeeStats(student.id);
    const studentPayments = fees.filter(f => f.studentId === student.id && f.status === 'paid');
    const studentDues = dueFees.filter(d => d.studentId === student.id);
    await exportStudentToCsv(student, stats, studentPayments, studentDues);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileForm) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProfileForm({ ...profileForm, avatarUrl: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm) {
      updateStudent(profileForm);
      setIsEditingProfile(false);
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !paymentForm.amount) return;

    if (editingPayment) {
      updateFee({
        ...editingPayment,
        amount: parseFloat(paymentForm.amount),
        month: paymentForm.month,
        date: paymentForm.date,
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });
      setEditingPayment(null);
    } else {
      addFee({
        studentId: selectedStudent.id,
        amount: parseFloat(paymentForm.amount),
        month: paymentForm.month,
        date: paymentForm.date,
        status: 'paid',
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });
    }

    setIsAddingPayment(false);
    setPaymentForm({
      amount: '',
      month: safeFormat(new Date(), 'MMMM yyyy'),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash',
      notes: ''
    });
  };

  const handleSaveDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !dueForm.amount) return;

    if (editingDue) {
      updateDueFee({
        ...editingDue,
        amount: parseFloat(dueForm.amount),
        remarks: dueForm.remarks,
        date: dueForm.date || new Date().toISOString()
      });
      setEditingDue(null);
    } else {
      addDueFee({
        studentId: selectedStudent.id,
        amount: parseFloat(dueForm.amount),
        remarks: dueForm.remarks
      });
    }

    setIsAddingDue(false);
    setDueForm({
      amount: '',
      remarks: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-8">
      {/* Admin Privilege Header Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/40 p-6 rounded-[32px] border border-indigo-500/20 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
            <Users size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Student Management & Fee Tracking</h2>
              <span className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[9px] font-black uppercase tracking-widest rounded-md">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Comprehensive student profiles, fee balance tracking, and instant global state synchronization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Approved Students</p>
            <p className="text-xl font-black text-white">{approvedStudents.length}</p>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-[28px] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Fee Collected</p>
            <h3 className="text-2xl font-black text-emerald-400">₹{totalSystemPaid.toLocaleString()}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Across all approved student records</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="glass p-6 rounded-[28px] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Dues Assigned</p>
            <h3 className="text-2xl font-black text-indigo-400">₹{totalSystemDuesAssigned.toLocaleString()}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Total billing charges recorded</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="glass p-6 rounded-[32px] border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name, roll number, ID, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass w-full pl-11 py-3 text-sm rounded-2xl"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Class */}
          <div className="col-span-1 lg:col-span-2 relative">
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="input-glass w-full py-3 px-4 text-xs font-bold rounded-2xl appearance-none cursor-pointer"
            >
              {classes.map((c, idx) => (
                <option key={`cls-opt-${c}-${idx}`} value={c} className="bg-slate-900 text-white">
                  {c === 'All' ? 'All Classes' : `Class: ${c}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Session */}
          <div className="col-span-1 lg:col-span-2 relative">
            <select 
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="input-glass w-full py-3 px-4 text-xs font-bold rounded-2xl appearance-none cursor-pointer"
            >
              {sessions.map((s, idx) => (
                <option key={`ses-opt-${s}-${idx}`} value={s} className="bg-slate-900 text-white">
                  {s === 'All' ? 'All Sessions' : `Session: ${s}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Subject/Batch */}
          <div className="col-span-1 lg:col-span-2 relative">
            <select 
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="input-glass w-full py-3 px-4 text-xs font-bold rounded-2xl appearance-none cursor-pointer"
            >
              {subjects.map((s, idx) => (
                <option key={`sbj-opt-${s}-${idx}`} value={s} className="bg-slate-900 text-white">
                  {s === 'All' ? 'All Subjects' : `Subject: ${s}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Fee Status */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-glass w-full py-3 px-4 text-xs font-bold rounded-2xl appearance-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">Status: All</option>
              <option value="Pending" className="bg-slate-900 text-white">Status: Pending</option>
              <option value="Cleared" className="bg-slate-900 text-white">Status: Cleared</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Showing:</span>
            <span className="px-2.5 py-1 bg-white/5 rounded-lg font-black text-indigo-400">{filteredStudents.length} of {approvedStudents.length} Students</span>
            {(classFilter !== 'All' || sessionFilter !== 'All' || subjectFilter !== 'All' || statusFilter !== 'All' || searchTerm) && (
              <button 
                onClick={() => {
                  setClassFilter('All');
                  setSessionFilter('All');
                  setSubjectFilter('All');
                  setStatusFilter('All');
                  setSearchTerm('');
                }}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-500">Sort By:</span>
            <button 
              onClick={() => setSortBy('name')} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sortBy === 'name' ? 'bg-indigo-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
            >
              Name (A-Z)
            </button>
            <button 
              onClick={() => setSortBy('due')} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sortBy === 'due' ? 'bg-amber-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
            >
              Highest Due
            </button>
            <button 
              onClick={() => setSortBy('roll')} 
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sortBy === 'roll' ? 'bg-indigo-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
            >
              Roll No
            </button>

            <button
              onClick={handleExportFeeCSV}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-500 text-cyan-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ml-2"
              title="Export fee tracking data to CSV (APK & Web compatible)"
            >
              <FileDown size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const stats = getStudentFeeStats(student.id);

          return (
            <div 
              key={student.id} 
              onClick={() => handleOpenDetail(student)}
              className="glass p-6 rounded-[32px] border border-white/10 hover:border-indigo-500/40 transition-all duration-300 group cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white tracking-tight group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {student.name}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Class: {student.class} • {student.subject}{student.semester ? ` • Session: ${student.semester}` : ''}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-500">
                        Roll No: <span className="text-slate-300 font-bold">{student.rollNumber || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  {stats.remainingBalance > 0 ? (
                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-xl shrink-0">
                      Pending
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-xl shrink-0">
                      Cleared
                    </span>
                  )}
                </div>

                {/* Guardian & Contact */}
                <div className="p-3 bg-white/5 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Guardian:</span>
                    <span className="font-bold text-white line-clamp-1">{student.fatherName || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Mobile:</span>
                    <span className="font-bold text-indigo-300">{student.mobile || 'N/A'}</span>
                  </div>
                </div>

                {/* Fee Breakdown Pills */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-center">
                  <div className="p-2 bg-slate-900/40 rounded-xl border border-white/5">
                    <p className="text-[8px] font-black uppercase text-slate-500">Total Dues</p>
                    <p className="text-xs font-black text-white">₹{stats.totalDueAssigned.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-emerald-950/30 rounded-xl border border-emerald-500/10">
                    <p className="text-[8px] font-black uppercase text-emerald-500">Paid</p>
                    <p className="text-xs font-black text-emerald-400">₹{stats.totalPaid.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* View Action */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300">
                <span>View Full Profile & Fees</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-16 text-center glass rounded-[36px] border border-white/10 space-y-3">
            <Users size={40} className="mx-auto text-slate-600" />
            <p className="text-sm font-black text-white uppercase tracking-wider">No matching students found</p>
            <p className="text-xs font-semibold text-slate-500">Try adjusting your search keywords or filter dropdowns</p>
          </div>
        )}
      </div>

      {/* DETAILED STUDENT PROFILE & FEE VIEW MODAL */}
      {selectedStudent && selectedStudentStats && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-2xl bg-slate-950/80 overflow-y-auto">
          <div className="glass max-w-4xl w-full my-auto p-6 sm:p-10 rounded-[40px] border border-white/10 space-y-8 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-600/30 overflow-hidden shrink-0">
                  {selectedStudent.avatarUrl ? (
                    <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    selectedStudent.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white tracking-tight">{selectedStudent.name}</h2>
                    <span className="px-3 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Roll: {selectedStudent.rollNumber || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    ID: {selectedStudent.id} • Class: {selectedStudent.class} • Subject: {selectedStudent.subject}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => selectedStudent && selectedStudentStats && handleExportStudentPdf(selectedStudent)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-500 text-cyan-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Export student dossier to PDF (APK & Web compatible)"
                >
                  <FileDown size={14} />
                  <span>Export PDF</span>
                </button>
                <button 
                  onClick={() => selectedStudent && selectedStudentStats && handleExportStudentCsv(selectedStudent)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Export student dossier to CSV (Excel/Sheets)"
                >
                  <FileSpreadsheet size={14} />
                  <span>Export CSV</span>
                </button>
                <button 
                  onClick={() => setSelectedStudentId(null)}
                  className="p-2 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Visual Fee Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Dues Assigned</p>
                <p className="text-2xl font-black text-indigo-400 mt-2">₹{selectedStudentStats.totalDueAssigned.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 mt-1">{selectedStudentStats.dueCount} bill record(s)</p>
              </div>

              <div className="p-5 bg-emerald-950/20 rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Paid</p>
                <p className="text-2xl font-black text-emerald-400 mt-2">₹{selectedStudentStats.totalPaid.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 mt-1">{selectedStudentStats.paymentCount} payment transaction(s)</p>
              </div>
            </div>

            {/* Action Bar: Edit Profile, Collect Payment, Assign Due */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10"
                >
                  <Edit2 size={14} /> {isEditingProfile ? 'Close Edit Form' : 'Edit Student Details'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsAddingDue(true);
                    setIsAddingPayment(false);
                    setDueForm({ amount: '', remarks: '', date: new Date().toISOString().split('T')[0] });
                  }}
                  className="px-4 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Assign New Due
                </button>

                <button 
                  onClick={() => {
                    setIsAddingPayment(true);
                    setIsAddingDue(false);
                    setPaymentForm({
                      amount: '',
                      month: safeFormat(new Date(), 'MMMM yyyy'),
                      date: new Date().toISOString().split('T')[0],
                      paymentMethod: 'Cash',
                      notes: ''
                    });
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <CreditCard size={14} /> Record Payment
                </button>
              </div>
            </div>

            {/* EDIT STUDENT PROFILE FORM (Inline) */}
            {isEditingProfile && profileForm && (
              <form onSubmit={handleSaveProfile} className="p-6 bg-indigo-950/40 border border-indigo-500/30 rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-indigo-400" /> Edit Student Personal Information
                  </h3>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-white text-xs">Cancel</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photo Upload */}
                  <div className="md:col-span-2 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {profileForm.avatarUrl ? (
                        <img src={profileForm.avatarUrl} alt={profileForm.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-white text-xl">{profileForm.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Student Profile Picture</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                        >
                          <Upload size={12} /> Upload Photo
                        </button>
                        {profileForm.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setProfileForm({ ...profileForm, avatarUrl: '' })}
                            className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        )}
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleProfileImageChange} accept="image/*" className="hidden" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Roll Number</label>
                    <input 
                      type="text" 
                      value={profileForm.rollNumber || ''} 
                      onChange={e => setProfileForm({ ...profileForm, rollNumber: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold text-indigo-300" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Parent / Guardian Name</label>
                    <input 
                      type="text" 
                      value={profileForm.fatherName || ''} 
                      onChange={e => setProfileForm({ ...profileForm, fatherName: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Contact Mobile</label>
                    <input 
                      type="text" 
                      value={profileForm.mobile} 
                      onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={profileForm.whatsapp || ''} 
                      onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      placeholder="+91..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Class</label>
                    <select 
                      value={profileForm.class} 
                      onChange={e => setProfileForm({ ...profileForm, class: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold cursor-pointer"
                    >
                      <option value="Class-V">Class-V</option>
                      <option value="Class-VI">Class-VI</option>
                      <option value="Class-VII">Class-VII</option>
                      <option value="Class-VIII">Class-VIII</option>
                      <option value="Class-IX">Class-IX</option>
                      <option value="Class-X">Class-X</option>
                      <option value="Class-XI">Class-XI</option>
                      <option value="Class-XII">Class-XII</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Subject / Batch</label>
                    <input 
                      type="text" 
                      value={profileForm.subject} 
                      onChange={e => setProfileForm({ ...profileForm, subject: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Date of Joining</label>
                    <input 
                      type="date" 
                      value={profileForm.dateOfJoining || ''} 
                      onChange={e => setProfileForm({ ...profileForm, dateOfJoining: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Date of Birth</label>
                    <input 
                      type="date" 
                      value={profileForm.dob || ''} 
                      onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Residential Address</label>
                    <input 
                      type="text" 
                      value={profileForm.address || ''} 
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <Save size={14} /> Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {/* RECORD PAYMENT FORM */}
            {(isAddingPayment || editingPayment) && (
              <form onSubmit={handleSavePayment} className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={16} className="text-emerald-400" />
                    {editingPayment ? 'Edit Payment Record' : `Collect Fee Payment for ${selectedStudent.name}`}
                  </h3>
                  <button type="button" onClick={() => { setIsAddingPayment(false); setEditingPayment(null); }} className="text-slate-400 hover:text-white text-xs">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Amount Paid (₹)</label>
                    <input 
                      type="number" 
                      value={paymentForm.amount} 
                      onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} 
                      placeholder="e.g. 1500" 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Billing Month / Term</label>
                    <input 
                      type="text" 
                      value={paymentForm.month} 
                      onChange={e => setPaymentForm({ ...paymentForm, month: e.target.value })} 
                      placeholder="e.g. April 2026" 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Payment Date</label>
                    <input 
                      type="date" 
                      value={paymentForm.date} 
                      onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Payment Method</label>
                    <select 
                      value={paymentForm.paymentMethod} 
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold cursor-pointer"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI / GPay">UPI / GPay</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Notes / Receipt Ref (Optional)</label>
                    <input 
                      type="text" 
                      value={paymentForm.notes} 
                      onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} 
                      placeholder="e.g. Receipt #402, paid via UPI transaction ID..." 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setIsAddingPayment(false); setEditingPayment(null); }} className="px-5 py-2.5 bg-white/5 text-slate-400 rounded-xl text-xs font-black uppercase">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase shadow-lg">
                    {editingPayment ? 'Update Payment Record' : 'Confirm Payment Transaction'}
                  </button>
                </div>
              </form>
            )}

            {/* ASSIGN DUE FORM */}
            {(isAddingDue || editingDue) && (
              <form onSubmit={handleSaveDue} className="p-6 bg-amber-950/40 border border-amber-500/30 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <IndianRupee size={16} className="text-amber-400" />
                    {editingDue ? 'Edit Assigned Due' : `Assign New Fee Due / Charge for ${selectedStudent.name}`}
                  </h3>
                  <button type="button" onClick={() => { setIsAddingDue(false); setEditingDue(null); }} className="text-slate-400 hover:text-white text-xs">Cancel</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Due Amount (₹)</label>
                    <input 
                      type="number" 
                      value={dueForm.amount} 
                      onChange={e => setDueForm({ ...dueForm, amount: e.target.value })} 
                      placeholder="e.g. 2000" 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Date Assigned</label>
                    <input 
                      type="date" 
                      value={dueForm.date} 
                      onChange={e => setDueForm({ ...dueForm, date: e.target.value })} 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Remarks / Purpose</label>
                    <input 
                      type="text" 
                      value={dueForm.remarks} 
                      onChange={e => setDueForm({ ...dueForm, remarks: e.target.value })} 
                      placeholder="e.g. Monthly tuition fee for May, Examination fee, Lab charge..." 
                      className="input-glass w-full py-2.5 px-4 text-xs font-bold" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setIsAddingDue(false); setEditingDue(null); }} className="px-5 py-2.5 bg-white/5 text-slate-400 rounded-xl text-xs font-black uppercase">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase shadow-lg">
                    {editingDue ? 'Update Due Record' : 'Save Due Charge'}
                  </button>
                </div>
              </form>
            )}

            {/* Personal Details Detailed Grid */}
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-white/5 pb-2">
                Personal & Academic Overview
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Guardian Name</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.fatherName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Mobile Number</p>
                  <p className="font-bold text-indigo-300 mt-0.5">{selectedStudent.mobile || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp Number</p>
                  <p className="font-bold text-indigo-300 mt-0.5">{selectedStudent.whatsapp || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Gender / DOB</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.gender || 'N/A'} • {selectedStudent.dob || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Date of Joining</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.dateOfJoining || safeFormat(selectedStudent.admissionDate, 'dd MMM yyyy')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Address</p>
                  <p className="font-bold text-slate-300 mt-0.5">{selectedStudent.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Session</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.semester || 'NA'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Account Status</p>
                  <p className="font-bold text-emerald-400 mt-0.5 uppercase tracking-wider">{selectedStudent.status}</p>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-400" /> Payment History ({selectedStudentFees.length})
                </h3>
              </div>

              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white/5 text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-white/5">
                        <th className="p-4">Paid On</th>
                        <th className="p-4">Billing Month</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Notes</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedStudentFees.slice().reverse().map(fee => (
                        <tr key={fee.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-slate-300">{safeFormat(fee.date, 'dd MMM yyyy')}</td>
                          <td className="p-4 font-bold text-white">{fee.month}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-indigo-300">
                              {fee.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td className="p-4 font-black text-emerald-400 text-sm">₹{fee.amount}</td>
                          <td className="p-4 text-slate-400 text-[11px]">{fee.notes || '-'}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingPayment(fee);
                                  setPaymentForm({
                                    amount: fee.amount.toString(),
                                    month: fee.month,
                                    date: fee.date,
                                    paymentMethod: fee.paymentMethod || 'Cash',
                                    notes: fee.notes || ''
                                  });
                                  setIsAddingPayment(false);
                                }}
                                className="p-1.5 text-indigo-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                title="Edit Payment"
                              >
                                <Edit2 size={14} />
                              </button>

                              {confirmDeletePaymentId === fee.id ? (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => {
                                      deleteFee(fee.id);
                                      setConfirmDeletePaymentId(null);
                                    }}
                                    className="px-2 py-1 bg-rose-600 text-white font-black text-[9px] uppercase rounded"
                                  >
                                    Confirm
                                  </button>
                                  <button onClick={() => setConfirmDeletePaymentId(null)} className="p-1 text-slate-400">
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setConfirmDeletePaymentId(fee.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                                  title="Delete Payment"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {selectedStudentFees.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            No past fee payments recorded for this student yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Assigned Dues & Charges History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <IndianRupee size={16} className="text-amber-400" /> Assigned Dues & Charges ({selectedStudentDues.length})
                </h3>
              </div>

              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white/5 text-slate-400 font-black uppercase text-[9px] tracking-widest border-b border-white/5">
                        <th className="p-4">Assigned Date</th>
                        <th className="p-4">Remarks / Purpose</th>
                        <th className="p-4">Due Amount</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedStudentDues.slice().reverse().map(due => (
                        <tr key={due.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-bold text-slate-300">{safeFormat(due.date, 'dd MMM yyyy')}</td>
                          <td className="p-4 font-bold text-white">{due.remarks}</td>
                          <td className="p-4 font-black text-amber-400 text-sm">₹{due.amount}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingDue(due);
                                  setDueForm({
                                    amount: due.amount.toString(),
                                    remarks: due.remarks,
                                    date: due.date ? due.date.split('T')[0] : new Date().toISOString().split('T')[0]
                                  });
                                  setIsAddingDue(false);
                                }}
                                className="p-1.5 text-amber-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                title="Edit Due"
                              >
                                <Edit2 size={14} />
                              </button>

                              {confirmDeleteDueId === due.id ? (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => {
                                      deleteDueFee(due.id);
                                      setConfirmDeleteDueId(null);
                                    }}
                                    className="px-2 py-1 bg-rose-600 text-white font-black text-[9px] uppercase rounded"
                                  >
                                    Confirm
                                  </button>
                                  <button onClick={() => setConfirmDeleteDueId(null)} className="p-1 text-slate-400">
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setConfirmDeleteDueId(due.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                                  title="Delete Due"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {selectedStudentDues.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                            No specific due charges assigned yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}
