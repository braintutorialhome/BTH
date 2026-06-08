import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Search, Plus, Trash2, Edit2, CheckCircle, AlertCircle, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminDueFees: React.FC = () => {
  const { students, dueFees, addDueFee, updateDueFee, deleteDueFee } = useStorage();
  const [searchTerm, setSearchTerm] = useState(''); // Search during adding
  const [listSearchTerm, setListSearchTerm] = useState(''); // Search in list
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    remarks: ''
  });

  const filteredStudentsForAdding = students.filter(s => 
    s.status === 'approved' &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const classes = Array.from(new Set(students.map(s => s.class))).filter(Boolean).sort();

  const filteredDueFees = dueFees.filter(fee => {
    const student = students.find(s => s.id === fee.studentId);
    if (!student) return false;

    const matchesSearch = 
      student.name.toLowerCase().includes(listSearchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(listSearchTerm.toLowerCase()) ||
      fee.remarks.toLowerCase().includes(listSearchTerm.toLowerCase());

    const matchesClass = classFilter === 'all' || student.class === classFilter;

    const feeDate = new Date(fee.date);
    const matchesMonth = monthFilter === 'all' || 
      `${feeDate.getFullYear()}-${(feeDate.getMonth() + 1).toString().padStart(2, '0')}` === monthFilter;

    return matchesSearch && matchesClass && matchesMonth;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) return;

    if (editingId) {
      updateDueFee({
        id: editingId,
        studentId: formData.studentId,
        amount: Number(formData.amount),
        remarks: formData.remarks,
        date: new Date().toISOString()
      });
      setEditingId(null);
    } else {
      addDueFee({
        studentId: formData.studentId,
        amount: Number(formData.amount),
        remarks: formData.remarks
      });
    }

    setFormData({ studentId: '', amount: '', remarks: '' });
    setIsAdding(false);
  };

  const handleEdit = (fee: any) => {
    setFormData({
      studentId: fee.studentId,
      amount: fee.amount.toString(),
      remarks: fee.remarks
    });
    setEditingId(fee.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <IndianRupee size={24} />
          </div>
          <div>
            <h3 className="font-black text-xl text-white tracking-tight">Due Fees Management</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Track and manage student pending payments</p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="indigo-button px-8 py-3.5 text-xs font-black uppercase tracking-widest"
          >
            Add New Due
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/5 p-8 rounded-[32px] space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white tracking-tight uppercase">
                {editingId ? 'Edit Due Record' : 'Record New Due'}
              </h3>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ studentId: '', amount: '', remarks: '' });
                }}
                className="text-xs font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search name or roll no..."
                    className="input-glass w-full pl-10 py-3 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto border border-white/5 rounded-2xl bg-slate-950/40 divide-y divide-white/5">
                  {filteredStudentsForAdding.length > 0 ? (
                    filteredStudentsForAdding.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, studentId: student.id });
                          setSearchTerm(student.name);
                        }}
                        className={`w-full text-left px-5 py-3 transition-colors text-sm font-bold block ${
                          formData.studentId === student.id ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {student.name} ({student.rollNumber || 'No Roll'})
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                      No approved students found
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  className="input-glass w-full py-3"
                  placeholder="e.g. 1500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Remarks / Purpose</label>
                <textarea
                  required
                  rows={1}
                  className="input-glass w-full py-3 resize-none"
                  placeholder="e.g. Monthly fee for May"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!formData.studentId}
                  className="indigo-button px-8 py-3.5 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? 'Update Due Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/5 p-8 rounded-[32px] border border-white/5">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Search Records</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, roll or remarks..."
              className="input-glass w-full pl-10 py-3"
              value={listSearchTerm}
              onChange={(e) => setListSearchTerm(e.target.value)}
            />
          </div>
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
              setListSearchTerm('');
              setClassFilter('all');
              setMonthFilter('all');
            }}
            className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors mb-4 ml-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="glass rounded-[40px] overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white tracking-tight uppercase">Collection Stream</h3>
          <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-400/20">{filteredDueFees.length} Results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 text-xs uppercase font-black tracking-wider">
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Purpose</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredDueFees.length > 0 ? (
                filteredDueFees.map((fee) => {
                  const student = students.find(s => s.id === fee.studentId);
                  return (
                    <motion.tr 
                      key={fee.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{student?.name || 'Unknown Student'}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Roll: {student?.rollNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-black text-rose-400">
                         ₹{fee.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-slate-300 font-medium">{fee.remarks}</span>
                      </td>
                      <td className="px-8 py-5 text-slate-400">
                        {new Date(fee.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          {confirmDeleteId === fee.id ? (
                            <div className="flex items-center bg-rose-500/10 p-1.5 rounded-xl border border-rose-500/20">
                              <button 
                                onClick={() => {
                                  deleteDueFee(fee.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[10px] font-black bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg transition-colors uppercase tracking-widest"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] font-black text-slate-400 hover:text-white px-3 py-1.5 transition-colors uppercase tracking-widest"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleEdit(fee)}
                                className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-white/5 rounded-xl transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConfirmDeleteId(fee.id);
                                }}
                                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-teal-400/80 mb-4" />
                      <p className="text-white font-black uppercase tracking-wider text-sm">No pending due fees found</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">All students are up to date with their payments</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDueFees;
