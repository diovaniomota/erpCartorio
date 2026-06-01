import { ArrowDownCircle, ArrowUpCircle, BookOpen, RotateCcw } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { createLivroCaixa } from "@/modules/financeiro/actions";
import { getLivroCaixa } from "@/modules/financeiro/queries";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const fields: EntityField[] = [
  { name: "descricao", label: "Descrição", required: true },
  { name: "tipo", label: "Tipo", type: "select", defaultValue: "entrada", options: ["entrada", "saída", "transferência", "ajuste", "estorno"].map((value) => ({ label: value, value })) },
  { name: "valor", label: "Valor", type: "money", required: true },
  { name: "data_movimento", label: "Data", type: "date", required: true },
  { name: "forma_pagamento", label: "Forma de pagamento", type: "select", defaultValue: "pix", options: ["dinheiro", "pix", "transferência", "cartão", "boleto", "cheque"].map((value) => ({ label: value, value })) },
  { name: "observacoes", label: "Observações", type: "textarea" },
];

const tipoMeta: Record<string, { color: string; bg: string; sinal: "+" | "−" }> = {
  entrada:       { color: "text-emerald-700", bg: "bg-emerald-50",  sinal: "+" },
  ajuste:        { color: "text-blue-700",    bg: "bg-blue-50",     sinal: "+" },
  "saída":       { color: "text-red-700",     bg: "bg-red-50",      sinal: "−" },
  estorno:       { color: "text-amber-700",   bg: "bg-amber-50",    sinal: "−" },
  transferência: { color: "text-slate-600",   bg: "bg-slate-100",   sinal: "+" },
};

export default async function LivroCaixaPage() {
  const movimentos = await getLivroCaixa();

  // Calculate running balance
  const sorted = [...movimentos].sort((a, b) => new Date(a.data_movimento).getTime() - new Date(b.data_movimento).getTime());
  let saldoCorrido = 0;
  const comSaldo = sorted.map((m) => {
    const sinal = ["entrada", "ajuste"].includes(m.tipo) ? 1 : -1;
    saldoCorrido += Number(m.valor ?? 0) * sinal;
    return { ...m, saldo_pos: saldoCorrido };
  }).reverse(); // most recent first for display

  const saldoAtual = saldoCorrido;
  const totalEntradas = movimentos.filter((m) => ["entrada", "ajuste"].includes(m.tipo)).reduce((s, m) => s + Number(m.valor ?? 0), 0);
  const totalSaidas   = movimentos.filter((m) => ["saída", "estorno"].includes(m.tipo)).reduce((s, m) => s + Number(m.valor ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Livro caixa"
        description="Entradas, saídas, transferências, ajustes e estornos com saldo corrido."
        actions={<EntityFormDialog title="Novo lançamento" fields={fields} action={createLivroCaixa} />}
      />

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-l-4 border-emerald-200 border-l-emerald-500 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Entradas</p>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-emerald-700">{formatCurrency(totalEntradas)}</p>
        </div>
        <div className="rounded-xl border border-l-4 border-red-200 border-l-red-500 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Saídas</p>
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums text-red-700">{formatCurrency(totalSaidas)}</p>
        </div>
        <div className={cn(
          "rounded-xl border border-l-4 bg-white px-5 py-4",
          saldoAtual >= 0 ? "border-emerald-200 border-l-emerald-500" : "border-red-200 border-l-red-500",
        )}>
          <div className="flex items-center gap-2">
            <BookOpen className={cn("h-4 w-4", saldoAtual >= 0 ? "text-emerald-500" : "text-red-500")} />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Saldo atual</p>
          </div>
          <p className={cn("mt-3 text-2xl font-bold tabular-nums", saldoAtual >= 0 ? "text-emerald-700" : "text-red-700")}>
            {formatCurrency(saldoAtual)}
          </p>
        </div>
      </div>

      {/* Tabela de movimentos com saldo corrido */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Extrato</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Movimentos — mais recentes primeiro</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {movimentos.length} lançamentos
          </span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5">
          <span className="w-8" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Descrição</p>
          <p className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Data</p>
          <p className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Valor</p>
          <p className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Saldo</p>
        </div>

        {comSaldo.length ? (
          <div className="divide-y divide-slate-100">
            {comSaldo.map((mov) => {
              const meta = tipoMeta[mov.tipo] ?? tipoMeta["transferência"];
              const TipoIcon = ["entrada", "ajuste"].includes(mov.tipo) ? ArrowUpCircle : ["saída", "estorno"].includes(mov.tipo) ? ArrowDownCircle : RotateCcw;
              return (
                <div key={mov.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/50">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", meta.bg)}>
                    <TipoIcon className={cn("h-3.5 w-3.5", meta.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{mov.descricao}</p>
                    {mov.forma_pagamento && (
                      <p className="text-xs capitalize text-slate-400">{mov.forma_pagamento}</p>
                    )}
                  </div>
                  <p className="whitespace-nowrap text-right text-xs text-slate-400">{formatDate(mov.data_movimento)}</p>
                  <p className={cn("whitespace-nowrap text-right text-sm font-semibold tabular-nums", meta.color)}>
                    {meta.sinal}{formatCurrency(Number(mov.valor ?? 0))}
                  </p>
                  <p className={cn(
                    "whitespace-nowrap text-right text-sm font-bold tabular-nums",
                    mov.saldo_pos >= 0 ? "text-emerald-700" : "text-red-700",
                  )}>
                    {formatCurrency(mov.saldo_pos)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <BookOpen className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Nenhum lançamento registrado</p>
          </div>
        )}
      </section>
    </>
  );
}
