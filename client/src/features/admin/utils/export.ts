/**
 * Export utilities — CSV & XLSX generation
 */
import * as XLSX from 'xlsx';
import { http } from '@/lib/http';

/**
 * Fetch all pages of a paginated API endpoint.
 * Loops through pages until there's no more data (handles max_page_size cap).
 */
export async function fetchAllPages(
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<any[]> {
  const all: any[] = [];
  let page = 1;
  const pageSize = 100; // match backend max_page_size

  while (true) {
    const { data } = await http.get(url, {
      params: { ...params, page, page_size: pageSize },
    });
    const results = data.results ?? (Array.isArray(data) ? data : []);
    all.push(...results);

    // Stop if we got fewer items than page_size, or no next page
    if (!data.next || results.length < pageSize) break;
    page++;
  }

  return all;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data array to CSV file with BOM for Excel UTF-8 compatibility
 */
export function exportToCSV<T>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string,
): void {
  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const csvRows = [
    columns.map((c) => c.label).join(','),
    ...data.map((row) =>
      columns.map((c) => escapeCsv(String(row[c.key] ?? ''))).join(','),
    ),
  ];
  // BOM prefix ensures Excel opens UTF-8 CSV correctly
  const blob = new Blob(['﻿' + csvRows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data array to XLSX file using SheetJS
 */
export function exportToXLSX<T>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string,
): void {
  const sheetData = data.map((row) => {
    const obj: Record<string, string | number> = {};
    columns.forEach((c) => (obj[c.label] = String(row[c.key] ?? '')));
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Format a Date object to YYYY-MM-DD_HHmm filename-safe string
 */
export function timestampFilename(prefix: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${prefix}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}
