import { Student, Fee, DueFee } from '../types';
import { safeFormat, formatClassName } from '../lib/utils';
import { exportCsvData } from './mobileExportHelper';

/**
 * Exports comprehensive student dossier & financial records to a CSV file.
 * Compatible with Android WebView APK, Mobile browsers, and Desktop spreadsheets (Excel/Sheets).
 */
export async function exportStudentToCsv(
  student: Student,
  feeStats: {
    totalPaid: number;
    totalDueAssigned: number;
    remainingBalance: number;
    paymentCount: number;
    dueCount: number;
  },
  payments: Fee[],
  dues: DueFee[]
): Promise<void> {
  const sanitize = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const lines: string[] = [];

  // Header
  lines.push(`"BRAIN TUTORIAL HOME (BTH) - STUDENT COMPREHENSIVE DOSSIER"`);
  lines.push(`"Generated On",${sanitize(safeFormat(new Date(), 'dd MMM yyyy, hh:mm a'))}`);
  lines.push('');

  // Section 1: Student Profile Information
  lines.push(`"=== 1. STUDENT PROFILE & ACADEMIC INFORMATION ==="`);
  lines.push(`"Full Name",${sanitize(student.name)}`);
  lines.push(`"Roll Number",${sanitize(student.rollNumber || 'N/A')}`);
  lines.push(`"Class",${sanitize(formatClassName(student.class))}`);
  lines.push(`"Academic Session",${sanitize(student.semester || 'N/A')}`);
  lines.push(`"Registered Subject(s)",${sanitize(student.subject || 'All Subjects')}`);
  lines.push(`"Enrollment Status",${sanitize(student.status ? student.status.toUpperCase() : 'APPROVED')}`);
  lines.push(`"Father / Guardian Name",${sanitize(student.fatherName || 'N/A')}`);
  lines.push(`"Mobile Number",${sanitize(student.mobile || 'N/A')}`);
  lines.push(`"WhatsApp Number",${sanitize(student.whatsapp || 'N/A')}`);
  lines.push(`"Gender",${sanitize(student.gender || 'N/A')}`);
  lines.push(`"Date of Birth",${sanitize(student.dob || 'N/A')}`);
  lines.push(`"Date of Joining",${sanitize(student.dateOfJoining || student.admissionDate || 'N/A')}`);
  lines.push(`"Residential Address",${sanitize(student.address || 'N/A')}`);
  lines.push('');

  // Section 2: Financial Summary
  lines.push(`"=== 2. FINANCIAL SUMMARY (INR) ==="`);
  lines.push(`"Metric","Amount (INR)","Status / Notes"`);
  lines.push(`"Total Fees Paid",${feeStats.totalPaid},${sanitize(`${feeStats.paymentCount} payments recorded`)}`);
  lines.push(`"Total Dues Assigned",${feeStats.totalDueAssigned},${sanitize(`${feeStats.dueCount} invoices generated`)}`);
  lines.push(`"Remaining Balance",${feeStats.remainingBalance},${sanitize(feeStats.remainingBalance <= 0 ? 'Dues Cleared' : 'Pending Payment')}`);
  lines.push('');

  // Section 3: Fee Payment Receipts History
  lines.push(`"=== 3. PAYMENT RECEIPTS HISTORY ==="`);
  lines.push(`"Date","Billing Month","Payment Mode","Remarks / Notes","Amount Paid (INR)"`);
  if (payments.length === 0) {
    lines.push(`"No payments recorded","N/A","N/A","N/A",0`);
  } else {
    payments.forEach(p => {
      lines.push([
        sanitize(safeFormat(p.date, 'dd MMM yyyy')),
        sanitize(p.month || 'N/A'),
        sanitize(p.paymentMethod || 'Cash'),
        sanitize(p.notes || '—'),
        p.amount || 0
      ].join(','));
    });
  }
  lines.push('');

  // Section 4: Assigned Due Invoices
  lines.push(`"=== 4. ASSIGNED DUE INVOICES ==="`);
  lines.push(`"Date Assigned","Due Purpose / Remarks","Invoiced Amount (INR)"`);
  if (dues.length === 0) {
    lines.push(`"No dues pending","N/A",0`);
  } else {
    dues.forEach(d => {
      lines.push([
        sanitize(safeFormat(d.date, 'dd MMM yyyy')),
        sanitize(d.remarks || 'Standard Dues'),
        d.amount || 0
      ].join(','));
    });
  }

  const csvContent = lines.join('\n');
  const filename = `BTH_Student_${student.rollNumber || 'Roll'}_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

  await exportCsvData(csvContent, filename);
}
