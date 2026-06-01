import {
  BarChart3,
  Building2,
  Landmark,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { SEM_CATEGORIA } from "@/lib/constants";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { getContasFinanceiras, getLivroCaixa } from "@/modules/financeiro/queries";
import { cn, formatCurrency } from "@/lib/utils";

export default async function FinanceiroRelatoriosPage() {
  await requirePermission("ver_relatorios");
  const [contas, caixa] = await Promise.all([getContasFinanceiras(), getLivroCaixa()]);

  const despesas  = contas.filter((c) => c.tipo === "pagar");
  const receitas  = contas.filter((c) => c.tipo === "receber");
  const pagas     = contas.filter((c) => c.status === "paga");
  const vencidas  = contas.filter((c) => c.status === "vencida");
  const saldoCaixa = caixa.reduce((s, m) => s + m.valor * (["entrada", "ajuste"].includes(m.tipo) ? 1 : -1), 0);
  const totalDespesas = despesas.reduce((s, c) => s + c.valor, 0);
  const totalReceitas = receitas.reduce((s, c) => s + c.valor, 0);
  const resultado = totalReceitas - totalDespesas;

  const porCategoria = Object.entries(
    despesas.reduce<Record<string, number>>((acc, c) => {
      const cat = c.categoria_nome ?? SEM_CATEGORIA;
      acc[cat] = (acc[cat] ?? 0) + c.valor;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, valor]) => ({ id: categoria, categoria, valor }));

  const porFornecedor = Object.entries(
    despesas.reduce<Record<string, number>>((acc, c) => {
      const forn = c.fornecedor_nome ?? "Sem fornecedor";
      acc[forn] = (acc[forn] ?? 0) + c.valor;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([fornecedor, valor]) => ({ id: fornecedor, fornecedor, valor }));

  const kpis = [
    { label: "Total de despesas",  value: formatCurrency(totalDespesas), icon: TrendingDown, tone: "warning" as const, sub: `${despesas.length} contas a pagar` },
    { label: "Total de receitas",  value: formatCurrency(totalReceitas), icon: TrendingUp,   tone: "success" as const, sub: `${receitas.length} entradas` },
    { label: "Resultado financeiro",value: formatCurrency(resultado),   icon: BarChart3,    tone: (resultado >= 0 ? "success" : "danger") as "success" | "danger", sub: resultado >= 0 ? "Superávit" : "Déficit" },
    { label: "Saldo do caixa",     value: formatCurrency(saldoCaixa),  icon: Landmark,     tone: (saldoCaixa >= 0 ? "success" : "danger") as "success" | "danger", sub: "Livro caixa" },
    { label: "Contas pagas",       value: String(pagas.length),        icon: ReceiptText,  tone: "success" as const, sub: "Liquidadas" },
    { label: "Contas vencidas",    value: String(vencidas.length),     icon: ReceiptText,  tone: (vencidas.length > 0 ? "danger" : "success") as "success" | "danger", sub: "Em atraso" },
  ];

  type Tone = "success" | "warning" | "danger" | "info" | "neutral";
  const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
    success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
    warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
    danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
    info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500" },
    neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
  };

  return (
    <>
      <PageHeader
        title="Relatórios financeiros"
        description="Visão consolidada de despesas, receitas, fluxo de caixa e fornecedores."
      />

      {/* KPI grid — 3 columns on wide screens */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const c = toneConf[kpi.tone];
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={cn("rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4", c.border)}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{kpi.label}</p>
                <Icon className={cn("h-4 w-4 shrink-0", c.icon)} aria-hidden="true" />
              </div>
              <p className={cn("mt-3 text-xl font-bold tabular-nums", c.text)}>{kpi.value}</p>
              <p className="mt-1.5 text-xs text-slate-400">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Breakdown tables */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Despesas por categoria */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Análise</p>
              <h2 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                Despesas por categoria
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {porCategoria.length} categorias
            </span>
          </div>
          <div className="p-4">
            <DataTable
              data={porCategoria}
              columns={[
                { key: "categoria", label: "Categoria" },
                { key: "valor", label: "Valor", format: "currency" },
              ]}
              exportable
              exportFilename="despesas-por-categoria"
              exportTitle="Despesas por categoria"
            />
          </div>
        </section>

        {/* Despesas por fornecedor */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Análise</p>
              <h2 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
                <Building2 className="h-4 w-4 text-blue-500" />
                Fornecedores mais pagos
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {porFornecedor.length} fornecedores
            </span>
          </div>
          <div className="p-4">
            <DataTable
              data={porFornecedor}
              columns={[
                { key: "fornecedor", label: "Fornecedor" },
                { key: "valor", label: "Valor", format: "currency" },
              ]}
              exportable
              exportFilename="despesas-por-fornecedor"
              exportTitle="Despesas por fornecedor"
            />
          </div>
        </section>
      </div>

      {/* Fluxo de caixa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Extrato</p>
            <h2 className="mt-0.5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <Landmark className="h-4 w-4 text-slate-400" />
              Fluxo de caixa
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {caixa.length} lançamentos
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={caixa as unknown as Record<string, unknown>[]}
            columns={[
              { key: "data_movimento", label: "Data", format: "date" },
              { key: "descricao", label: "Descrição" },
              { key: "tipo", label: "Tipo", format: "status" },
              { key: "forma_pagamento", label: "Pagamento" },
              { key: "valor", label: "Valor", format: "currency" },
            ]}
            exportable
            exportFilename="fluxo-de-caixa"
            exportTitle="Fluxo de caixa"
          />
        </div>
      </section>
    </>
  );
}
