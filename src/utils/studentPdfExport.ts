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
  const margin = 15;
  let currentY = 16;

  // Header Background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 3, 3, 'F');

  // Institution Title & Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BRAIN TUTORIAL HOME (BTH)', margin + 6, currentY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('OFFICIAL STUDENT COMPREHENSIVE RECORD & FEE DOSSIER', margin + 6, currentY + 16);

  // Date on right
  const dateStr = safeFormat(new Date(), 'dd MMM yyyy, hh:mm a');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 6, currentY + 10, { align: 'right' });
  doc.text(`Status: ${student.status.toUpperCase()}`, pageWidth - margin - 6, currentY + 16, { align: 'right' });

  currentY += 30;

  // Section: Student Information
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. STUDENT PROFILE & ACADEMIC INFORMATION', margin, currentY);

  currentY += 4;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 6;

  // Student Info Grid Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 48, 2, 2, 'FD');

  const col1X = margin + 5;
  const col2X = margin + (pageWidth - margin * 2) / 2 + 5;
  let infoY = currentY + 7;
  const rowSpacing = 6.8;

  // Helper for label/value
  const drawField = (x: number, y: number, label: string, value: any) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(String(label) + ':', x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42); // slate-900
    const labelWidth = doc.getTextWidth(String(label) + ': ');
    const safeVal = value != null ? String(value) : 'N/A';
    doc.text(safeVal, x + labelWidth + 1, y);
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
  drawField(col1X, infoY, 'Address', student.address ? (student.address.length > 60 ? student.address.substring(0, 60) + '...' : student.address) : 'N/A');

  currentY += 66;

  // Section: Fee Overview
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. FEE SUMMARY OVERVIEW', margin, currentY);

  currentY += 4;
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 6;

  // Two summary cards side by side
  const cardWidth = (pageWidth - margin * 2 - 6) / 2;

  // Card 1: Paid Fees
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(margin, currentY, cardWidth, 20, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text('TOTAL CURRENT FEES PAID', margin + 5, currentY + 6);

  doc.setFontSize(13);
  doc.text(`INR ${feeStats.totalPaid.toLocaleString('en-IN')}`, margin + 5, currentY + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(21, 128, 61);
  doc.text(`(${feeStats.paymentCount} successful payment transactions recorded)`, margin + 5, currentY + 18);

  // Card 2: Assigned Dues
  const card2X = margin + cardWidth + 6;
  doc.setFillColor(240, 249, 255); // sky-50
  doc.setDrawColor(186, 230, 253); // sky-200
  doc.roundedRect(card2X, currentY, cardWidth, 20, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(7, 89, 133); // sky-800
  doc.text('TOTAL DUES ASSIGNED', card2X + 5, currentY + 6);

  doc.setFontSize(13);
  doc.text(`INR ${feeStats.totalDueAssigned.toLocaleString('en-IN')}`, card2X + 5, currentY + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(14, 116, 144);
  doc.text(`(${feeStats.dueCount} invoice records created)`, card2X + 5, currentY + 18);

  currentY += 28;

  // Section 3: Fee Payment Records Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. CURRENT FEES HISTORY (PAYMENTS RECEIVED)', margin, currentY);

  currentY += 3;

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
    head: [['#', 'Date', 'Month', 'Method', 'Notes / Remarks', 'Amount Paid']],
    body: paymentRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: [22, 101, 52] }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page for Dues Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // Section 4: Assigned Due Fees Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. ASSIGNED DUE FEES (DUES INVOICED)', margin, currentY);

  currentY += 3;

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
    head: [['#', 'Date Assigned', 'Due Purpose / Remarks', 'Due Amount']],
    body: dueRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [3, 105, 161] }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // Check footer space
  let footerY = finalY;
  if (footerY > 260) {
    doc.addPage();
    footerY = 240;
  }

  // Authorized Signatory & Official Note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Computer-generated student record • Brain Tutorial Home', margin, footerY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory / Administrator', pageWidth - margin, footerY + 8, { align: 'right' });
  doc.setLineWidth(0.3);
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 55, footerY + 4, pageWidth - margin, footerY + 4);

  // Trigger download with mobile APK & Web support
  const sanitizedStudentName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Student_${sanitizedStudentName}_${student.rollNumber || student.id}.pdf`;
  await exportPdfDocument(doc, filename);
}
