import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Student } from '../../../types';
import { CreditCard, CheckCircle2, History, TrendingUp, DollarSign } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function StudentFees({ student }: { student: Student }) {
  const { fees } = useStorage();
  const myFees = fees.filter(f => f.studentId === student.id);
  const totalPaid = myFees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-12">
      <div className="space-y-2">
         <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Fees Status</p>
         <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Fees Status <span className="text-slate-700">/</span> {student.name.split(' ')[0]}</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass p-12 rounded-[50px] bg-gradient-to-br from-emerald-600/20 via-transparent to-transparent relative overflow-hidden group border-emerald-500/20">
          <div className="relative z-10 font-black">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500/60 mb-4 flex items-center gap-2">
              <TrendingUp size={12} /> Total Fees Payment
            </p>
            <h2 className="text-4xl text-white tracking-tighter mb-8">₹{totalPaid.toLocaleString()}</h2>
            <div className="flex items-center gap-3 px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit border border-emerald-500/20 text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-950/20">
              <CheckCircle2 size={16} /> Status: Clear
            </div>
          </div>
        </div>
        
        <div className="glass p-10 rounded-[50px] flex flex-col justify-center gap-8 border-white/5">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform">
                 <CreditCard size={32} className="text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Notice</p>
                <h4 className="text-xl font-black text-white tracking-tight leading-none uppercase">Pay fees on time</h4>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Payment Reliability</p>
                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">100% SECURE</p>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
              </div>
           </div>
        </div>

        <div className="glass p-10 rounded-[50px] border-white/5 flex flex-col justify-between group hidden lg:flex">
           <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit border border-indigo-500/10 transition-transform group-hover:rotate-12">
             <History size={24} />
           </div>
           <div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight">Remarks</h4>
              <p className="text-xs font-bold text-slate-500 mt-2">All transactions are digitally signed and verified by BTH central processing.</p>
           </div>
        </div>
      </div>

      <div className="glass rounded-[50px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-slate-500 text-xs font-black uppercase tracking-widest border-b border-white/5">
                <th className="px-10 py-6">Months</th>
                <th className="px-10 py-6">Payment Date</th>
                <th className="px-10 py-6 text-right">Amount</th>
                <th className="px-10 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myFees.slice().reverse().map(f => (
                <tr key={f.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-10 py-8">
                     <p className="text-lg font-black text-white uppercase tracking-tight">{f.month}</p>
                     {/* Removed Instalment text */}
                  </td>
                  <td className="px-10 py-8">
                     <p className="text-sm font-bold text-slate-400">{safeFormat(f.date, 'dd MMMM yyyy')}</p>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-2xl text-white tracking-tighter">₹{f.amount}</td>
                  <td className="px-10 py-8 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
              {myFees.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CreditCard size={32} className="text-slate-800" />
                    </div>
                    <p className="text-slate-600 text-xs font-black uppercase tracking-widest">No historical ledger entries found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
