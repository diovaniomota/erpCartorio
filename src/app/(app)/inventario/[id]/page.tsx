import { notFound } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
  Wrench,
  ArrowLeftRight,
} from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getInventarioItem, getInventarioManutencoes, getInventarioMovimentacoes } from "@/modules/inventario/queries";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function InventarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, manutencoes, movimentacoes] = await Promise.all([
    getInventarioItem(id),
    getInventarioManutencoes(),
    getInventarioMovimentacoes(),
  ]);

  if (!item) notFound();

  const itemManutencoes   = manutencoes.filter((m) => m.item_id === id);
  const itemMovimentacoes = movimentacoes.filter((m) => m.item_id === id);

  const garantiaDate   = item.garantia_ate ? new Date(item.garantia_ate) : null;
  const hoje           = new Date();
  const garantiaOk     = garantiaDate ? garantiaDate >= hoje : false;
  const garantiaDias   = garantiaDate
    ? Math.ceil((garantiaDate.getTime() - hoje.getTime()) / 86_400_000)
    : null;

  const custoManutencao = itemManutencoes.reduce((s, m) => s + Number(m.custo ?? 0), 0);

  return (
    <>
      <PageHeader
        title={item.nome}
        description="Ficha patrimonial com dados de compra, garantia, responsável, movimentações e manutenções."
      />

      {/* Hero card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Header strip */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30">
            <Package className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Patrimônio</p>
              <code className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                {item.codigo_patrimonio}
              </code>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">{item.nome}</h2>
          </div>
          <StatusBadge status={item.status} />
        </div>

        {/* Info grid */}
        <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">
          <InfoCell icon={Tag} label="Categoria" value={item.categoria} />
          <InfoCell icon={MapPin} label="Localização" value={item.localizacao} />
          <InfoCell icon={CircleDollarSign} label="Valor de compra" value={formatCurrency(item.valor_compra)} tone="orange" />
          <InfoCell icon={CalendarDays} label="Data de compra" value={formatDate(item.data_compra)} />
          <InfoCell
            icon={ShieldCheck}
            label="Garantia até"
            value={formatDate(item.garantia_ate)}
            sub={
              garantiaDias !== null
                ? garantiaOk
                  ? `Válida — ${garantiaDias} dia${garantiaDias !== 1 ? "s" : ""} restante${garantiaDias !== 1 ? "s" : ""}`
                  : `Expirada há ${Math.abs(garantiaDias)} dia${Math.abs(garantiaDias) !== 1 ? "s" : ""}`
                : undefined
            }
            tone={garantiaDate ? (garantiaOk ? "success" : "danger") : "neutral"}
          />
          <InfoCell icon={Tag} label="Número de série" value={item.numero_serie} />
        </div>

        {item.descricao && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Descrição</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-700">{item.descricao}</p>
          </div>
        )}
      </section>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-orange-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Manutenções</p>
          <p className="mt-3 text-2xl font-bold text-orange-700">{itemManutencoes.length}</p>
          <p className="mt-1 text-xs text-slate-400">
            {itemManutencoes.filter((m) => !["concluída", "cancelada"].includes(m.status)).length} em aberto
          </p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-amber-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Custo em manutenção</p>
          <p className="mt-3 text-2xl font-bold text-amber-700">{formatCurrency(custoManutencao)}</p>
          <p className="mt-1 text-xs text-slate-400">Total acumulado</p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-blue-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Movimentações</p>
          <p className="mt-3 text-2xl font-bold text-blue-700">{itemMovimentacoes.length}</p>
          <p className="mt-1 text-xs text-slate-400">Transferências registradas</p>
        </div>
      </div>

      {/* Manutenções */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Wrench className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="text-base font-semibold text-slate-900">Manutenções</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {itemManutencoes.length}
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={itemManutencoes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "descricao",      label: "Descrição" },
              { key: "fornecedor_nome",label: "Fornecedor" },
              { key: "data_inicio",    label: "Início",  format: "date" },
              { key: "data_fim",       label: "Fim",     format: "date" },
              { key: "custo",          label: "Custo",   format: "currency" },
              { key: "status",         label: "Status",  format: "status" },
            ]}
          />
        </div>
      </section>

      {/* Movimentações */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <ArrowLeftRight className="h-4 w-4 text-blue-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Rastreamento</p>
            <h2 className="text-base font-semibold text-slate-900">Movimentações</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {itemMovimentacoes.length}
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={itemMovimentacoes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "created_at",         label: "Data",    format: "date" },
              { key: "tipo",               label: "Tipo",    format: "status" },
              { key: "localizacao_anterior",label: "Origem" },
              { key: "localizacao_nova",   label: "Destino" },
              { key: "descricao",          label: "Observação" },
            ]}
          />
        </div>
      </section>
    </>
  );
}

type Tone = "success" | "danger" | "warning" | "info" | "orange" | "neutral";

const toneText: Record<Tone, string> = {
  success: "text-emerald-700",
  danger:  "text-red-700",
  warning: "text-amber-700",
  info:    "text-blue-700",
  orange:  "text-orange-700",
  neutral: "text-slate-600",
};

function InfoCell({ icon: Icon, label, value, sub, tone = "neutral" }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneText[tone])} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={cn("mt-1 text-sm font-medium", value ? "text-slate-900" : "text-slate-400")}>
          {value || "—"}
        </p>
        {sub && <p className={cn("mt-0.5 text-xs", toneText[tone])}>{sub}</p>}
      </div>
    </div>
  );
}
