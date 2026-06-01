import { ArrowDownCircle, ArrowUpCircle, RotateCcw, Wallet } from "lucide-react";
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
  { name: "forma_pagamento", label: "Forma de pagamento", type: "select", defaultValue: "dinheiro", options: ["dinheiro", "pix", "transferência", "cartão", "boleto", "cheque"].map((value) => ({ label: value, value })) },
  { name: "observacoes", label: "Observações", type: "textarea" },
];

const tipoConfig: Record<string, { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  entrada:      { label: "Entrada",      color: "text-emerald-700", bg: "bg-emerald-50", icon: ArrowUpCircle },
  ajuste:       { label: "Ajuste",       color: "text-blue-700",    bg: "bg-blue-50",    icon: RotateCcw },
  "saída":      { label: "Saída",        color: "text-red-700",     bg: "bg-red-50",     icon: ArrowDownCircle },
  estorno:      { label: "Estorno",      color: "text-amber-700",   bg: "bg-amber-50",   icon: RotateCcw },
  transferência:{ label: "Transferência",color: "text-slate-600",   bg: "bg-slate-50",   icon: RotateCcw },
};

export default async function CaixaPage() {
  const movimentos = await getLivroCaixa();

  const entradas = movimentos.filter((m) => ["entrada", "ajuste"].includes(m.tipo)).reduce((s, m) => s + Number(m.valor ?? 0), 0);
  const saidas   = movimentos.filter((m) => ["saída", "estorno"].includes(m.tipo)).reduce((s, m) => s + Number(m.valor ?? 0), 0);
  const saldo    = entradas - saidas;

  return (
    <>
      <PageHeader
        title="Caixa interno"
        description="Entradas, saídas e saldo do caixa administrativo."
        actions={<EntityFormDialog title="Novo movimento de caixa" fields={fields} action={createLivroCaixa} />}
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-white px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Total de entradas</p>
            <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-4 text-3xl font-bold tabular-nums text-emerald-700">{formatCurrency(entradas)}</p>
          <p className="mt-2 text-xs text-slate-400">
            {movimentos.filter((m) => ["entrada", "ajuste"].includes(m.tipo)).length} movimentos
          </p>
        </div>

        <div className="rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-white px-6 py-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Total de saídas</p>
            <ArrowDownCircle className="h-5 w-5 text-red-400" />
          </div>
          <p className="mt-4 text-3xl font-bold tabular-nums text-red-700">{formatCurrency(saidas)}</p>
          <p className="mt-2 text-xs text-slate-400">
            {movimentos.filter((m) => ["saída", "estorno"].includes(m.tipo)).length} movimentos
          </p>
        </div>

        <div className={cn(
          "rounded-xl border border-l-4 bg-white px-6 py-5",
          saldo >= 0 ? "border-emerald-200 border-l-emerald-500" : "border-red-200 border-l-red-500",
        )}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Saldo disponível</p>
            <Wallet className={cn("h-5 w-5", saldo >= 0 ? "text-emerald-400" : "text-red-400")} />
          </div>
          <p className={cn("mt-4 text-3xl font-bold tabular-nums", saldo >= 0 ? "text-emerald-700" : "text-red-700")}>
            {formatCurrency(saldo)}
          </p>
          <p className="mt-2 text-xs text-slate-400">{movimentos.length} lançamentos registrados</p>
        </div>
      </div>

      {/* Feed de movimentos */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Movimentos do caixa</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {movimentos.length} lançamentos
          </span>
        </div>

        {movimentos.length ? (
          <div className="divide-y divide-slate-100">
            {movimentos.map((mov) => {
              const cfg = tipoConfig[mov.tipo] ?? tipoConfig["transferência"];
              const TipoIcon = cfg.icon;
              const isEntrada = ["entrada", "ajuste"].includes(mov.tipo);
              return (
                <div key={mov.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/50">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", cfg.bg)}>
                    <TipoIcon className={cn("h-4 w-4", cfg.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{mov.descricao}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(mov.data_movimento)}</span>
                      {mov.forma_pagamento && <><span>·</span><span className="capitalize">{mov.forma_pagamento}</span></>}
                    </div>
                  </div>
                  <p className={cn("text-right text-sm font-bold tabular-nums", isEntrada ? "text-emerald-700" : "text-red-700")}>
                    {isEntrada ? "+" : "−"}{formatCurrency(Number(mov.valor ?? 0))}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Wallet className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Nenhum movimento registrado</p>
          </div>
        )}
      </section>
    </>
  );
}
