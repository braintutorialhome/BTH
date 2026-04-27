import React from 'react';
import { motion } from 'motion/react';
import { useStorage } from '../../../hooks/useStorage';
import { 
  Users, FileCheck, CreditCard, Calendar, TrendingUp, DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
    students, expenses, fees, attendance
  } = useStorage();

  const totalStudents = students.filter(s => s.status === 'approved').length;
  const pendingAdmissions = students.filter(s => s.status === 'pending').length;
  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalFees - totalExpenses;

  const today = new Date().toISOString().split('T')[0];
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Overview <span className="text-indigo-500">Center</span></h2>
      </div>


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

        <div className="flex flex-col gap-8">
          <div className="glass p-10 rounded-[40px] flex flex-col items-center text-center">
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

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 scale-150 group-hover:scale-[1.7] transition-transform">
               <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-white font-black uppercase tracking-tight text-xl mb-8">Performance Summary</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-indigo-100/60 text-xs font-bold uppercase">Profit Margin</span>
                  <span className="text-xl font-black text-white">{(netBalance / (totalFees || 1) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100/60 text-xs font-bold uppercase">Active Tests</span>
                  <span className="text-xl font-black text-white">03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
