import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types';
import { safeFormat, formatClassName, getISTToday } from '../lib/utils';
import { exportPdfDocument } from './mobileExportHelper';

export interface StudentOverviewItem {
  student: Student;
  stats: {
    totalPaid: number;
    totalDueAssigned: number;
    remainingBalance: number;
    paymentCount: number;
    dueCount: number;
  };
}

export async function exportStudentOverviewToPdf(
  items: StudentOverviewItem[],
  filterSummary?: {
    classFilter?: string;
    batchFilter?: string;
    statusFilter?: string;
  }
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let currentY = 10;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 2.5, 2.5, 'F');

  // Institution Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BRAIN TUTORIAL HOME (BTH)', margin + 6, currentY + 7.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('OFFICIAL MASTER STUDENT OVERVIEW & FINANCIAL AUDIT REPORT', margin + 6, currentY + 13.5);

  // Date on right
  const dateStr = safeFormat(new Date(), 'dd MMM yyyy, hh:mm a') + ' IST';
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${dateStr}`, pageWidth - margin - 6, currentY + 7.5, { align: 'right' });
  doc.text(`Total Records: ${items.length} Students`, pageWidth - margin - 6, currentY + 13.5, { align: 'right' });

  currentY += 23;

  // Aggregate Metrics Summary Bar
  const totalPaidSum = items.reduce((acc, i) => acc + i.stats.totalPaid, 0);
  const totalDueSum = items.reduce((acc, i) => acc + i.stats.totalDueAssigned, 0);
  const totalBalanceSum = items.reduce((acc, i) => acc + i.stats.remainingBalance, 0);

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 11, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  let filterText = 'Active Filters: All Records';
  if (filterSummary?.classFilter && filterSummary.classFilter !== 'all') {
    filterText = `Class: ${formatClassName(filterSummary.classFilter)}`;
  }
  if (filterSummary?.statusFilter && filterSummary.statusFilter !== 'all') {
    filterText += ` • Status: ${filterSummary.statusFilter.toUpperCase()}`;
  }

  doc.text(filterText, margin + 4, currentY + 7);

  const metricsSummary = `Collected: Rs. ${totalPaidSum.toLocaleString('en-IN')}  |  Due Assigned: Rs. ${totalDueSum.toLocaleString('en-IN')}  |  Net Balance: Rs. ${totalBalanceSum.toLocaleString('en-IN')}`;
  doc.text(metricsSummary, pageWidth - margin - 4, currentY + 7, { align: 'right' });

  currentY += 15;

  // Table
  const tableData = items.map((item, index) => [
    (index + 1).toString(),
    item.student.rollNumber || 'N/A',
    item.student.name || 'Unnamed',
    formatClassName(item.student.class || 'N/A'),
    item.student.semester || 'Main',
    item.student.mobile || item.student.whatsapp || 'N/A',
    `Rs. ${item.stats.totalPaid.toLocaleString('en-IN')}`,
    `Rs. ${item.stats.totalDueAssigned.toLocaleString('en-IN')}`,
    `Rs. ${item.stats.remainingBalance.toLocaleString('en-IN')}`,
    (item.student.status || 'active').toUpperCase()
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [[
      '#',
      'Roll No',
      'Student Name',
      'Class',
      'Batch',
      'Contact',
      'Total Paid',
      'Total Due',
      'Net Balance',
      'Status'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 50, fontStyle: 'bold' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold', textColor: [16, 149, 106] },
      7: { cellWidth: 28, halign: 'right', fontStyle: 'bold', textColor: [217, 119, 6] },
      8: { cellWidth: 28, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
      9: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      const pageNumber = (doc.internal as any).getNumberOfPages();
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${data.pageNumber} • Brain Tutorial Home Student Overview Audit Register`,
        margin,
        pageHeight - 6
      );
      doc.text(
        'Confidential & Authorized Use Only',
        pageWidth - margin,
        pageHeight - 6,
        { align: 'right' }
      );
    }
  });

  const filename = `Student_Overview_Report_${getISTToday()}.pdf`;
  await exportPdfDocument(doc, filename);
}
