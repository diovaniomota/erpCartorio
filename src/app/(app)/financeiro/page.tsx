import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Receipt,
  TrendingDown,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getContasFinanceiras, getLivroCaixa } from "@/modules/financeiro/queries";

type MetricTone = "success" | "warning" | "danger" | "info" | "neutral";

const metricToneClass: Record<
  MetricTone,
  {
    icon: string;
    value: string;
    rail: string;
    bar: string;
  }
> = {
  success: {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    value: "text-emerald-700",
    rail: "bg-emerald-50",
    bar: "bg-emerald-600",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    value: "text-amber-700",
    rail: "bg-amber-50",
    bar: "bg-amber-600",
  },
  danger: {
    icon: "bg-red-50 text-red-700 ring-red-100",
    value: "text-red-700",
    rail: "bg-red-50",
    bar: "bg-red-600",
  },
  info: {
    icon: "bg-blue-50 text-blue-700 ring-blue-100",
    value: "text-blue-700",
    rail: "bg-blue-50",
    bar: "bg-blue-600",
  },
  neutral: {
    icon: "bg-slate-100 text-slate-700 ring-slate-200",
    value: "text-slate-700",
    rail: "bg-slate-100",
    bar: "bg-slate-500",
  },
};

export default async function FinanceiroPage() {
  const [contas, livroCaixa] = await Promise.all([getContasFinanceiras(), getLivroCaixa()]);
  const despesas = contas.filter((conta) => conta.tipo === "pagar").reduce((sum, conta) => sum + conta.valor, 0);
  const receitas = contas.filter((conta) => conta.tipo === "receber").reduce((sum, conta) => sum + conta.valor, 0);
  const boletos = contas.filter((conta) => conta.codigo_barras && conta.status !== "paga").length;
  const saldo = livroCaixa.reduce((sum, mov) => sum + mov.valor * (mov.tipo === "entrada" ? 1 : -1), 0);
  const contasVencidas = contas.filter((conta) => conta.status === "vencida");
  const contasAbertas = contas.filter((conta) => conta.status === "aberta");
  const contasAgendadas = contas.filter((conta) => conta.status === "agendada");
  const totalVencido = contasVencidas.reduce((sum, conta) => sum + conta.valor, 0);
  const resultadoPrevisto = receitas - despesas;
  const maiorFluxo = Math.max(despesas, receitas, saldo, 1);
  const proximasContas = [...contas]
    .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
    .slice(0, 4);

  const metrics = [
    {
      label: "Despesas abertas",
      value: formatCurrency(despesas),
      detail: `${contas.filter((conta) => conta.tipo === "pagar").length} contas a pagar`,
      icon: TrendingDown,
      tone: "warning" as const,
      progress: (despesas / maiorFluxo) * 100,
    },
    {
      label: "Receitas programadas",
      value: formatCurrency(receitas),
      detail: `${contas.filter((conta) => conta.tipo === "receber").length} entradas previstas`,
      icon: TrendingUp,
      tone: "success" as const,
      progress: (receitas / maiorFluxo) * 100,
    },
    {
      label: "Boletos em aberto",
      value: String(boletos),
      detail: "Com código de barras pendente",
      icon: Receipt,
      tone: "info" as const,
      progress: boletos > 0 ? 62 : 0,
    },
    {
      label: "Saldo do caixa",
      value: formatCurrency(saldo),
      detail: "Livro caixa interno",
      icon: Banknote,
      tone: "success" as const,
      progress: (saldo / maiorFluxo) * 100,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
        <div className="grid gap-6 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_48%,#eff6ff_100%)] p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-w-0 gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <WalletCards className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Financeiro</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Financeiro administrativo</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Contas, boletos, pagamentos e caixa interno com leitura rápida de risco e previsão.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <FlowPill label="Vencidas" value={String(contasVencidas.length)} tone="danger" />
                <FlowPill label="Abertas" value={String(contasAbertas.length)} tone="info" />
                <FlowPill label="Agendadas" value={String(contasAgendadas.length)} tone="success" />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 text-white shadow-raised">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Saldo operacional</p>
                <p className="mt-2 text-3xl font-semibold">{formatCurrency(saldo)}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-emerald-200">
                <CircleDollarSign className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <HeroSignal label="Resultado previsto" value={formatCurrency(resultadoPrevisto)} tone={resultadoPrevisto >= 0 ? "success" : "danger"} />
              <HeroSignal label="Vencido" value={formatCurrency(totalVencido)} tone={totalVencido > 0 ? "danger" : "success"} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <FinanceMetric key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-[linear-gradient(90deg,#f8fafc_0%,#ffffff_100%)] px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Últimas contas</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Registros financeiros</h2>
            </div>
            <CreditCard className="mt-1 h-5 w-5 text-slate-400" />
          </div>
          <div className="p-4">
            <DataTable
              data={contas as unknown as Record<string, unknown>[]}
              columns={[
                { key: "descricao", label: "Descrição" },
                { key: "tipo", label: "Tipo" },
                { key: "valor", label: "Valor", format: "currency" },
                { key: "data_vencimento", label: "Vencimento", format: "date" },
                { key: "status", label: "Status", format: "status" },
              ]}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
            <SideHeader icon={CalendarClock} eyebrow="Agenda financeira" title="Próximos vencimentos" />
            <div className="space-y-2 p-3">
              {proximasContas.map((conta) => (
                <div key={conta.id} className="rounded-lg border border-slate-100 bg-white px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{conta.descricao}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(conta.data_vencimento)}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-950">{formatCurrency(conta.valor)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-slate-500">{conta.tipo}</span>
                    <StatusBadge status={conta.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
            <SideHeader icon={AlertTriangle} eyebrow="Atenção" title="Risco financeiro" />
            <div className="space-y-2 p-3">
              <RiskRow label="Contas vencidas" value={String(contasVencidas.length)} tone="danger" />
              <RiskRow label="Valor vencido" value={formatCurrency(totalVencido)} tone={totalVencido > 0 ? "danger" : "success"} />
              <RiskRow label="Boletos pendentes" value={String(boletos)} tone={boletos > 0 ? "warning" : "success"} />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function FlowPill({ label, value, tone }: { label: string; value: string; tone: MetricTone }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", metricToneClass[tone].value)}>{value}</p>
    </div>
  );
}

function HeroSignal({ label, value, tone }: { label: string; value: string; tone: MetricTone }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className={cn("mt-1 truncate text-sm font-semibold", tone === "danger" ? "text-red-200" : "text-emerald-200")}>{value}</p>
    </div>
  );
}

function FinanceMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  progress,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: MetricTone;
  progress: number;
}) {
  const toneClass = metricToneClass[tone];

  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
          <p className={cn("mt-2 text-2xl font-semibold leading-none", toneClass.value)}>{value}</p>
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1", toneClass.icon)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
      <div className={cn("mt-4 h-2 overflow-hidden rounded-full", toneClass.rail)}>
        <span className={cn("block h-full rounded-full", toneClass.bar)} style={{ width: `${Math.min(Math.max(progress, 4), 100)}%` }} />
      </div>
    </section>
  );
}

function SideHeader({ icon: Icon, eyebrow, title }: { icon: LucideIcon; eyebrow: string; title: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-[linear-gradient(90deg,#f8fafc_0%,#ffffff_100%)] px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
      </div>
      <Icon className="mt-1 h-4 w-4 text-slate-400" />
    </div>
  );
}

function RiskRow({ label, value, tone }: { label: string; value: string; tone: MetricTone }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={cn("text-sm font-semibold", metricToneClass[tone].value)}>{value}</span>
    </div>
  );
}
