/**
 * @file DataTable.jsx
 * Generic, accessible data table supporting client-side search, column sorting,
 * pagination and CSV / PDF export. Columns are described declaratively.
 *
 * Column shape: { key, header, render?(row), sortable?, exportValue?(row) }
 */
import { useMemo, useState } from 'react';
import {
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, TextInput, Button,
} from '@tremor/react';
import { ArrowUpDown, Download, FileText, Search } from 'lucide-react';
import { EmptyState } from './ui.jsx';

/**
 * Trigger a client-side CSV download for the given rows/columns.
 * @param {object[]} rows - Visible rows.
 * @param {Array} columns - Column defs.
 * @param {string} filename - Output filename.
 */
function downloadCsv(rows, columns, filename) {
  const cols = columns.filter((c) => c.key !== 'actions');
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.map((c) => escape(c.header)).join(',');
  const body = rows
    .map((r) => cols.map((c) => escape(c.exportValue ? c.exportValue(r) : r[c.key])).join(','))
    .join('\n');
  const blob = new Blob([`${header}\n${body}\n`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/**
 * Open a print-friendly window (the browser's "Save as PDF" produces the PDF).
 * @param {object[]} rows - Visible rows.
 * @param {Array} columns - Column defs.
 * @param {string} title - Document title.
 */
function printPdf(rows, columns, title) {
  const cols = columns.filter((c) => c.key !== 'actions');
  const head = cols.map((c) => `<th>${c.header}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${cols.map((c) => `<td>${c.exportValue ? c.exportValue(r) : (r[c.key] ?? '')}</td>`).join('')}</tr>`)
    .join('');
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      h1{color:#dc2626;font-size:18px}
      table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
      th{background:#f3f4f6}
    </style></head>
    <body><h1>TZW FEMS · ${title}</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    <script>window.onload=()=>window.print()</script>
    </body></html>`);
  w.document.close();
}

export default function DataTable({
  columns,
  rows,
  pageSize = 10,
  searchable = true,
  exportable = true,
  exportName = 'export',
  emptyMessage,
  filterSlot = null,
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  // Client-side filter across all primitive cell values.
  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => {
        const v = c.exportValue ? c.exportValue(r) : r[c.key];
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
  }, [rows, query, columns]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      if (av == null) return 1; if (bv == null) return -1;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {filterSlot}
          {searchable && (
            <div className="w-full min-w-[200px] sm:w-72">
              <TextInput icon={Search} placeholder="Search table..." value={query} onValueChange={(v) => { setQuery(v); setPage(1); }} />
            </div>
          )}
        </div>
        {exportable && (
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            <Button size="xs" variant="secondary" icon={Download} onClick={() => downloadCsv(sorted, columns, `${exportName}.csv`)}>
              CSV
            </Button>
            <Button size="xs" variant="secondary" icon={FileText} onClick={() => printPdf(sorted, columns, exportName)}>
              PDF
            </Button>
          </div>
        )}
      </div>

      {pageRows.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableHeaderCell key={c.key}>
                    {c.sortable ? (
                      <button className="inline-flex items-center gap-1 hover:text-blue-600" onClick={() => toggleSort(c.key)}>
                        {c.header} <ArrowUpDown className="h-3 w-3" />
                      </button>
                    ) : c.header}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((row, idx) => (
                <TableRow key={row.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {columns.map((c) => (
                    <TableCell key={c.key}>{c.render ? c.render(row) : row[c.key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {(current - 1) * pageSize + 1}-{Math.min(current * pageSize, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-2">
              <Button size="xs" variant="secondary" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                Previous
              </Button>
              <span className="px-2">Page {current} / {totalPages}</span>
              <Button size="xs" variant="secondary" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
