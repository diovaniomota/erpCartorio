"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/shared/delete-button";
import { ExportButton } from "@/components/shared/export-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ExportColumn } from "@/lib/export/csv";
import type { ActionResult } from "@/lib/types";

export type DataColumn = {
  key: string;
  label: string;
  format?: "currency" | "date" | "status" | "priority" | "boolean";
  hrefBase?: string;
  sortable?: boolean;
};

type SortState = { key: string; dir: "asc" | "desc" } | null;

type DataTableProps = {
  data: Record<string, unknown>[];
  columns: DataColumn[];
  searchPlaceholder?: string;
  deleteAction?: (id: string) => Promise<ActionResult>;
  pageSize?: number;
  exportable?: boolean;
  exportFilename?: string;
  exportTitle?: string;
  exportColumns?: ExportColumn[];
};

export function DataTable({
  data,
  columns,
  searchPlaceholder = "Filtrar registros",
  deleteAction,
  pageSize = 20,
  exportable = false,
  exportFilename = "dados",
  exportTitle,
  exportColumns,
}: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);

  const statusColumn = columns.find((col) => col.format === "status");

  // Derive export columns from DataColumn definitions (status/priority rendered as plain text)
  const resolvedExportColumns: ExportColumn[] = exportColumns ?? columns.map((col) => ({
    key: col.key,
    label: col.label,
    format: (col.format === "currency" || col.format === "date" || col.format === "boolean")
      ? col.format
      : undefined,
  }));

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const needle = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(needle)),
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = String(av).localeCompare(String(bv), "pt-BR", { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  const statusSummary = useMemo(() => {
    if (!statusColumn) return [];
    const counts = new Map<string, number>();
    data.forEach((row) => {
      const value = String(row[statusColumn.key] ?? "sem status");
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return Array.from(counts.entries()).slice(0, 5);
  }, [data, statusColumn]);

  function toggleSort(key: string) {
    setPage(1);
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">Registros</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span><strong className="font-semibold text-slate-950">{filtered.length}</strong> filtrados</span>
            <span><strong className="font-semibold text-slate-950">{data.length}</strong> total</span>
            {statusSummary.map(([status, count]) => (
              <span key={status} className="inline-flex items-center gap-1.5">
                <span>{status}</span>
                <strong className="font-semibold text-slate-950">{count}</strong>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 rounded-md bg-white pl-9"
              aria-label={searchPlaceholder}
            />
          </div>
          {exportable && (
            <ExportButton
              data={sorted}
              columns={resolvedExportColumns}
              filename={exportFilename}
              title={exportTitle}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className="whitespace-nowrap">
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                      aria-label={`Ordenar por ${col.label}`}
                    >
                      {col.label}
                      <SortIcon sortKey={col.key} sort={sort} />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
              {deleteAction ? <TableHead className="w-20 text-right">Ações</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((row) => (
              <TableRow key={String(row.id)} className="group border-slate-100 hover:bg-slate-50">
                {columns.map((col, index) => (
                  <TableCell key={col.key} className="max-w-[24rem] align-middle text-sm">
                    <CellValue column={col} value={row[col.key]} row={row} emphasized={index === 0} />
                  </TableCell>
                ))}
                {deleteAction && row.id ? (
                  <TableCell className="text-right">
                    <DeleteButton id={String(row.id)} action={deleteAction} />
                  </TableCell>
                ) : null}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (deleteAction ? 1 : 0)}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
          <span>
            Página <strong className="text-slate-950">{safePage}</strong> de{" "}
            <strong className="text-slate-950">{totalPages}</strong>
            {" · "}
            <strong className="text-slate-950">{filtered.length}</strong> registros
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function SortIcon({ sortKey, sort }: { sortKey: string; sort: SortState }) {
  if (sort?.key !== sortKey) return <ChevronsUpDown className="h-3 w-3 text-slate-400" aria-hidden="true" />;
  if (sort.dir === "asc") return <ChevronUp className="h-3 w-3 text-slate-700" aria-hidden="true" />;
  return <ChevronDown className="h-3 w-3 text-slate-700" aria-hidden="true" />;
}

function CellValue({
  column,
  value,
  row,
  emphasized,
}: {
  column: DataColumn;
  value: unknown;
  row: Record<string, unknown>;
  emphasized?: boolean;
}) {
  if (column.format === "currency") return <span>{formatCurrency(Number(value ?? 0))}</span>;
  if (column.format === "date") return <span>{formatDate(String(value ?? ""))}</span>;
  if (column.format === "status") return <StatusBadge status={String(value ?? "")} />;
  if (column.format === "priority") return <PriorityBadge priority={String(value ?? "")} />;
  if (column.format === "boolean") return <span>{value ? "Sim" : "Não"}</span>;

  const content = String(value ?? "-");

  if (column.hrefBase && row.id) {
    return (
      <Link
        className="font-semibold text-slate-950 underline-offset-4 transition-colors hover:text-primary hover:underline"
        href={`${column.hrefBase}/${row.id}`}
        prefetch={false}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      className={emphasized ? "line-clamp-2 font-semibold text-slate-950" : "line-clamp-2 text-slate-700"}
      title={content.length > 40 ? content : undefined}
    >
      {content}
    </span>
  );
}
