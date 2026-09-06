import React from 'react';
import { Student } from '../../../types';
import { useStorage } from '../../../hooks/useStorage';
import { 
  User, Phone, CheckCircle2, 
  FileText, MessageSquare, CreditCard
} from 'lucide-react';
import { safeFormat, formatClassName } from '../../../lib/utils';

export default function StudentOverview({ student }: { student: Student }) {
  const { fees, dueFees } = useStorage();

  // Calculate fees statistics for this student
  const studentPayments = fees.filter(f => f.studentId === student.id && f.status === 'paid');
  const totalPaid = studentPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const studentDues = dueFees.filter(d => d.studentId === student.id);
  const totalDueAssigned = studentDues.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const remainingBalance = totalDueAssigned - totalPaid;

  const feeStats = {
    totalPaid,
    totalDueAssigned,
    remainingBalance,
    paymentCount: studentPayments.length,
    dueCount: studentDues.length
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 selection:bg-cyan-500/30">
      {/* Identity Card */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#020712]/80 border border-white/10 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
            {student.avatarUrl ? (
              <img 
                src={student.avatarUrl} 
                alt={student.name} 
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-3xl object-cover border-2 border-indigo-500/40 shadow-xl shrink-0" 
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-500/40 flex items-center justify-center font-black text-white text-3xl shadow-xl shrink-0">
                {student.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {student.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  student.status === 'approved' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-2">
                <span>{formatClassName(student.class)}</span>
                <span>•</span>
                <span>Session: {student.semester || 'N/A'}</span>
                <span>•</span>
                <span className="text-indigo-300 font-semibold">{student.subject || 'All Subjects'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {student.mobile && (
              <a 
                href={`tel:${student.mobile}`}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Phone size={13} />
                <span>{student.mobile}</span>
              </a>
            )}
            {student.whatsapp && (
              <a 
                href={`https://wa.me/${student.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare size={13} />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                Total Fees Paid
              </p>
              <p className="text-3xl font-black text-emerald-300 mt-2">
                ₹{totalPaid.toLocaleString('en-IN')}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">
              {feeStats.paymentCount} payments recorded
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <FileText size={13} />
                Total Dues Assigned
              </p>
              <p className="text-3xl font-black text-rose-300 mt-2">
                ₹{totalDueAssigned.toLocaleString('en-IN')}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-2">
              {feeStats.dueCount} invoices generated
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Academic & Personal Information */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#020712]/80 border border-white/10 shadow-xl backdrop-blur-md">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <User size={15} className="text-indigo-400" />
          Academic & Personal Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guardian / Father's Name</p>
            <p className="font-bold text-white mt-1 text-sm">{student.fatherName || 'N/A'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Present Class</p>
            <p className="font-bold text-white mt-1 text-sm">{formatClassName(student.class)}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Session</p>
            <p className="font-bold text-white mt-1 text-sm">{student.semester || 'N/A'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Subject(s)</p>
            <p className="font-bold text-white mt-1 text-sm">{student.subject || 'All Subjects'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number</p>
            <p className="font-bold text-cyan-300 mt-1 text-sm font-mono">{student.mobile || 'N/A'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</p>
            <p className="font-bold text-emerald-400 mt-1 text-sm font-mono">{student.whatsapp || 'N/A'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</p>
            <p className="font-bold text-white mt-1 text-sm">{student.gender || 'N/A'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth</p>
            <p className="font-bold text-white mt-1 text-sm">{student.dob || 'N/A'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Joining</p>
            <p className="font-bold text-white mt-1 text-sm">{student.dateOfJoining || student.admissionDate || 'N/A'}</p>
          </div>

          <div className="sm:col-span-2 md:col-span-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Residential Address</p>
            <p className="font-bold text-slate-200 mt-1 text-sm">{student.address || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Current Fees / Payments Received History */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#020712]/80 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <CheckCircle2 size={15} />
            Payment History (Current Fees Received)
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {studentPayments.length} records
          </span>
        </div>

        {studentPayments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <CreditCard size={28} className="mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-400">No payment records found yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Recorded fee receipts will appear here once registered by administration.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/10">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Billing Month</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Notes / Remarks</th>
                    <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {studentPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {safeFormat(payment.date, 'dd MMM yyyy')}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {payment.month || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-medium">
                          {payment.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                        {payment.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-400 font-mono text-sm">
                        ₹{Number(payment.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Due Fees History */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#020712]/80 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
            <FileText size={15} />
            Assigned Due Fees (Invoiced Items)
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {studentDues.length} items
          </span>
        </div>

        {studentDues.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
            <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-xs font-bold text-slate-300">No dues assigned</p>
            <p className="text-[11px] text-slate-500 mt-0.5">There are no outstanding institutional invoices pending for your roll.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/10">
                    <th className="py-3.5 px-4">Date Assigned</th>
                    <th className="py-3.5 px-4">Due Remarks / Purpose</th>
                    <th className="py-3.5 px-4 text-right">Invoiced Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {studentDues.map(due => (
                    <tr key={due.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {safeFormat(due.date, 'dd MMM yyyy')}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {due.remarks || 'Standard Dues'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-400 font-mono text-sm">
                        ₹{Number(due.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
