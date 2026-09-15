import jsPDF from 'jspdf';
import { Notice } from '../types';
import { safeFormat } from '../lib/utils';
import { exportPdfDocument } from './mobileExportHelper';

export async function exportNoticeToPdf(notice: Notice): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 14, contentWidth, 28, 'F');

  // Institution Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BRAIN TUTORIAL HOME', margin + 6, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Excellence in Comprehensive Academic Learning', margin + 6, 29);
  doc.text('Official Bulletin & Institutional Circular', margin + 6, 35);

  // Notice Ref Box on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  const dateStr = safeFormat(notice.date, 'dd MMM yyyy, hh:mm a');
  doc.text(`DATE: ${dateStr}`, pageWidth - margin - 6, 23, { align: 'right' });
  doc.text(`REF: BTH-NOT-${(notice.id || '0000').slice(0, 8).toUpperCase()}`, pageWidth - margin - 6, 29, { align: 'right' });
  if (notice.targetClass) {
    doc.text(`AUDIENCE: ${notice.targetClass.toUpperCase()}`, pageWidth - margin - 6, 35, { align: 'right' });
  }

  let currentY = 48;

  // Priority Banner if Important
  if (notice.isImportant) {
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(244, 63, 94); // rose-500
    doc.roundedRect(margin, currentY, contentWidth, 8, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(190, 18, 60); // rose-700
    doc.text('PRIORITY / URGENT ANNOUNCEMENT', margin + 4, currentY + 5.5);
    currentY += 12;
  }

  // Category Tag & Pinned status
  if (notice.category) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(99, 102, 241); // indigo-500
    doc.text(`CATEGORY: ${notice.category.toUpperCase()}`, margin, currentY);
    currentY += 5;
  }

  // Notice Headline / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(notice.title.toUpperCase(), contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 7 + 2;

  // Horizontal Accent Divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Body Paragraphs - arranged faithfully as provided
  const rawParagraphs = (notice.content || '').split(/\n{2,}/);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85); // slate-700

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check if new page needed
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 20;
    }

    // Split into sub-lines to respect internal newlines
    const subLines = para.split('\n');
    for (const line of subLines) {
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      const cleanLine = line.trim();
      const isBullet = /^[•\-\*✓👉➢▪]\s+/.test(cleanLine) || /^\d+[\.\)]\s+/.test(cleanLine);
      const printableText = cleanLine.replace(/[\*\*|__]/g, ''); // strip markdown bold for clean pdf text

      if (isBullet) {
        const wrapped = doc.splitTextToSize(printableText, contentWidth - 6);
        doc.text(wrapped, margin + 4, currentY);
        currentY += wrapped.length * 5.5 + 1;
      } else {
        const wrapped = doc.splitTextToSize(printableText, contentWidth);
        doc.text(wrapped, margin, currentY);
        currentY += wrapped.length * 5.5 + 1;
      }
    }

    currentY += 4; // Paragraph spacing gap
  }

  // Footer / Signatory Block
  const footerY = Math.max(currentY + 12, pageHeight - 35);
  if (footerY > pageHeight - 25) {
    doc.addPage();
  }

  const finalSignY = Math.min(footerY, pageHeight - 25);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, finalSignY - 4, pageWidth - margin, finalSignY - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Issued by Administration', margin, finalSignY + 2);
  doc.text('Authorized Signatory', pageWidth - margin, finalSignY + 2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Brain Tutorial Home • Official Student Notice Board Document', margin, finalSignY + 7);
  doc.text('Verified & Digitally Logged Record', pageWidth - margin, finalSignY + 7, { align: 'right' });

  const sanitized = (notice.title || 'Notice').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const filename = `Notice_${sanitized}_${(notice.id || 'doc').slice(0, 6)}.pdf`;
  await exportPdfDocument(doc, filename);
}
