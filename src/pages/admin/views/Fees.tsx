import React, { useState } from 'react';
import { useStorage } from '../../../hooks/useStorage';
import { CreditCard, Plus, X, Trash2 } from 'lucide-react';
import { safeFormat } from '../../../lib/utils';

export default function FeeManagement() {
  const { students, fees, addFee, deleteFee } = useStorage();
  const [showAdd, setShowAdd] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  const [newFee, setNewFee] = useState({
    studentId: '',
    amount: '',
    month: safeFormat(new Date(), 'MMMM yyyy'),
    date: new Date().toISOString().split('T')[0]
  });

  const [studentSearch, setStudentSearch] = useState('');

  const approved = students.filter(s => 
    s.status === 'approved' && (
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.rollNumber?.toLowerCase() || '').includes(studentSearch.toLowerCase())
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFee.studentId || !newFee.amount) return;
    
    addFee({
      studentId: newFee.studentId,
      amount: parseFloat(newFee.amount),
      month: newFee.month,
      date: newFee.date,
      status: 'paid'
    });
    
    setShowAdd(false);
    setDropdownOpen(false);
    setNewFee({ studentId: '', amount: '', month: safeFormat(new Date(), 'MMMM yyyy'), date: new Date().toISOString().split('T')[0] });
    setStudentSearch('');
  };

  const classes = Array.from(new Set(students.map(s => s.class))).filter(Boolean).sort();

  const filteredFees = fees.filter(f => {
    const student = students.find(s => s.id === f.studentId);
    if (!student) return false;

    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.rollNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'all' || student.class === classFilter;

    const feeDate = new Date(f.date);
    const matchesMonth = monthFilter === 'all' || 
      `${feeDate.getFullYear()}-${(feeDate.getMonth() + 1).toString().padStart(2, '0')}` === monthFilter;

    return matchesSearch && matchesClass && matchesMonth;
  });

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
             <CreditCard size={24} />
           </div>
           <div>
             <h3 className="font-black text-xl text-white tracking-tight">Fee Collections</h3>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Manage and track revenues</p>
           </div>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="indigo-button px-8 py-3.5 text-xs font-black uppercase tracking-widest"
        >
          Collect Fee
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Search Students</label>
          <input
            type="text"
            placeholder="Name or Roll Number..."
            className="input-glass w-full py-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Filter by Class</label>
          <select
            className="input-glass w-full py-3"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all" className="bg-slate-900">All Classes</option>
            {classes.map(c => (
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
              setClassFilter('all');
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
            <div className="p-10 bg-indigo-600 text-white flex justify-between items-center shadow-lg">
              <h2 className="text-2xl font-black tracking-tight uppercase">Collect Fee</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Search & Select Student</label>
                <div className="relative">
                  <div 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="input-glass w-full py-4 px-6 rounded-2xl flex items-center justify-between cursor-pointer group hover:border-indigo-500/50 transition-all border border-white/5"
                  >
                    <span className={`text-sm font-bold ${newFee.studentId ? 'text-white' : 'text-slate-500'}`}>
                      {newFee.studentId 
                        ? students.find(s => s.id === newFee.studentId)?.name 
                        : 'Choose Approved Student...'}
                    </span>
                    <Plus className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-45' : ''}`} />
                  </div>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 glass rounded-3xl shadow-2xl border border-white/10 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-white/5">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search name or roll..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setDropdownOpen(false);
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {approved.length > 0 ? (
                          approved.map(s => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setNewFee({...newFee, studentId: s.id});
                                setDropdownOpen(false);
                                setStudentSearch('');
                              }}
                              className="px-6 py-4 hover:bg-indigo-600 cursor-pointer transition-colors group border-b border-white/5 last:border-0"
                            >
                              <p className="font-bold text-white group-hover:text-white">{s.name}</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-200">{s.rollNumber || 'No ROll'}</p>
                                <p className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded group-hover:bg-white/20 group-hover:text-white">{s.class}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No matching students</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Backdrop to close dropdown when clicking outside */}
                {dropdownOpen && (
                  <div 
                    className="fixed inset-0 z-[65]" 
                    onClick={() => setDropdownOpen(false)}
                  />
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Amount (₹)</label>
                  <input 
                    required
                    type="number" 
                    value={newFee.amount}
                    onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                    className="input-glass w-full py-4 rounded-2xl"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Payment Date</label>
                  <input 
                    required
                    type="date" 
                    value={newFee.date}
                    onChange={(e) => setNewFee({...newFee, date: e.target.value})}
                    className="input-glass w-full py-4 rounded-2xl"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Billing Month</label>
                <input 
                  required
                  type="text" 
                  value={newFee.month}
                  onChange={(e) => setNewFee({...newFee, month: e.target.value})}
                  className="input-glass w-full py-4 rounded-2xl"
                  placeholder="e.g. April 2024"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-5 indigo-button text-xs font-black uppercase tracking-widest shadow-2xl"
              >
                Confirm Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Recent Collections Table */}
      <div className="glass rounded-[40px] overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white tracking-tight uppercase">Collection Stream</h3>
          <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/20">{filteredFees.length} Results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-10 py-6">Student ID / Name</th>
                <th className="px-10 py-6">Billing Term</th>
                <th className="px-10 py-6">Paid On</th>
                <th className="px-10 py-6">Value</th>
                <th className="px-10 py-6 text-right">Status</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredFees.slice().reverse().map(f => {
                const student = students.find(s => s.id === f.studentId);
                return (
                  <tr key={f.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-black text-sm border border-orange-500/20 group-hover:scale-110 transition-transform">
                           {student?.name.charAt(0) || '?'}
                         </div>
                         <div>
                           <p className="font-bold text-white tracking-tight">{student?.name || 'Unknown'}</p>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{student?.rollNumber}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 font-bold text-slate-300 tracking-tight">{f.month}</td>
                    <td className="px-10 py-6 font-bold text-slate-400 tracking-tighter">{safeFormat(f.date, 'dd MMM yyyy')}</td>
                    <td className="px-10 py-6 font-black text-emerald-400 text-lg">₹{f.amount}</td>
                    <td className="px-10 py-6 text-right">
                      <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        {f.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this fee record?')) {
                            deleteFee(f.id);
                          }
                        }}
                        className="p-3 text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {fees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for first collection...</p>
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
