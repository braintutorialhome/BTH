import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { Wallet, Plus, Trash2, Calendar, X } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function ExpenseManagement() {
  const { expenses, addExpense, deleteExpense } = useStorage();
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Others',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const categories = ['Electricity', 'Rent', 'Salary', 'Others'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    
    addExpense({
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category as any,
      date: newExpense.date,
      description: newExpense.description
    });
    
    setShowAdd(false);
    setNewExpense({ title: '', amount: '', category: 'Others', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;

    const expenseDate = new Date(e.date);
    const matchesMonth = monthFilter === 'all' || 
      `${expenseDate.getFullYear()}-${(expenseDate.getMonth() + 1).toString().padStart(2, '0')}` === monthFilter;

    return matchesSearch && matchesCategory && matchesMonth;
  });

  return (
    <div className="space-y-10 max-w-5xl">
       <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
             <Wallet size={24} />
           </div>
           <div>
             <h3 className="font-black text-xl text-white tracking-tight">Financial Outflow</h3>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Track institutional expenses</p>
           </div>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white rounded-2xl px-8 py-3.5 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
        >
          Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Search Expenses</label>
          <input
            type="text"
            placeholder="Search by title or info..."
            className="input-glass w-full py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
          <select
            className="input-glass w-full py-3"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all" className="bg-slate-900">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Filter by Month</label>
          <input
            type="month"
            className="input-glass w-full py-3"
            value={monthFilter === 'all' ? '' : monthFilter}
            onChange={(e) => setMonthFilter(e.target.value || 'all')}
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setMonthFilter('all');
            }}
            className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors mb-4 ml-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="glass rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-10 bg-rose-600 text-white flex justify-between items-center shadow-lg">
              <h2 className="text-2xl font-black tracking-tight uppercase">New Expense</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Expense Title</label>
                <input 
                  required
                  type="text" 
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  className="input-glass w-full py-4 rounded-2xl"
                  placeholder="e.g. Server Bill, Office Rent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Amount (₹)</label>
                  <input 
                    required
                    type="number" 
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="input-glass w-full py-4 rounded-2xl"
                    placeholder="2500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                  <select 
                    required
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="input-glass w-full py-4 rounded-2xl appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label>
                <input 
                  required
                  type="date" 
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="input-glass w-full py-4 rounded-2xl"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all"
              >
                Record Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History */}
      <div className="grid gap-6">
        {filteredExpenses.slice().reverse().map(e => (
          <div key={e.id} className="glass p-8 rounded-[40px] flex items-center justify-between group hover:bg-white/10 transition-all border border-white/5">
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-3xl flex items-center justify-center font-black border border-rose-500/20 group-hover:scale-110 transition-transform">
                <TrendingDown size={32} />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-black text-2xl tracking-tighter text-white">{e.title}</h3>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 bg-white/5 text-slate-400 rounded-lg border border-white/10">
                    {e.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                  <span className="flex items-center gap-2 italic"><Calendar size={12} className="text-indigo-500" /> {safeFormat(e.date, 'dd MMMM yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-4xl font-black text-rose-400 tracking-tighter">₹{e.amount}</span>
              <button 
                onClick={() => deleteExpense(e.id)}
                className="p-4 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-500/20"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <div className="py-24 text-center glass rounded-[60px] border-2 border-dashed border-white/5">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <Wallet size={32} className="text-slate-700" />
             </div>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Expense records are currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const TrendingDown = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 17-8.5-8.5L9 13l-7-7"/><path d="M16 17h6v-6"/></svg>
);
