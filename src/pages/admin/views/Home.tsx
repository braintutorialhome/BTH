import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useStorage } from '../../../hooks/useStorage';
import { 
  Users, FileCheck, CreditCard, Calendar, DollarSign, Eye, ArrowRight, ShieldCheck, IndianRupee, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getISTToday } from '../../../lib/utils';

const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
  <div className="glass p-6 rounded-3xl group hover:bg-white/10 transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {subValue && (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{subValue}</span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-4xl font-black tracking-tighter text-white">{value}</h3>
    </div>
  </div>
);

export default function AdminHome() {
  const { 
    students = [], expenses = [], fees = [], attendance = [], dueFees = []
  } = useStorage();

  const totalStudents = students.filter(s => s.status === 'approved').length;
  const pendingAdmissions = students.filter(s => s.status === 'pending').length;
  const totalFees = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalFees - totalExpenses;
  const totalDueRecords = dueFees.length;
  const totalAssignedDues = dueFees.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const today = getISTToday();
  const attendanceToday = attendance.filter(a => a.date === today);
  const attendancePercent = attendanceToday.length > 0 
    ? Math.round((attendanceToday.filter(a => a.status === 'present').length / attendanceToday.length) * 100)
    : 0;

  const data = [
    { name: 'Income', amount: totalFees, color: '#10B981' },
    { name: 'Expenses', amount: totalExpenses, color: '#EF4444' },
    { name: 'Balance', amount: netBalance, color: '#6366F1' },
  ];

  return (
    <div className="space-y-10">
      {/* Top Header Row with Direct Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
            Overview <span className="text-indigo-500">Center</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Institutional metrics, student directories, and fee intelligence
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            id="admin-overview-student-fee-tracker-btn"
            to="/admin/student-fee-tracker"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/30 hover:border-emerald-500/50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/20 active:scale-95 whitespace-nowrap"
          >
            <CreditCard size={15} className="text-emerald-400" />
            <span>Student Fee Tracker</span>
          </Link>
          <Link
            id="admin-overview-student-overview-btn"
            to="/admin/student-overview"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-indigo-950/20 active:scale-95 whitespace-nowrap"
          >
            <Eye size={15} className="text-indigo-400" />
            <span>Student Overview</span>
          </Link>
        </div>
      </div>

      {/* Featured Options: Student Overview & Student Fee Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Overview Card */}
        <div className="relative group overflow-hidden rounded-[32px] p-7 bg-gradient-to-br from-indigo-950/40 via-white/[0.03] to-purple-950/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 shadow-xl shadow-indigo-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Eye size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
              <Sparkles size={11} /> 360° Directory
            </span>
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-200 transition-colors">
            Student Overview
          </h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            Comprehensive student directory with class filters, contact cards, attendance records, financial balances, and single-click PDF & CSV report exports.
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Approved:</span>
              <span className="text-xs font-black text-indigo-300">{totalStudents} Students</span>
            </div>
            <Link
              to="/admin/student-overview"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 active:scale-95"
            >
              <span>Open Overview</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Student Fee Tracker Card */}
        <div className="relative group overflow-hidden rounded-[32px] p-7 bg-gradient-to-br from-emerald-950/40 via-white/[0.03] to-teal-950/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 shadow-xl shadow-emerald-950/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CreditCard size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
              <IndianRupee size={11} /> Active Ledger
            </span>
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-200 transition-colors">
            Student Fee Tracker
          </h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            Detailed fee manager to assign monthly dues, record partial or full fee collections, edit payment dates, inspect overdue balances, and print receipts.
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Total Dues:</span>
              <span className="text-xs font-black text-emerald-300">₹{totalAssignedDues} ({totalDueRecords} records)</span>
            </div>
            <Link
              to="/admin/student-fee-tracker"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30 active:scale-95"
            >
              <span>Open Fee Tracker</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={totalStudents} icon={Users} color="blue" />
        <StatCard label="Pending Admissions" value={pendingAdmissions} icon={FileCheck} color="amber" />
        <StatCard label="Fees Collected" value={`₹${totalFees}`} icon={CreditCard} color="emerald" />
        <StatCard label="Net Balance" value={`₹${netBalance}`} icon={DollarSign} color="indigo" subValue={netBalance < 0 ? 'Negative' : 'Profit'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-10 rounded-[40px]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Financial Stream</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Income</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="amount" radius={[12, 12, 0, 0]} barSize={80}>
                   {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="glass p-10 rounded-[40px] flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
              <Calendar size={32} className="text-indigo-400" />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Today's Attendance</h3>
            <div className="text-5xl font-black text-white mb-6 leading-none">
              {attendancePercent}%
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-4 border border-white/10">
              <div className="bg-indigo-500 h-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${attendancePercent}%` }}></div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Institutional Average</p>
          </div>
        </div>
      </div>
    </div>
  );
}
