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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Due Fees Management</h2>
          <p className="text-gray-500">Track and manage student pending payments</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
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
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Due Record' : 'Record New Due'}
              </h3>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ studentId: '', amount: '', remarks: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or roll no..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-100 rounded-lg bg-gray-50">
                  {filteredStudentsForAdding.length > 0 ? (
                    filteredStudentsForAdding.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, studentId: student.id });
                          setSearchTerm(student.name);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors text-sm ${
                          formData.studentId === student.id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {student.name} ({student.rollNumber})
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 italic text-center">
                      No approved students found
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    required
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Remarks / Purpose</label>
                <textarea
                  required
                  rows={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="e.g. Monthly fee for May"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={!formData.studentId}
                  className="w-full md:w-auto px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingId ? 'Update Due Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Search Records</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, roll or remarks..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={listSearchTerm}
              onChange={(e) => setListSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Filter by Class</label>
          <select
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Filter by Month</label>
          <input
            type="month"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={monthFilter === 'all' ? '' : monthFilter}
            onChange={(e) => setMonthFilter(e.target.value || 'all')}
          />
        </div>

        <button
          onClick={() => {
            setListSearchTerm('');
            setClassFilter('all');
            setMonthFilter('all');
          }}
          className="px-4 py-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDueFees.length > 0 ? (
                filteredDueFees.map((fee) => {
                  const student = students.find(s => s.id === fee.studentId);
                  return (
                    <motion.tr 
                      key={fee.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{student?.name || 'Unknown Student'}</span>
                          <span className="text-xs text-gray-500">{student?.rollNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-orange-600">
                         ₹{fee.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{fee.remarks}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(fee.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          {confirmDeleteId === fee.id ? (
                            <div className="flex items-center bg-red-50 p-1 rounded-lg border border-red-100 animate-pulse">
                              <button 
                                onClick={() => {
                                  deleteDueFee(fee.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors uppercase tracking-tighter"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] font-bold text-gray-500 px-2 py-1 hover:text-gray-700 uppercase tracking-tighter"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleEdit(fee)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConfirmDeleteId(fee.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-100 mb-4" />
                      <p className="text-gray-500 font-medium">No pending due fees found</p>
                      <p className="text-sm text-gray-400">All students are up to date with their payments</p>
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
