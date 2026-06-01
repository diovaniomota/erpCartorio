"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/shared/delete-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

export type DataColumn = {
  key: string;
  label: string;
  format?: "currency" | "date" | "status" | "priority" | "boolean";
  hrefBase?: string;
};

type DataTableProps = {
  data: Record<string, unknown>[];
  columns: DataColumn[];
  searchPlaceholder?: string;
  deleteAction?: (id: string) => Promise<ActionResult>;
};

export function DataTable({ data, columns, searchPlaceholder = "Filtrar registros", deleteAction }: DataTableProps) {
  const [search, setSearch] = useState("");
  const statusColumn = columns.find((column) => column.format === "status");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const needle = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(needle)),
    );
  }, [data, search]);

  const statusSummary = useMemo(() => {
    if (!statusColumn) return [];

    const counts = new Map<string, number>();
    data.forEach((row) => {
      const value = String(row[statusColumn.key] ?? "sem status");
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });

    return Array.from(counts.entries()).slice(0, 5);
  }, [data, statusColumn]);

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
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 rounded-md bg-white pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead key={column.key} className="whitespace-nowrap">
                    {column.label}
                  </TableHead>
                ))}
                {deleteAction ? <TableHead className="w-20 text-right">Ações</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? filtered.map((row) => (
                <TableRow key={String(row.id)} className="group border-slate-100 hover:bg-slate-50">
                  {columns.map((column, index) => (
                    <TableCell key={column.key} className="max-w-[24rem] align-middle text-sm">
                      <CellValue column={column} value={row[column.key]} row={row} emphasized={index === 0} />
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
                  <TableCell colSpan={columns.length + (deleteAction ? 1 : 0)} className="h-24 text-center text-sm text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
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

  return <span className={emphasized ? "line-clamp-2 font-semibold text-slate-950" : "line-clamp-2 text-slate-700"}>{content}</span>;
}
