import { formatCurrency, formatDate } from "@/lib/utils";

export type ExportColumn = {
  key: string;
  label: string;
  format?: "currency" | "date" | "boolean";
};

function formatValue(value: unknown, format?: ExportColumn["format"]): string {
  if (value === null || value === undefined) return "";
  if (format === "date") return formatDate(String(value));
  if (format === "currency") return formatCurrency(Number(value));
  if (format === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

// RFC 4180: wrap in quotes if value contains comma, quote, newline
function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const header = columns.map((col) => escapeField(col.label)).join(",");
  const rows = data.map((row) =>
    columns.map((col) => escapeField(formatValue(row[col.key], col.format))).join(","),
  );

  // UTF-8 BOM so Excel PT-BR opens with correct encoding
  const content = "﻿" + [header, ...rows].join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
