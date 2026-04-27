import React from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function AccountManagement() {
  const { fees, expenses } = useStorage();

  const totalIncome = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-12 pb-20">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-10 rounded-[40px] bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20">
            <TrendingUp size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Collections</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">₹{totalIncome}</h3>
        </div>

        <div className="glass p-10 rounded-[40px] bg-gradient-to-br from-rose-500/10 to-transparent">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
            <TrendingDown size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Total Expenses</p>
          <h3 className="text-4xl font-black text-rose-400 tracking-tighter">₹{totalExpenses}</h3>
        </div>

        <div className={`glass p-10 rounded-[40px] bg-gradient-to-br ${balance >= 0 ? 'from-indigo-500/20' : 'from-rose-500/20'} to-transparent relative overflow-hidden`}>
          <div className={`w-14 h-14 ${balance >= 0 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} rounded-3xl flex items-center justify-center mb-6 border`}>
            <DollarSign size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Net Cash Balance</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">₹{balance}</h3>
          <div className="absolute top-0 right-0 p-4">
             <div className={`w-2 h-2 rounded-full ${balance >= 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-bounce'}`}></div>
          </div>
        </div>
      </div>

      {/* Finance Logs */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[40px]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <CreditCard size={16} className="text-emerald-400" /> Revenue Stream
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {fees.slice().reverse().map((f, i) => (
              <div key={`${f.id}-${i}`} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                <div>
                  <p className="text-xs font-black text-white">{f.month}</p>
                  <p className="text-[9px] font-bold text-slate-500">Recieved on {safeFormat(f.date, 'dd MMM yyyy')}</p>
                </div>
                <p className="text-lg font-black text-emerald-400">+₹{f.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-[40px]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <Wallet size={16} className="text-rose-400" /> Spending Logs
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
            {expenses.slice().reverse().map((e, i) => (
              <div key={`${e.id}-${i}`} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                <div>
                  <p className="text-xs font-black text-white">{e.title}</p>
                  <p className="text-[9px] font-bold text-slate-500">{e.category} • {safeFormat(e.date, 'dd MMM yyyy')}</p>
                </div>
                <p className="text-lg font-black text-rose-400">-₹{e.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .custom-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}


