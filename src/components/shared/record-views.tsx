"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
} from "lucide-react";
import { ExportButton } from "@/components/shared/export-button";
import { RestoreButton } from "@/components/shared/restore-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/shared/delete-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { SEM_CATEGORIA } from "@/lib/constants";
import type {
  ActionResult,
  Contrato,
  DocumentoInterno,
  FinanceiroConta,
  Fornecedor,
  Funcionario,
  InventarioItem,
  OfficialUpdate,
} from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type DeleteAction = (id: string) => Promise<ActionResult>;
type RestoreAction = (id: string) => Promise<ActionResult>;
type SortState = { key: string; dir: "asc" | "desc" } | null;

// ─── Shared sort/pagination/archive hook ──────────────────────────────────────
const PAGE_SIZE = 20;

function useSortTable<T extends { deleted_at?: string | null; id: string }>(
  allItems: T[],
  showArchived: boolean,
) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);

  const items = useMemo(
    () => allItems.filter((item) => (showArchived ? !!item.deleted_at : !item.deleted_at)),
    [allItems, showArchived],
  );

  const sorted = useMemo(() => {
    if (!sort) return items;
    return [...items].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sort.key] ?? "";
      const bv = (b as Record<string, unknown>)[sort.key] ?? "";
      const cmp = String(av).localeCompare(String(bv), "pt-BR", { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [items, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sorted, safePage],
  );

  function toggleSort(key: string) {
    setPage(1);
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  return { items, paginated, page: safePage, setPage, totalPages, sort, toggleSort };
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────
function SortHead({
  children,
  sortKey,
  sort,
  onSort,
  className,
}: {
  children: ReactNode;
  sortKey: string;
  sort: SortState;
  onSort: (k: string) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  const dir = active ? sort!.dir : null;
  return (
    <TableHead
      className={cn("cursor-pointer select-none whitespace-nowrap", className)}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active ? (
          dir === "asc"
            ? <ChevronUp className="h-3 w-3" aria-hidden="true" />
            : <ChevronDown className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 text-slate-300" aria-hidden="true" />
        )}
      </span>
    </TableHead>
  );
}

function TablePagination({
  page,
  totalPages,
  count,
  onPage,
}: {
  page: number;
  totalPages: number;
  count: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1 pt-3 text-sm text-slate-500">
      <span>
        Página <strong className="text-slate-950">{page}</strong> de{" "}
        <strong className="text-slate-950">{totalPages}</strong>
        {" · "}
        <strong className="text-slate-950">{count}</strong> registros
      </span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Página anterior">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onPage(page + 1)} aria-label="Próxima página">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function ArchiveToggle({ showArchived, archivedCount, onToggle }: {
  showArchived: boolean;
  archivedCount: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={showArchived}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
        showArchived
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
      )}
    >
      <Archive className="h-3.5 w-3.5" aria-hidden="true" />
      {showArchived ? "Ocultar arquivados" : `Arquivados${archivedCount > 0 ? ` (${archivedCount})` : ""}`}
    </button>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

export function SupplierDirectory({
  fornecedores,
  deleteAction,
  restoreAction,
}: {
  fornecedores: Fornecedor[];
  deleteAction: DeleteAction;
  restoreAction?: RestoreAction;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const { items, paginated, page, setPage, totalPages, sort, toggleSort } = useSortTable(fornecedores, showArchived);
  const archivedCount = useMemo(() => fornecedores.filter((f) => f.deleted_at).length, [fornecedores]);

  const ativos = items.filter((f) => f.status === "ativo").length;
  const categorias = Array.from(new Set(items.map((f) => f.categoria).filter(Boolean))).length;
  const exportCols = [
    { key: "nome", label: "Fornecedor" },
    { key: "categoria", label: "Categoria" },
    { key: "documento", label: "Documento" },
    { key: "contato_responsavel", label: "Contato" },
    { key: "telefone", label: "Telefone" },
    { key: "email", label: "E-mail" },
    { key: "status", label: "Status" },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Lista de fornecedores</h2>
          <p className="text-sm text-slate-500">Contatos e responsáveis em linhas para leitura rápida.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
          {!showArchived && (
            <>
              <span className="inline-flex items-baseline gap-1"><span className="font-semibold text-slate-950">{ativos}</span> ativos</span>
              <span className="inline-flex items-baseline gap-1"><span className="font-semibold text-slate-950">{categorias}</span> categorias</span>
            </>
          )}
          <span className="inline-flex items-baseline gap-1"><span className="font-semibold text-slate-950">{items.length}</span> registros</span>
          <ArchiveToggle showArchived={showArchived} archivedCount={archivedCount} onToggle={() => setShowArchived((v) => !v)} />
          <ExportButton data={items as unknown as Record<string, unknown>[]} columns={exportCols} filename="fornecedores" title="Fornecedores" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <SortHead sortKey="nome" sort={sort} onSort={toggleSort} className="min-w-60">Fornecedor</SortHead>
              <SortHead sortKey="categoria" sort={sort} onSort={toggleSort}>Categoria</SortHead>
              <SortHead sortKey="documento" sort={sort} onSort={toggleSort}>Documento</SortHead>
              <SortHead sortKey="contato_responsavel" sort={sort} onSort={toggleSort} className="min-w-48">Contato</SortHead>
              <SortHead sortKey="telefone" sort={sort} onSort={toggleSort}>Telefone</SortHead>
              <SortHead sortKey="email" sort={sort} onSort={toggleSort} className="min-w-56">E-mail</SortHead>
              <SortHead sortKey="status" sort={sort} onSort={toggleSort}>Status</SortHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((fornecedor) => (
              <TableRow key={fornecedor.id} className="border-slate-100 hover:bg-cyan-50/[0.45]">
                <TableCell>
                  <Link href={`/fornecedores/${fornecedor.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-cyan-800 hover:underline">
                    {fornecedor.nome}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{fornecedor.categoria || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{fornecedor.documento || "-"}</TableCell>
                <TableCell className="text-slate-700">{fornecedor.contato_responsavel || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{fornecedor.telefone || "-"}</TableCell>
                <TableCell className="text-slate-700">{fornecedor.email || "-"}</TableCell>
                <TableCell><StatusBadge status={fornecedor.status} /></TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {!showArchived && (
                      <Link href={`/fornecedores/${fornecedor.id}`} prefetch={false} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-cyan-800 transition-colors hover:bg-cyan-50" title="Abrir ficha">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="sr-only">Abrir ficha</span>
                      </Link>
                    )}
                    {showArchived && restoreAction
                      ? <RestoreButton id={fornecedor.id} action={restoreAction} />
                      : !showArchived && <DeleteButton id={fornecedor.id} action={deleteAction} />}
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-sm text-slate-500">
                  {showArchived ? "Nenhum fornecedor arquivado." : "Nenhum fornecedor cadastrado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page} totalPages={totalPages} count={items.length} onPage={setPage} />
    </section>
  );
}

export function ContractPipeline({
  contratos,
  deleteAction,
  restoreAction,
}: {
  contratos: Contrato[];
  deleteAction: DeleteAction;
  restoreAction?: RestoreAction;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const { items, paginated, page, setPage, totalPages, sort, toggleSort } = useSortTable(contratos, showArchived);
  const archivedCount = useMemo(() => contratos.filter((c) => c.deleted_at).length, [contratos]);

  const vigentes = items.filter((c) => ["vigente", "renovado"].includes(c.status)).length;
  const atencao = items.filter((c) => ["a vencer", "suspenso"].includes(c.status)).length;
  const encerrados = items.filter((c) => ["vencido", "cancelado"].includes(c.status)).length;
  const exportColsContratos = [
    { key: "nome", label: "Contrato" },
    { key: "fornecedor_nome", label: "Fornecedor" },
    { key: "numero", label: "Número" },
    { key: "valor", label: "Valor mensal", format: "currency" as const },
    { key: "data_inicio", label: "Início", format: "date" as const },
    { key: "data_vencimento", label: "Vencimento", format: "date" as const },
    { key: "indice_reajuste", label: "Reajuste" },
    { key: "status", label: "Status" },
  ];

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de contratos"
        description="Contratos em linha, com fornecedor, valores e vencimentos visíveis sem abrir cartões."
        metrics={showArchived
          ? [{ label: "arquivados", value: String(items.length) }]
          : [
            { label: "vigentes", value: String(vigentes) },
            { label: "atenção", value: String(atencao) },
            { label: "encerrados", value: String(encerrados) },
            { label: "registros", value: String(items.length) },
          ]}
        actions={
          <>
            <ArchiveToggle showArchived={showArchived} archivedCount={archivedCount} onToggle={() => setShowArchived((v) => !v)} />
            <ExportButton data={items as unknown as Record<string, unknown>[]} columns={exportColsContratos} filename="contratos" title="Contratos" />
          </>
        }
      />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <SortHead sortKey="nome" sort={sort} onSort={toggleSort} className="min-w-64">Contrato</SortHead>
              <SortHead sortKey="fornecedor_nome" sort={sort} onSort={toggleSort} className="min-w-52">Fornecedor</SortHead>
              <SortHead sortKey="numero" sort={sort} onSort={toggleSort}>Número</SortHead>
              <SortHead sortKey="valor" sort={sort} onSort={toggleSort}>Valor mensal</SortHead>
              <SortHead sortKey="data_inicio" sort={sort} onSort={toggleSort}>Início</SortHead>
              <SortHead sortKey="data_vencimento" sort={sort} onSort={toggleSort}>Vencimento</SortHead>
              <SortHead sortKey="indice_reajuste" sort={sort} onSort={toggleSort}>Reajuste</SortHead>
              <SortHead sortKey="status" sort={sort} onSort={toggleSort}>Status</SortHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((contrato) => (
              <TableRow key={contrato.id} className="border-slate-100 hover:bg-indigo-50/[0.40]">
                <TableCell>
                  <Link href={`/contratos/${contrato.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-indigo-700 hover:underline">
                    {contrato.nome}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{contrato.fornecedor_nome ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{contrato.numero ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-950">{formatCurrency(Number(contrato.valor ?? 0))}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(contrato.data_inicio)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(contrato.data_vencimento)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{contrato.indice_reajuste ?? "-"}</TableCell>
                <TableCell><StatusBadge status={contrato.status} /></TableCell>
                <TableCell className="text-right">
                  {showArchived && restoreAction
                    ? <RestoreButton id={contrato.id} action={restoreAction} />
                    : !showArchived && <DeleteButton id={contrato.id} action={deleteAction} />}
                </TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={9} text={showArchived ? "Nenhum contrato arquivado." : "Nenhum contrato cadastrado."} />}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page} totalPages={totalPages} count={items.length} onPage={setPage} />
    </section>
  );
}

export function FinancialLedger({
  contas,
  deleteAction,
  restoreAction,
}: {
  contas: FinanceiroConta[];
  deleteAction: DeleteAction;
  restoreAction?: RestoreAction;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const { items, paginated, page, setPage, totalPages, sort, toggleSort } = useSortTable(contas, showArchived);
  const archivedCount = useMemo(() => contas.filter((c) => c.deleted_at).length, [contas]);

  const totalPagar = items.filter((c) => c.tipo === "pagar").reduce((s, c) => s + Number(c.valor ?? 0), 0);
  const totalReceber = items.filter((c) => c.tipo === "receber").reduce((s, c) => s + Number(c.valor ?? 0), 0);
  const vencidas = items.filter((c) => c.status === "vencida").length;
  const exportColsContas = [
    { key: "descricao", label: "Conta" },
    { key: "tipo", label: "Tipo" },
    { key: "categoria_nome", label: "Categoria" },
    { key: "fornecedor_nome", label: "Fornecedor" },
    { key: "data_vencimento", label: "Vencimento", format: "date" as const },
    { key: "valor", label: "Valor", format: "currency" as const },
    { key: "status", label: "Status" },
  ];

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de contas"
        description="Contas financeiras em formato operacional, com vencimento, valor e fornecedor na mesma linha."
        metrics={showArchived
          ? [{ label: "arquivadas", value: String(items.length) }]
          : [
            { label: "a pagar", value: formatCurrency(totalPagar) },
            { label: "a receber", value: formatCurrency(totalReceber) },
            { label: "vencidas", value: String(vencidas) },
            { label: "registros", value: String(items.length) },
          ]}
        actions={
          <>
            <ArchiveToggle showArchived={showArchived} archivedCount={archivedCount} onToggle={() => setShowArchived((v) => !v)} />
            <ExportButton data={items as unknown as Record<string, unknown>[]} columns={exportColsContas} filename="contas-financeiras" title="Contas financeiras" />
          </>
        }
      />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <SortHead sortKey="descricao" sort={sort} onSort={toggleSort} className="min-w-72">Conta</SortHead>
              <SortHead sortKey="tipo" sort={sort} onSort={toggleSort}>Tipo</SortHead>
              <SortHead sortKey="categoria_nome" sort={sort} onSort={toggleSort} className="min-w-44">Categoria</SortHead>
              <SortHead sortKey="fornecedor_nome" sort={sort} onSort={toggleSort} className="min-w-52">Fornecedor</SortHead>
              <SortHead sortKey="data_vencimento" sort={sort} onSort={toggleSort}>Vencimento</SortHead>
              <SortHead sortKey="valor" sort={sort} onSort={toggleSort}>Valor</SortHead>
              <SortHead sortKey="status" sort={sort} onSort={toggleSort}>Status</SortHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((conta) => (
              <TableRow key={conta.id} className="border-slate-100 hover:bg-blue-50/[0.40]">
                <TableCell>
                  <p className="font-semibold text-slate-950">{conta.descricao}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {conta.recorrente ? <Badge variant="outline">recorrente</Badge> : null}
                    {conta.codigo_barras ? <Badge variant="outline">boleto</Badge> : null}
                  </div>
                </TableCell>
                <TableCell><Badge variant={conta.tipo === "receber" ? "info" : "secondary"}>{conta.tipo}</Badge></TableCell>
                <TableCell className="text-slate-700">{conta.categoria_nome ?? conta.centro_custo ?? SEM_CATEGORIA}</TableCell>
                <TableCell className="text-slate-700">{conta.fornecedor_nome ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(conta.data_vencimento)}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-950">{formatCurrency(Number(conta.valor ?? 0))}</TableCell>
                <TableCell><StatusBadge status={conta.status} /></TableCell>
                <TableCell className="text-right">
                  {showArchived && restoreAction
                    ? <RestoreButton id={conta.id} action={restoreAction} />
                    : !showArchived && <DeleteButton id={conta.id} action={deleteAction} />}
                </TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={8} text={showArchived ? "Nenhuma conta arquivada." : "Nenhuma conta encontrada."} />}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page} totalPages={totalPages} count={items.length} onPage={setPage} />
    </section>
  );
}

export function StaffDirectory({
  funcionarios,
  deleteAction,
  restoreAction,
}: {
  funcionarios: Funcionario[];
  deleteAction: DeleteAction;
  restoreAction?: RestoreAction;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const { items, paginated, page, setPage, totalPages, sort, toggleSort } = useSortTable(funcionarios, showArchived);
  const archivedCount = useMemo(() => funcionarios.filter((f) => f.deleted_at).length, [funcionarios]);

  const ativos = items.filter((f) => f.status === "ativo").length;
  const ausentes = items.filter((f) => ["afastado", "férias", "licença"].includes(f.status)).length;
  // CPF completo e salário omitidos da exportação (P1.2)
  const exportColsFuncionarios = [
    { key: "nome", label: "Funcionário" },
    { key: "cargo", label: "Cargo" },
    { key: "setor", label: "Setor" },
    { key: "email", label: "E-mail" },
    { key: "telefone", label: "Telefone" },
    { key: "data_admissao", label: "Admissão", format: "date" as const },
    { key: "tipo_contrato", label: "Contrato" },
    { key: "status", label: "Status" },
  ];

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de funcionários"
        description="Equipe em linhas com cargo, setor, contato, admissão e situação."
        metrics={showArchived
          ? [{ label: "arquivados", value: String(items.length) }]
          : [
            { label: "ativos", value: String(ativos) },
            { label: "ausentes", value: String(ausentes) },
            { label: "registros", value: String(items.length) },
          ]}
        actions={
          <>
            <ArchiveToggle showArchived={showArchived} archivedCount={archivedCount} onToggle={() => setShowArchived((v) => !v)} />
            <ExportButton data={items as unknown as Record<string, unknown>[]} columns={exportColsFuncionarios} filename="funcionarios" title="Funcionários" />
          </>
        }
      />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <SortHead sortKey="nome" sort={sort} onSort={toggleSort} className="min-w-60">Funcionário</SortHead>
              <SortHead sortKey="cargo" sort={sort} onSort={toggleSort} className="min-w-52">Cargo</SortHead>
              <SortHead sortKey="setor" sort={sort} onSort={toggleSort}>Setor</SortHead>
              <SortHead sortKey="email" sort={sort} onSort={toggleSort} className="min-w-56">E-mail</SortHead>
              <SortHead sortKey="telefone" sort={sort} onSort={toggleSort}>Telefone</SortHead>
              <SortHead sortKey="data_admissao" sort={sort} onSort={toggleSort}>Admissão</SortHead>
              <SortHead sortKey="tipo_contrato" sort={sort} onSort={toggleSort}>Contrato</SortHead>
              <SortHead sortKey="status" sort={sort} onSort={toggleSort}>Status</SortHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((funcionario) => (
              <TableRow key={funcionario.id} className="border-slate-100 hover:bg-rose-50/[0.35]">
                <TableCell>
                  <Link href={`/rh/funcionarios/${funcionario.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-rose-700 hover:underline">
                    {funcionario.nome}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {funcionario.cpf
                      ? `•••.•••.•••-${funcionario.cpf.replace(/\D/g, "").slice(-2)}`
                      : "—"}
                  </p>
                </TableCell>
                <TableCell className="text-slate-700">{funcionario.cargo}</TableCell>
                <TableCell className="text-slate-700">{funcionario.setor}</TableCell>
                <TableCell className="text-slate-700">{funcionario.email ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{funcionario.telefone ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(funcionario.data_admissao)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{funcionario.tipo_contrato ?? "-"}</TableCell>
                <TableCell><StatusBadge status={funcionario.status} /></TableCell>
                <TableCell className="text-right">
                  {showArchived && restoreAction
                    ? <RestoreButton id={funcionario.id} action={restoreAction} />
                    : !showArchived && <DeleteButton id={funcionario.id} action={deleteAction} />}
                </TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={9} text={showArchived ? "Nenhum funcionário arquivado." : "Nenhum funcionário cadastrado."} />}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page} totalPages={totalPages} count={items.length} onPage={setPage} />
    </section>
  );
}

export function DocumentLibrary({
  docs,
  deleteAction,
  restoreAction,
}: {
  docs: DocumentoInterno[];
  deleteAction: DeleteAction;
  restoreAction?: RestoreAction;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const { items, paginated, page, setPage, totalPages, sort, toggleSort } = useSortTable(docs, showArchived);
  const archivedCount = useMemo(() => docs.filter((d) => d.deleted_at).length, [docs]);

  const folders = Array.from(new Set(items.map((d) => d.pasta ?? d.categoria).filter(Boolean)));
  const vencidos = items.filter((d) => d.status === "vencido").length;

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de documentos"
        description="Arquivo interno em linhas com pasta, validade, acesso e vínculo."
        metrics={showArchived
          ? [{ label: "arquivados", value: String(items.length) }]
          : [
            { label: "pastas", value: String(folders.length) },
            { label: "vencidos", value: String(vencidos) },
            { label: "registros", value: String(items.length) },
          ]}
        actions={
          <ArchiveToggle showArchived={showArchived} archivedCount={archivedCount} onToggle={() => setShowArchived((v) => !v)} />
        }
      />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <SortHead sortKey="titulo" sort={sort} onSort={toggleSort} className="min-w-72">Documento</SortHead>
              <SortHead sortKey="categoria" sort={sort} onSort={toggleSort}>Categoria</SortHead>
              <SortHead sortKey="pasta" sort={sort} onSort={toggleSort}>Pasta</SortHead>
              <SortHead sortKey="validade_em" sort={sort} onSort={toggleSort}>Validade</SortHead>
              <SortHead sortKey="acesso" sort={sort} onSort={toggleSort}>Acesso</SortHead>
              <SortHead sortKey="vinculo_tipo" sort={sort} onSort={toggleSort}>Vínculo</SortHead>
              <SortHead sortKey="status" sort={sort} onSort={toggleSort}>Status</SortHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((doc) => (
              <TableRow key={doc.id} className="border-slate-100 hover:bg-slate-50">
                <TableCell>
                  <Link href={`/documentos/${doc.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-slate-700 hover:underline">
                    {doc.titulo}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{doc.categoria}</TableCell>
                <TableCell className="text-slate-700">{doc.pasta ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(doc.validade_em)}</TableCell>
                <TableCell><StatusBadge status={doc.acesso} /></TableCell>
                <TableCell className="text-slate-700">{doc.vinculo_tipo ?? "-"}</TableCell>
                <TableCell><StatusBadge status={doc.status} /></TableCell>
                <TableCell className="text-right">
                  {showArchived && restoreAction
                    ? <RestoreButton id={doc.id} action={restoreAction} />
                    : !showArchived && <DeleteButton id={doc.id} action={deleteAction} />}
                </TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={8} text={showArchived ? "Nenhum documento arquivado." : "Nenhum documento interno cadastrado."} />}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page} totalPages={totalPages} count={items.length} onPage={setPage} />
    </section>
  );
}

export function AssetGrid({
  itens,
  deleteAction,
  restoreAction,
}: {
  itens: InventarioItem[];
  deleteAction: DeleteAction;
  restoreAction?: RestoreAction;
}) {
  const [showArchived, setShowArchived] = useState(false);
  const { items, paginated, page, setPage, totalPages, sort, toggleSort } = useSortTable(itens, showArchived);
  const archivedCount = useMemo(() => itens.filter((i) => i.deleted_at).length, [itens]);

  const emManutencao = items.filter((i) => i.status === "em manutenção").length;
  const patrimonio = items.reduce((s, i) => s + Number(i.valor_compra ?? 0), 0);
  const exportColsInventario = [
    { key: "codigo_patrimonio", label: "Patrimônio" },
    { key: "nome", label: "Item" },
    { key: "categoria", label: "Categoria" },
    { key: "localizacao", label: "Localização" },
    { key: "valor_compra", label: "Valor", format: "currency" as const },
    { key: "data_compra", label: "Compra", format: "date" as const },
    { key: "garantia_ate", label: "Garantia", format: "date" as const },
    { key: "numero_serie", label: "Série" },
    { key: "status", label: "Status" },
  ];

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de patrimônio"
        description="Itens do inventário em linha com localização, valor, garantia e status."
        metrics={showArchived
          ? [{ label: "arquivados", value: String(items.length) }]
          : [
            { label: "itens", value: String(items.length) },
            { label: "em manutenção", value: String(emManutencao) },
            { label: "patrimônio", value: formatCurrency(patrimonio) },
          ]}
        actions={
          <>
            <ArchiveToggle showArchived={showArchived} archivedCount={archivedCount} onToggle={() => setShowArchived((v) => !v)} />
            <ExportButton data={items as unknown as Record<string, unknown>[]} columns={exportColsInventario} filename="inventario" title="Inventário de patrimônio" />
          </>
        }
      />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <SortHead sortKey="codigo_patrimonio" sort={sort} onSort={toggleSort}>Patrimônio</SortHead>
              <SortHead sortKey="nome" sort={sort} onSort={toggleSort} className="min-w-72">Item</SortHead>
              <SortHead sortKey="categoria" sort={sort} onSort={toggleSort}>Categoria</SortHead>
              <SortHead sortKey="localizacao" sort={sort} onSort={toggleSort}>Localização</SortHead>
              <SortHead sortKey="valor_compra" sort={sort} onSort={toggleSort}>Valor</SortHead>
              <SortHead sortKey="data_compra" sort={sort} onSort={toggleSort}>Compra</SortHead>
              <SortHead sortKey="garantia_ate" sort={sort} onSort={toggleSort}>Garantia</SortHead>
              <SortHead sortKey="numero_serie" sort={sort} onSort={toggleSort}>Série</SortHead>
              <SortHead sortKey="status" sort={sort} onSort={toggleSort}>Status</SortHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((item) => (
              <TableRow key={item.id} className="border-slate-100 hover:bg-orange-50/[0.35]">
                <TableCell className="whitespace-nowrap font-medium text-orange-700">{item.codigo_patrimonio}</TableCell>
                <TableCell>
                  <Link href={`/inventario/${item.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-orange-700 hover:underline">
                    {item.nome}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{item.categoria}</TableCell>
                <TableCell className="text-slate-700">{item.localizacao}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-950">{formatCurrency(Number(item.valor_compra ?? 0))}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(item.data_compra)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(item.garantia_ate)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{item.numero_serie ?? "-"}</TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell className="text-right">
                  {showArchived && restoreAction
                    ? <RestoreButton id={item.id} action={restoreAction} />
                    : !showArchived && <DeleteButton id={item.id} action={deleteAction} />}
                </TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={10} text={showArchived ? "Nenhum item arquivado." : "Nenhum item de patrimônio cadastrado."} />}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page} totalPages={totalPages} count={items.length} onPage={setPage} />
    </section>
  );
}

export function OfficialFeed({
  updates,
  deleteAction,
}: {
  updates: OfficialUpdate[];
  deleteAction: DeleteAction;
}) {
  const { items: paginated, page, setPage, totalPages, sort, toggleSort } = useSortTable(updates, false);
  const destaque = updates[0];
  const importantes = updates.filter((u) => u.importante).length;
  const emAnalise = updates.filter((u) => u.status === "em análise").length;
  const criticas = updates.filter((u) => u.relevancia === "crítica").length;

  return (
    <section className="space-y-3">
      <ListSummary
        title="Fila oficial"
        description={destaque ? `Destaque atual: ${destaque.titulo}` : "Publicações oficiais em linha para triagem rápida."}
        metrics={[
          { label: "total", value: String(updates.length) },
          { label: "importantes", value: String(importantes) },
          { label: "críticas", value: String(criticas) },
          { label: "em análise", value: String(emAnalise) },
        ]}
      />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <SortHead sortKey="titulo" sort={sort} onSort={toggleSort} className="min-w-96">Publicação</SortHead>
              <SortHead sortKey="orgao" sort={sort} onSort={toggleSort}>Órgão</SortHead>
              <SortHead sortKey="tipo" sort={sort} onSort={toggleSort}>Tipo</SortHead>
              <SortHead sortKey="relevancia" sort={sort} onSort={toggleSort}>Relevância</SortHead>
              <SortHead sortKey="status" sort={sort} onSort={toggleSort}>Status</SortHead>
              <SortHead sortKey="publicado_em" sort={sort} onSort={toggleSort}>Publicado</SortHead>
              <TableHead>Importante</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? paginated.map((update) => (
              <TableRow key={update.id} className="border-slate-100 hover:bg-amber-50/[0.35]">
                <TableCell>
                  <p className="font-semibold text-slate-950">{update.titulo}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{update.resumo ?? update.conteudo ?? "-"}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{update.orgao}</TableCell>
                <TableCell><StatusBadge status={update.tipo} /></TableCell>
                <TableCell><StatusBadge status={update.relevancia} /></TableCell>
                <TableCell><StatusBadge status={update.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(update.publicado_em)}</TableCell>
                <TableCell>{update.importante ? <Badge variant="warning">sim</Badge> : <span className="text-slate-500">não</span>}</TableCell>
                <TableCell>
                  {update.url_original ? (
                    <Link href={update.url_original} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:underline">
                      abrir <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : <span className="text-slate-500">-</span>}
                </TableCell>
                <TableCell className="text-right"><DeleteButton id={update.id} action={deleteAction} /></TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={9} text="Nenhuma publicação nesta visualização." />}
          </TableBody>
        </Table>
      </div>
      <TablePagination page={page} totalPages={totalPages} count={updates.length} onPage={setPage} />
    </section>
  );
}

// ─── Private helpers ──────────────────────────────────────────────────────────
function ListSummary({
  title,
  description,
  metrics,
  actions,
}: {
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
        {metrics.map((metric) => (
          <span key={metric.label} className="inline-flex items-baseline gap-1">
            <span className="font-semibold text-slate-950">{metric.value}</span> {metric.label}
          </span>
        ))}
        {actions}
      </div>
    </div>
  );
}

function EmptyTableRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-slate-500">
        {text}
      </TableCell>
    </TableRow>
  );
}
