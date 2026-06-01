import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const rowPalette = [
  { dot: "bg-blue-600", bar: "bg-blue-600", rail: "bg-blue-50", text: "text-blue-700", hex: "#2563eb" },
  { dot: "bg-teal-600", bar: "bg-teal-600", rail: "bg-teal-50", text: "text-teal-700", hex: "#0f766e" },
  { dot: "bg-amber-600", bar: "bg-amber-600", rail: "bg-amber-50", text: "text-amber-700", hex: "#d97706" },
  { dot: "bg-violet-600", bar: "bg-violet-600", rail: "bg-violet-50", text: "text-violet-700", hex: "#7c3aed" },
  { dot: "bg-red-600", bar: "bg-red-600", rail: "bg-red-50", text: "text-red-700", hex: "#dc2626" },
  { dot: "bg-slate-500", bar: "bg-slate-500", rail: "bg-slate-100", text: "text-slate-700", hex: "#64748b" },
];

type ChartDatum = { name: string; value: number };
type ValueFormat = "count" | "currency";
type BlockTone = "teal" | "blue" | "amber" | "violet" | "slate";

type DistributionBlockProps = {
  eyebrow: string;
  title: string;
  data: ChartDatum[];
  icon: LucideIcon;
  tone: BlockTone;
  valueFormat?: ValueFormat;
  featured?: boolean;
};

const blockToneClass: Record<
  BlockTone,
  {
    icon: string;
    value: string;
    accent: string;
  }
> = {
  teal: {
    icon: "border-teal-100 bg-teal-50 text-teal-700",
    value: "text-teal-700",
    accent: "bg-teal-600",
  },
  blue: {
    icon: "border-blue-100 bg-blue-50 text-blue-700",
    value: "text-blue-700",
    accent: "bg-blue-600",
  },
  amber: {
    icon: "border-amber-100 bg-amber-50 text-amber-700",
    value: "text-amber-700",
    accent: "bg-amber-600",
  },
  violet: {
    icon: "border-violet-100 bg-violet-50 text-violet-700",
    value: "text-violet-700",
    accent: "bg-violet-600",
  },
  slate: {
    icon: "border-slate-200 bg-slate-100 text-slate-700",
    value: "text-slate-700",
    accent: "bg-slate-600",
  },
};

export function DashboardCharts({
  despesasPorCategoria,
  contasPorStatus,
  tarefasPorPrioridade,
  funcionariosPorStatus,
  contratosPorStatus,
}: {
  despesasPorCategoria: ChartDatum[];
  contasPorStatus: ChartDatum[];
  tarefasPorPrioridade: ChartDatum[];
  funcionariosPorStatus: ChartDatum[];
  contratosPorStatus: ChartDatum[];
}) {
  const leituraTotal =
    despesasPorCategoria.length +
    contasPorStatus.length +
    tarefasPorPrioridade.length +
    funcionariosPorStatus.length +
    contratosPorStatus.length;
  const despesasTotal = sumValues(despesasPorCategoria);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200/80 bg-white px-5 py-4 shadow-soft">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-teal-100 bg-teal-50 text-teal-700 shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Distribuições</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Leitura por categoria e status</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Comparativo consolidado de despesas, contas, tarefas, equipe e contratos.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 xl:self-center">
            <SummaryMetric label="Despesas" value={formatCurrency(despesasTotal)} />
            <SummaryMetric label="Séries" value="5" />
            <SummaryMetric label="Leituras" value={String(leituraTotal)} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(440px,1.02fr)]">
        <DistributionBlock
          eyebrow="Financeiro"
          title="Despesas por categoria"
          data={despesasPorCategoria}
          icon={WalletCards}
          tone="teal"
          valueFormat="currency"
          featured
        />
        <div className="grid gap-4 md:grid-cols-2">
          <DistributionBlock eyebrow="Contas" title="Status financeiro" data={contasPorStatus} icon={CreditCard} tone="blue" />
          <DistributionBlock eyebrow="Tarefas" title="Prioridades" data={tarefasPorPrioridade} icon={ClipboardList} tone="amber" />
          <DistributionBlock eyebrow="RH" title="Status da equipe" data={funcionariosPorStatus} icon={UsersRound} tone="violet" />
          <DistributionBlock eyebrow="Contratos" title="Carteira contratual" data={contratosPorStatus} icon={BriefcaseBusiness} tone="slate" />
        </div>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200/80 bg-slate-50/70 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function DistributionBlock({
  eyebrow,
  title,
  data,
  icon: Icon,
  tone,
  valueFormat = "count",
  featured = false,
}: DistributionBlockProps) {
  const total = sumValues(data);
  const limitedData = data.slice(0, featured ? 8 : 5);
  const toneClass = blockToneClass[tone];

  if (featured) {
    return (
      <section className="min-w-0 self-start rounded-lg border border-slate-200/80 bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-lg border", toneClass.icon)}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
              <h3 className="mt-1 text-base font-semibold text-slate-950">{title}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Total</p>
            <p className={cn("mt-1 whitespace-nowrap text-base font-semibold", toneClass.value)}>{formatValue(total, valueFormat)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex items-center justify-center">
            <div className="grid h-40 w-40 rounded-full p-3 shadow-inner" style={{ background: buildConicGradient(limitedData) }}>
              <div className="grid h-full w-full place-items-center rounded-full bg-white text-center shadow-soft">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Categorias</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-950">{limitedData.length}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="min-w-0 space-y-3">
            {limitedData.length ? (
              limitedData.map((item, index) => (
                <DistributionRow
                  key={item.name}
                  item={item}
                  total={total}
                  valueFormat={valueFormat}
                  color={rowPalette[index % rowPalette.length]}
                  showPercent
                />
              ))
            ) : (
              <div className="py-4 text-sm text-slate-500">Sem dados para exibir.</div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-lg border border-slate-200/80 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg border", toneClass.icon)}>
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-slate-950">{title}</h3>
            <span className={cn("mt-3 block h-1 w-12 rounded-full", toneClass.accent)} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Total</p>
          <p className={cn("mt-1 whitespace-nowrap text-sm font-semibold", toneClass.value)}>{formatValue(total, valueFormat)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {limitedData.length ? (
          limitedData.map((item, index) => (
            <DistributionRow
              key={item.name}
              item={item}
              total={total}
              valueFormat={valueFormat}
              color={rowPalette[index % rowPalette.length]}
              compact
            />
          ))
        ) : (
          <div className="py-4 text-sm text-slate-500">Sem dados para exibir.</div>
        )}
      </div>
    </section>
  );
}

function DistributionRow({
  item,
  total,
  valueFormat,
  color,
  compact = false,
  showPercent = false,
}: {
  item: ChartDatum;
  total: number;
  valueFormat: ValueFormat;
  color: (typeof rowPalette)[number];
  compact?: boolean;
  showPercent?: boolean;
}) {
  const percent = total > 0 ? (item.value / total) * 100 : 0;

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-[minmax(0,1fr)_3rem]" : "grid-cols-[minmax(0,1fr)_7rem]")}>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", color.dot)} />
            <span className="truncate text-sm font-semibold text-slate-700">{item.name}</span>
          </span>
          {showPercent ? <span className={cn("text-xs font-semibold", color.text)}>{formatPercent(percent)}</span> : null}
        </div>
        <div className={cn("mt-2 h-2 overflow-hidden rounded-full", color.rail)}>
          <span className={cn("block h-full rounded-full", color.bar)} style={{ width: `${Math.max(percent, item.value > 0 ? 4 : 0)}%` }} />
        </div>
      </div>
      <div className="text-right text-sm font-semibold text-slate-950">{formatValue(item.value, valueFormat)}</div>
    </div>
  );
}

function sumValues(data: ChartDatum[]) {
  return data.reduce((sum, item) => sum + item.value, 0);
}

function buildConicGradient(data: ChartDatum[]) {
  const total = sumValues(data);
  if (!total) return "#e2e8f0";

  let cursor = 0;
  const segments = data.map((item, index) => {
    const start = cursor;
    cursor += (item.value / total) * 360;
    return `${rowPalette[index % rowPalette.length].hex} ${start}deg ${cursor}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatValue(value: number, valueFormat: ValueFormat) {
  return valueFormat === "currency" ? formatCurrency(value) : String(value);
}
