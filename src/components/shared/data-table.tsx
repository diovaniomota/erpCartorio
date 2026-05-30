"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
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

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const needle = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(needle)),
    );
  }, [data, search]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Registros</p>
          <p className="text-xs text-muted-foreground">
            {filtered.length} de {data.length} {data.length === 1 ? "item" : "itens"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="bg-white pl-9"
            />
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-md border bg-white text-slate-500 md:flex">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.key} className="h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {column.label}
                </TableHead>
              ))}
              {deleteAction ? <TableHead className="h-11 w-20 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Ações</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length ? filtered.map((row) => (
              <TableRow key={String(row.id)} className="group border-slate-100 odd:bg-slate-50/35 hover:bg-blue-50/40">
                {columns.map((column) => (
                  <TableCell key={column.key} className="max-w-[22rem] py-3 align-middle text-sm">
                    <CellValue column={column} value={row[column.key]} row={row} />
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
  );
}

function CellValue({
  column,
  value,
  row,
}: {
  column: DataColumn;
  value: unknown;
  row: Record<string, unknown>;
}) {
  if (column.format === "currency") return <span>{formatCurrency(Number(value ?? 0))}</span>;
  if (column.format === "date") return <span>{formatDate(String(value ?? ""))}</span>;
  if (column.format === "status") return <StatusBadge status={String(value ?? "")} />;
  if (column.format === "priority") return <PriorityBadge priority={String(value ?? "")} />;
  if (column.format === "boolean") return <span>{value ? "Sim" : "Não"}</span>;

  const content = String(value ?? "-");

  if (column.hrefBase && row.id) {
    return (
      <Link className="font-semibold text-slate-950 underline-offset-4 transition-colors hover:text-primary hover:underline" href={`${column.hrefBase}/${row.id}`}>
        {content}
      </Link>
    );
  }

  return <span className="line-clamp-2 text-slate-700">{content}</span>;
}
