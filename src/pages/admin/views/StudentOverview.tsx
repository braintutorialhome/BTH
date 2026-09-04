import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useStorage } from '../../../hooks/useStorage';
import { 
  Search, Eye, ShieldCheck, Download, Printer, User, Phone, 
  MapPin, Calendar, BookOpen, Layers, CheckCircle2, 
  X, LayoutGrid, Table as TableIcon, DollarSign, Clock, FileText,
  IndianRupee, Lock, UserCheck, MessageSquare, FileDown
} from 'lucide-react';
import { Student } from '../../../types';
import { safeFormat, formatClassName } from '../../../lib/utils';
import { exportStudentToPdf } from '../../../utils/studentPdfExport';
import { exportCsvData } from '../../../utils/mobileExportHelper';

export default function StudentOverview() {
  const { currentUser, students, fees, dueFees } = useStorage();

  // Strict Role-Based Access Control
  if (!currentUser || currentUser.role !== 'admin') {
    if (currentUser?.role === 'student') {
      return <Navigate to="/student/overview" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Filter & view states
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sessionFilter, setSessionFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'approved' | 'pending' | 'deleted'>('approved');
  const [feeStatusFilter, setFeeStatusFilter] = useState<'All' | 'due' | 'cleared'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'roll' | 'due' | 'paid' | 'class'>('name');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Selected student for comprehensive read-only profile modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Fee helper calculation
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

  // Extract filter options dynamically
  const classes = useMemo(() => {
    return ['All', ...Array.from(new Set(students.map(s => s.class).filter((c): c is string => Boolean(c) && c !== 'All'))).sort()];
  }, [students]);

  const sessions = useMemo(() => {
    return ['All', ...Array.from(new Set(students.map(s => s.semester).filter((s): s is string => Boolean(s) && s !== 'All'))).sort()];
  }, [students]);

  const subjects = useMemo(() => {
    return ['All', ...Array.from(new Set(students.map(s => s.subject).filter((s): s is string => Boolean(s) && s !== 'All'))).sort()];
  }, [students]);

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Status filter
      if (statusFilter !== 'All' && student.status !== statusFilter) {
        return false;
      }

      // Class, Session, Subject filters
      if (classFilter !== 'All' && student.class !== classFilter) return false;
      if (sessionFilter !== 'All' && student.semester !== sessionFilter) return false;
      if (subjectFilter !== 'All' && student.subject !== subjectFilter) return false;

      // Fee status filter
      const stats = getStudentFeeStats(student.id);
      if (feeStatusFilter === 'due' && stats.remainingBalance <= 0) return false;
      if (feeStatusFilter === 'cleared' && stats.remainingBalance > 0) return false;

      // Search match
      const query = searchTerm.toLowerCase();
      const matches = 
        String(student.name || '').toLowerCase().includes(query) ||
        String(student.rollNumber || '').toLowerCase().includes(query) ||
        String(student.id || '').toLowerCase().includes(query) ||
        String(student.mobile || '').toLowerCase().includes(query) ||
        String(student.whatsapp || '').toLowerCase().includes(query) ||
        String(student.fatherName || '').toLowerCase().includes(query) ||
        String(student.address || '').toLowerCase().includes(query);

      return matches;
    }).sort((a, b) => {
      if (sortBy === 'due') {
        return getStudentFeeStats(b.id).remainingBalance - getStudentFeeStats(a.id).remainingBalance;
      }
      if (sortBy === 'paid') {
        return getStudentFeeStats(b.id).totalPaid - getStudentFeeStats(a.id).totalPaid;
      }
      if (sortBy === 'roll') {
        return (a.rollNumber || '').localeCompare(b.rollNumber || '', undefined, { numeric: true });
      }
      if (sortBy === 'class') {
        return (a.class || '').localeCompare(b.class || '', undefined, { numeric: true });
      }
      return a.name.localeCompare(b.name);
    });
  }, [students, searchTerm, classFilter, sessionFilter, subjectFilter, statusFilter, feeStatusFilter, sortBy, fees, dueFees]);

  // Aggregate metrics
  const totalApproved = students.filter(s => s.status === 'approved').length;
  const totalSystemFeesPaid = fees.reduce((acc, f) => f.status === 'paid' ? acc + (Number(f.amount) || 0) : acc, 0);
  const totalSystemDuesAssigned = dueFees.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  // Export to CSV with mobile APK and web support
  const handleExportCSV = async () => {
    const headers = [
      'Student ID', 'Roll No', 'Full Name', 'Father Name', 'Class', 'Session', 
      'Subject', 'Mobile', 'WhatsApp', 'Gender', 'DOB', 'Joining Date', 
      'Address', 'Status', 'Current Fees Paid (INR)', 'Assigned Dues (INR)', 'Due Balance (INR)'
    ];

    const rows = filteredStudents.map(s => {
      const stats = getStudentFeeStats(s.id);
      return [
        `"${s.id}"`,
        `"${s.rollNumber || 'N/A'}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${(s.fatherName || 'N/A').replace(/"/g, '""')}"`,
        `"${formatClassName(s.class)}"`,
        `"${s.semester || 'N/A'}"`,
        `"${(s.subject || 'N/A').replace(/"/g, '""')}"`,
        `"${s.mobile || 'N/A'}"`,
        `"${s.whatsapp || 'N/A'}"`,
        `"${s.gender || 'N/A'}"`,
        `"${s.dob || 'N/A'}"`,
        `"${s.dateOfJoining || s.admissionDate || 'N/A'}"`,
        `"${(s.address || 'N/A').replace(/"/g, '""')}"`,
        `"${s.status}"`,
        stats.totalPaid,
        stats.totalDueAssigned,
        stats.remainingBalance
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const filename = `Student_Overview_${new Date().toISOString().split('T')[0]}.csv`;
    await exportCsvData(csvContent, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportSingleStudentPdf = async (student: Student) => {
    const stats = getStudentFeeStats(student.id);
    const studentPayments = fees.filter(f => f.studentId === student.id && f.status === 'paid');
    const studentDues = dueFees.filter(d => d.studentId === student.id);
    await exportStudentToPdf(student, stats, studentPayments, studentDues);
  };

  const selectedStats = selectedStudent ? getStudentFeeStats(selectedStudent.id) : null;
  const selectedStudentPayments = selectedStudent ? fees.filter(f => f.studentId === selectedStudent.id) : [];
  const selectedStudentDues = selectedStudent ? dueFees.filter(d => d.studentId === selectedStudent.id) : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-white/10 rounded-[32px] backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 shadow-sm">
              <Lock size={12} className="text-emerald-400" />
              READ-ONLY AUDIT MODE
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={12} />
              ADMINISTRATOR ACCESS ONLY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Student Overview
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-2xl mt-1">
            Master read-only registry displaying comprehensive student records, complete academic profiles, current collected fees, and active due balances.
          </p>
        </div>

        {/* Action controls (Read-Only Data Consumption) */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-white/20 active:scale-95"
            title="Export full list to CSV spreadsheet"
          >
            <Download size={15} className="text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-white/20 active:scale-95"
            title="Print overview report"
          >
            <Printer size={15} className="text-indigo-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Aggregate Financial & Academic Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Enrolled</p>
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserCheck size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{totalApproved}</p>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
            {students.length} Total Registered in DB
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Current Fees Collected</p>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <IndianRupee size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">₹{totalSystemFeesPaid.toLocaleString('en-IN')}</p>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
            {fees.filter(f => f.status === 'paid').length} Processed Transactions
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Total Dues Assigned</p>
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-cyan-300">₹{totalSystemDuesAssigned.toLocaleString('en-IN')}</p>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
            {dueFees.length} Fee Invoices / Dues Logged
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, roll number, system ID, mobile, WhatsApp, father..."
              className="w-full pl-11 pr-4 py-3 bg-[#030914]/80 border border-white/10 rounded-2xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <div className="flex p-1 bg-[#020712]/90 border border-white/10 rounded-2xl">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Table View"
              >
                <TableIcon size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters & Sorters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-white/5">
          {/* Status */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Student Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#020712]/90 border border-white/10 text-white text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
              <option value="deleted">Inactive / Deleted</option>
              <option value="All">All Statuses</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-[#020712]/90 border border-white/10 text-white text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              {classes.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>
              ))}
            </select>
          </div>

          {/* Session Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Session</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full bg-[#020712]/90 border border-white/10 text-white text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              {sessions.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Sessions' : s}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full bg-[#020712]/90 border border-white/10 text-white text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>
              ))}
            </select>
          </div>

          {/* Fee Status */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Fee Status</label>
            <select
              value={feeStatusFilter}
              onChange={(e) => setFeeStatusFilter(e.target.value as any)}
              className="w-full bg-[#020712]/90 border border-white/10 text-white text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Fee Statuses</option>
              <option value="due">Due Pending Only</option>
              <option value="cleared">Fully Cleared Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#020712]/90 border border-white/10 text-white text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-400"
            >
              <option value="name">Name (A-Z)</option>
              <option value="roll">Roll Number</option>
              <option value="class">Class</option>
              <option value="due">Highest Due</option>
              <option value="paid">Highest Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Showing Count Information */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs font-bold text-slate-400">
          Showing <span className="text-white font-extrabold">{filteredStudents.length}</span> students
          {searchTerm && <span> matching "<span className="text-cyan-400">{searchTerm}</span>"</span>}
        </p>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Read-Only Mode Active
        </span>
      </div>

      {/* Main Content: Table or Grid View */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-[32px] bg-white/[0.02] border border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Search size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Students Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No student records match the selected criteria or search term. Try resetting your search filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Dense, Comprehensive Read-Only Table */
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#020712]/70 backdrop-blur-xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-4 px-6">Student Information</th>
                  <th className="py-4 px-4">Roll / ID</th>
                  <th className="py-4 px-4">Academic Details</th>
                  <th className="py-4 px-4">Contact Details</th>
                  <th className="py-4 px-4">Current Fees Paid</th>
                  <th className="py-4 px-4">Due Balance</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium text-slate-300">
                {filteredStudents.map(student => {
                  const stats = getStudentFeeStats(student.id);
                  const isCleared = stats.remainingBalance <= 0;

                  return (
                    <tr 
                      key={student.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Student Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img 
                              src={student.avatarUrl} 
                              alt={student.name} 
                              className="w-10 h-10 rounded-2xl object-cover border border-white/10 shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-sm shrink-0">
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              Father: <span className="text-slate-300 font-semibold">{student.fatherName || 'N/A'}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roll & ID */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 text-xs">
                          {student.rollNumber || 'No Roll'}
                        </span>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          ID: {student.id}
                        </p>
                      </td>

                      {/* Academic Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase">
                            {formatClassName(student.class)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] font-bold">
                            {student.semester || 'N/A'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {student.subject || 'All Subjects'}
                        </p>
                      </td>

                      {/* Contact Details */}
                      <td className="py-4 px-4 space-y-1">
                        <p className="flex items-center gap-1 text-[11px] text-slate-300">
                          <Phone size={11} className="text-cyan-400" />
                          <span>{student.mobile || 'N/A'}</span>
                        </p>
                        {student.whatsapp && (
                          <p className="flex items-center gap-1 text-[11px] text-emerald-400">
                            <MessageSquare size={11} />
                            <span>{student.whatsapp}</span>
                          </p>
                        )}
                      </td>

                      {/* Fees Paid */}
                      <td className="py-4 px-4">
                        <p className="font-black text-emerald-400 text-sm">
                          ₹{stats.totalPaid.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {stats.paymentCount} payments
                        </p>
                      </td>

                      {/* Due Balance */}
                      <td className="py-4 px-4">
                        {isCleared ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle2 size={12} />
                            <span>Cleared</span>
                          </div>
                        ) : (
                          <div>
                            <p className="font-black text-rose-400 text-sm">
                              ₹{stats.remainingBalance.toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              of ₹{stats.totalDueAssigned.toLocaleString('en-IN')} due
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          student.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : student.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {student.status}
                        </span>
                      </td>

                      {/* Action: Open Read-Only Profile & Export PDF */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleExportSingleStudentPdf(student)}
                            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                            title="Export PDF for this student"
                          >
                            <FileDown size={13} />
                            <span>Export PDF</span>
                          </button>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-white/10 hover:border-indigo-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            <Eye size={13} />
                            <span>View Info</span>
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
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => {
            const stats = getStudentFeeStats(student.id);
            const isCleared = stats.remainingBalance <= 0;

            return (
              <div 
                key={student.id}
                className="p-6 rounded-[28px] bg-[#020712]/80 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between group shadow-xl backdrop-blur-md"
              >
                <div>
                  {/* Card Header: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img 
                          src={student.avatarUrl} 
                          alt={student.name} 
                          className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 text-base">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                          {student.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Roll: <span className="text-white font-bold">{student.rollNumber || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      student.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {student.status}
                    </span>
                  </div>

                  {/* Badges / Academic Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px]">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-black uppercase">
                      {formatClassName(student.class)}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold">
                      Session: {student.semester || 'N/A'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-bold">
                      {student.subject || 'N/A'}
                    </span>
                  </div>

                  {/* Personal & Contact snippet */}
                  <div className="space-y-1.5 text-xs text-slate-300 pb-4 border-b border-white/5">
                    <p className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Father's Name:</span>
                      <span className="text-white font-semibold">{student.fatherName || 'N/A'}</span>
                    </p>
                    <p className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Mobile:</span>
                      <span className="text-cyan-300 font-semibold">{student.mobile || 'N/A'}</span>
                    </p>
                    {student.whatsapp && (
                      <p className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>WhatsApp:</span>
                        <span className="text-emerald-400 font-semibold">{student.whatsapp}</span>
                      </p>
                    )}
                  </div>

                  {/* Financial Mini Grid */}
                  <div className="grid grid-cols-2 gap-3 py-4">
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Current Fees Paid</p>
                      <p className="text-base font-black text-emerald-400 mt-0.5">₹{stats.totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Due Balance</p>
                      <p className={`text-base font-black mt-0.5 ${isCleared ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCleared ? '₹0 (Cleared)' : `₹${stats.remainingBalance.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (View Info & Export PDF) */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="py-2.5 rounded-xl bg-white/5 hover:bg-indigo-600 text-slate-200 hover:text-white border border-white/10 hover:border-indigo-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <Eye size={14} />
                    <span>View Info</span>
                  </button>
                  <button
                    onClick={() => handleExportSingleStudentPdf(student)}
                    className="py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 hover:border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                    title="Export Student PDF"
                  >
                    <FileDown size={14} />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive READ-ONLY Profile & Fee Audit Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-[32px] bg-[#020817] border border-white/15 p-6 sm:p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                {selectedStudent.avatarUrl ? (
                  <img 
                    src={selectedStudent.avatarUrl} 
                    alt={selectedStudent.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shrink-0" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border-2 border-indigo-500/40 flex items-center justify-center font-black text-indigo-300 text-2xl shrink-0">
                    {selectedStudent.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedStudent.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Roll: <span className="text-white font-bold">{selectedStudent.rollNumber || 'N/A'}</span> • System ID: <span className="text-slate-300">{selectedStudent.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportSingleStudentPdf(selectedStudent)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-500 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Export this student's complete information and fee dossier to PDF"
                >
                  <FileDown size={14} />
                  <span>Export PDF</span>
                </button>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-400">
                  <Lock size={12} className="text-emerald-400" />
                  Read-Only View
                </span>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 mt-6">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Current Fees Paid</p>
                <p className="text-2xl font-black text-emerald-300 mt-1">₹{selectedStats?.totalPaid.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{selectedStats?.paymentCount} payments recorded</p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Total Dues Assigned</p>
                <p className="text-2xl font-black text-cyan-300 mt-1">₹{selectedStats?.totalDueAssigned.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{selectedStats?.dueCount} dues assigned</p>
              </div>
            </div>

            {/* Complete Personal & Academic Information */}
            <div className="mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <User size={14} className="text-indigo-400" />
                Comprehensive Student Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Father's Name</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.fatherName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Class</p>
                  <p className="font-bold text-white mt-0.5">{formatClassName(selectedStudent.class)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Session</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.semester || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subject(s)</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.subject || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</p>
                  <p className="font-bold text-cyan-300 mt-0.5">{selectedStudent.mobile || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Number</p>
                  <p className="font-bold text-emerald-400 mt-0.5">{selectedStudent.whatsapp || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.dob || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Joining Date</p>
                  <p className="font-bold text-white mt-0.5">{selectedStudent.dateOfJoining || selectedStudent.admissionDate || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2 md:col-span-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</p>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedStudent.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Current Fees / Payments History (Read-Only) */}
            <div className="mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} />
                Current Fees History (Payments Received)
              </h4>
              {selectedStudentPayments.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-500">
                  No payment records found for this student.
                </div>
              ) : (
                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Month</th>
                        <th className="p-3">Payment Method</th>
                        <th className="p-3">Notes</th>
                        <th className="p-3 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedStudentPayments.map(payment => (
                        <tr key={payment.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-mono text-slate-300">{safeFormat(payment.date, 'dd MMM yyyy')}</td>
                          <td className="p-3 font-bold text-white">{payment.month || 'N/A'}</td>
                          <td className="p-3 text-slate-400">{payment.paymentMethod || 'Cash'}</td>
                          <td className="p-3 text-slate-400 italic text-[11px]">{payment.notes || '—'}</td>
                          <td className="p-3 text-right font-black text-emerald-400">
                            ₹{Number(payment.amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Due Fees Records (Read-Only) */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
                <FileText size={14} />
                Assigned Due Fees (Dues Invoiced)
              </h4>
              {selectedStudentDues.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-500">
                  No due fees assigned to this student.
                </div>
              ) : (
                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Due Remarks / Purpose</th>
                        <th className="p-3 text-right">Due Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedStudentDues.map(due => (
                        <tr key={due.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-mono text-slate-300">{safeFormat(due.date, 'dd MMM yyyy')}</td>
                          <td className="p-3 font-bold text-white">{due.remarks || 'Standard Dues'}</td>
                          <td className="p-3 text-right font-black text-cyan-300">
                            ₹{Number(due.amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                System Record • Confidential
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleExportSingleStudentPdf(selectedStudent)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 border border-cyan-400/30"
                  title="Export student complete profile & fees as PDF"
                >
                  <FileDown size={15} />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
