import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, Fee, DueFee } from '../types';
import { safeFormat, formatClassName } from '../lib/utils';
import { exportPdfDocument } from './mobileExportHelper';

export async function exportStudentToPdf(
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
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let currentY = 10;

  // Header Background bar (Compact: 18mm height)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 2.5, 2.5, 'F');

  // Institution Title & Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('BRAIN TUTORIAL HOME (BTH)', margin + 5, currentY + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('OFFICIAL STUDENT COMPREHENSIVE RECORD & FEE DOSSIER', margin + 5, currentY + 13.5);

  // Date on right
  const dateStr = safeFormat(new Date(), 'dd MMM yyyy, hh:mm a') + ' IST';
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 5, currentY + 7, { align: 'right' });
  doc.text(`Status: ${student.status.toUpperCase()}`, pageWidth - margin - 5, currentY + 13.5, { align: 'right' });

  currentY += 23;

  // Section 1: Student Information
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. STUDENT PROFILE & ACADEMIC INFORMATION', margin, currentY);

  currentY += 2.5;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 3;

  // Student Info Grid Box (44mm height, 7 rows with 9pt text)
  const boxHeight = 44;
  const rowSpacing = 5.4;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, boxHeight, 1.5, 1.5, 'FD');

  const col1X = margin + 4.5;
  const col2X = margin + (pageWidth - margin * 2) / 2 + 4.5;
  let infoY = currentY + 5.5;

  // Helper for label/value
  const drawField = (x: number, y: number, label: string, value: any) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(String(label) + ':', x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42); // slate-900
    const labelWidth = doc.getTextWidth(String(label) + ': ');
    const safeVal = value != null && String(value).trim() !== '' ? String(value) : '—';
    doc.text(safeVal, x + labelWidth + 1.2, y);
  };

  // Row 1
  drawField(col1X, infoY, 'Full Name', student.name);
  drawField(col2X, infoY, "Father's Name", student.fatherName || 'N/A');

  // Row 2
  infoY += rowSpacing;
  drawField(col1X, infoY, 'Roll Number', student.rollNumber || 'N/A');
  drawField(col2X, infoY, 'System ID', student.id);

  // Row 3
  infoY += rowSpacing;
  drawField(col1X, infoY, 'Class', formatClassName(student.class));
  drawField(col2X, infoY, 'Session', student.semester || 'N/A');

  // Row 4
  infoY += rowSpacing;
  drawField(col1X, infoY, 'Subject(s)', student.subject || 'All Subjects');
  drawField(col2X, infoY, 'Admission / Joining', student.dateOfJoining || student.admissionDate || 'N/A');

  // Row 5
  infoY += rowSpacing;
  drawField(col1X, infoY, 'Mobile', student.mobile || 'N/A');
  drawField(col2X, infoY, 'WhatsApp', student.whatsapp || 'N/A');

  // Row 6
  infoY += rowSpacing;
  drawField(col1X, infoY, 'Gender', student.gender || 'N/A');
  drawField(col2X, infoY, 'Date of Birth', student.dob || 'N/A');

  // Row 7
  infoY += rowSpacing;
  drawField(col1X, infoY, 'Address', student.address ? (student.address.length > 50 ? student.address.substring(0, 50) + '...' : student.address) : 'N/A');

  // Advance past the info box to Section 2
  currentY += boxHeight + 4.5;

  // Section 2: Fee Overview
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. FEE SUMMARY OVERVIEW', margin, currentY);

  currentY += 2.5;
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 3;

  // Two summary cards side by side (Spacious 19mm height with larger text)
  const cardWidth = (pageWidth - margin * 2 - 5) / 2;

  // Card 1: Paid Fees
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(margin, currentY, cardWidth, 19, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text('TOTAL CURRENT FEES PAID', margin + 4.5, currentY + 5.2);

  doc.setFontSize(13);
  doc.text(`INR ${feeStats.totalPaid.toLocaleString('en-IN')}`, margin + 4.5, currentY + 11.8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(21, 128, 61);
  doc.text(`(${feeStats.paymentCount} successful payment transactions recorded)`, margin + 4.5, currentY + 16.5);

  // Card 2: Assigned Dues
  const card2X = margin + cardWidth + 5;
  doc.setFillColor(254, 242, 242); // rose-50 / soft red tint
  doc.setDrawColor(254, 202, 202); // rose-200
  doc.roundedRect(card2X, currentY, cardWidth, 19, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38); // red-600 for TOTAL DUES ASSIGNED
  doc.text('TOTAL DUES ASSIGNED', card2X + 4.5, currentY + 5.2);

  doc.setFontSize(13);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text(`INR ${feeStats.totalDueAssigned.toLocaleString('en-IN')}`, card2X + 4.5, currentY + 11.8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(185, 28, 28); // red-700
  doc.text(`(${feeStats.dueCount} invoice records created)`, card2X + 4.5, currentY + 16.5);

  currentY += 23.5;

  // Scale table padding and font size according to record count to guarantee one-page fit (default 11pt header, 10.5pt body)
  const totalRowsCount = (payments.length || 1) + (dues.length || 1);
  const cellPadding = totalRowsCount > 10 ? 2.2 : 2.8;
  const tableHeaderFontSize = totalRowsCount > 10 ? 10 : 11;
  const tableBodyFontSize = totalRowsCount > 10 ? 9.5 : 10.5;

  // Section 3: Fee Payment Records Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. CURRENT FEES HISTORY (PAYMENTS RECEIVED)', margin, currentY);

  currentY += 2.5;

  const paymentRows = payments.length > 0 
    ? payments.map((p, idx) => [
        (idx + 1).toString(),
        safeFormat(p.date, 'dd/MM/yyyy'),
        p.month || 'N/A',
        p.paymentMethod || 'Cash',
        p.notes || '—',
        `INR ${Number(p.amount).toLocaleString('en-IN')}`
      ])
    : [['—', 'No payments recorded', '—', '—', '—', 'INR 0']];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    pageBreak: 'avoid',
    head: [['#', 'Date', 'Month', 'Method', 'Notes / Remarks', 'Amount Paid']],
    body: paymentRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: tableHeaderFontSize,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: cellPadding
    },
    styles: {
      fontSize: tableBodyFontSize,
      cellPadding: cellPadding,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.25
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 27 },
      2: { cellWidth: 27 },
      3: { cellWidth: 27 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 36, halign: 'right', fontStyle: 'bold', textColor: [22, 101, 52] }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Section 4: Assigned Due Fees Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. ASSIGNED DUE FEES (DUES INVOICED)', margin, currentY);

  currentY += 2.5;

  const dueRows = dues.length > 0
    ? dues.map((d, idx) => [
        (idx + 1).toString(),
        safeFormat(d.date, 'dd/MM/yyyy'),
        d.remarks || 'Standard Dues',
        `INR ${Number(d.amount).toLocaleString('en-IN')}`
      ])
    : [['—', 'No dues recorded', '—', 'INR 0']];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    pageBreak: 'avoid',
    head: [['#', 'Date Assigned', 'Due Purpose / Remarks', 'Due Amount']],
    body: dueRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: tableHeaderFontSize,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: cellPadding
    },
    styles: {
      fontSize: tableBodyFontSize,
      cellPadding: cellPadding,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.25
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 38 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 38, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
    }
  });

  // Guarantee exactly one page: remove any accidental page spills
  while ((doc.internal as any).getNumberOfPages() > 1) {
    doc.deletePage(2);
  }

  // Position footer with 2 line spaces (~11mm) above the signatory text
  const finalTableY = (doc as any).lastAutoTable.finalY;
  const footerY = Math.min(finalTableY + 11, pageHeight - margin - 10);

  // Authorized Signatory & Official Note
  doc.setLineWidth(0.3);
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 55, footerY + 5, pageWidth - margin, footerY + 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Computer-generated student record • Brain Tutorial Home', margin, footerY + 10);

  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory / Administrator', pageWidth - margin, footerY + 10, { align: 'right' });

  // Trigger download with mobile APK & Web support
  const sanitizedStudentName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Student_${sanitizedStudentName}_${student.rollNumber || student.id}.pdf`;
  await exportPdfDocument(doc, filename);
}
