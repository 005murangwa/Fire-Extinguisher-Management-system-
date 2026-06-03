/**
 * @file exporters.js
 * @module reporting-service/exporters
 *
 * Purpose:
 *   Convert report datasets into downloadable CSV and PDF documents.
 *
 * Responsibilities:
 *   - CSV serialisation with correct escaping.
 *   - PDF generation via PDFKit with a simple branded layout.
 */

import PDFDocument from 'pdfkit';

/**
 * Escape a single CSV cell (RFC-4180-style quoting).
 * @param {unknown} value - Raw value.
 * @returns {string} Escaped cell.
 */
function csvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Quote when the value contains a comma, quote or newline.
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serialise an array of flat objects to CSV text.
 * @param {object[]} rows - Records to serialise.
 * @param {string[]} [columns] - Explicit column order; defaults to keys of row 0.
 * @returns {string} CSV document text.
 */
export function toCsv(rows, columns) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const cols = columns ?? Object.keys(rows[0]);
  const header = cols.map(csvCell).join(',');
  const body = rows.map((row) => cols.map((c) => csvCell(row[c])).join(',')).join('\n');
  return `${header}\n${body}\n`;
}

/**
 * Render a report to a PDF buffer with a header, generated timestamp and one or
 * more "sections" (title + key/value lines or simple tables).
 *
 * @param {object} opts - PDF options.
 * @param {string} opts.title - Report title.
 * @param {Array<{heading:string, rows: Array<[string, string]>}>} opts.sections - Sections.
 * @returns {Promise<Buffer>} The rendered PDF.
 */
export function toPdf({ title, sections }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header / branding.
    doc.fontSize(20).fillColor('#dc2626').text('TZW LTD', { continued: true });
    doc.fillColor('#111827').text('  Fire Extinguisher Management System');
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor('#374151').text(title);
    doc.fontSize(9).fillColor('#6b7280').text(`Generated: ${new Date().toISOString()}`);
    doc.moveTo(50, doc.y + 6).lineTo(545, doc.y + 6).strokeColor('#e5e7eb').stroke();
    doc.moveDown(1);

    for (const section of sections) {
      doc.fontSize(12).fillColor('#111827').text(section.heading);
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#374151');
      for (const [label, value] of section.rows) {
        doc.text(`${label}: `, { continued: true }).fillColor('#111827').text(String(value));
        doc.fillColor('#374151');
      }
      doc.moveDown(0.8);
    }

    doc.end();
  });
}
