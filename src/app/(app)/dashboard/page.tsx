import {
  Activity,
  AlertTriangle,
  Banknote,
  BellRing,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  CircleAlert,
  FileWarning,
  PackageSearch,
  Receipt,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDashboardData } from "@/modules/dashboard/queries";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type StatRef = {
  title: string;
  value: number;
  format?: "currency";
};

type QueueTone = "danger" | "warning" | "info" | "success" | "neutral";

const toneClass: Record<QueueTone, string> = {
  danger: "text-red-700",
  warning: "text-amber-700",
  info: "text-blue-700",
  success: "text-emerald-700",
  neutral: "text-slate-700",
};

const dotClass: Record<QueueTone, string> = {
  danger: "bg-red-600",
  warning: "bg-amber-600",
  info: "bg-blue-600",
  success: "bg-emerald-600",
  neutral: "bg-slate-400",
};

const headerSignalClass: Record<QueueTone, string> = {
  danger: "border-red-300/20 bg-red-500/10",
  warning: "border-amber-300/20 bg-amber-500/10",
  info: "border-sky-300/20 bg-sky-500/10",
  success: "border-emerald-300/20 bg-emerald-500/10",
  neutral: "border-slate-300/20 bg-white/[0.06]",
};

const headerIconClass: Record<QueueTone, string> = {
  danger: "border-red-200/20 text-red-200",
  warning: "border-amber-200/20 text-amber-200",
  info: "border-sky-200/20 text-sky-200",
  success: "border-emerald-200/20 text-emerald-200",
  neutral: "border-slate-200/20 text-slate-200",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  const statByTitle = new Map(data.stats.map((stat) => [stat.title, stat]));

  const hoje = statByTitle.get("Contas vencendo hoje");
  const vencidas = statByTitle.get("Contas vencidas");
  const boletos = statByTitle.get("Boletos em aberto");
  const caixa = statByTitle.get("Saldo do caixa");
  const despesas = statByTitle.get("Despesas em aberto");
  const receitas = statByTitle.get("Receitas em aberto");
  const contratos = statByTitle.get("Contratos vencendo");
  const ativos = statByTitle.get("Funcionários ativos");
  const ausentes = statByTitle.get("Funcionários ausentes");
  const atrasadas = statByTitle.get("Tarefas atrasadas");
  const comunicados = statByTitle.get("Comunicados não lidos");
  const lgpd = statByTitle.get("Pendências LGPD");
  const inventario = statByTitle.get("Inventário em manutenção");

  const kpis = [
    { label: "Caixa interno", value: formatStat(caixa), icon: Banknote, tone: "success" as const },
    { label: "Receitas do mês", value: formatStat(receitas), icon: TrendingUp, tone: "success" as const },
    { label: "Despesas em aberto", value: formatStat(despesas), icon: TrendingDown, tone: "neutral" as const },
    { label: "Boletos abertos", value: formatStat(boletos), icon: Receipt, tone: "info" as const },
    { label: "Contas vencidas", value: formatStat(vencidas), icon: FileWarning, tone: "danger" as const },
    { label: "Tarefas atrasadas", value: formatStat(atrasadas), icon: ClipboardList, tone: "warning" as const },
  ];

  const queue = [
    {
      area: "Financeiro",
      item: "Contas vencidas",
      detail: "Regularizar pagamentos fora do prazo.",
      value: formatStat(vencidas),
      tone: "danger" as const,
      icon: Receipt,
    },
    {
      area: "Financeiro",
      item: "Vencem hoje",
      detail: "Conferir boletos e anexar comprovantes.",
      value: formatStat(hoje),
      tone: "warning" as const,
      icon: AlertTriangle,
    },
    {
      area: "Tarefas",
      item: "Demandas atrasadas",
      detail: "Reabrir prioridade com responsáveis.",
      value: formatStat(atrasadas),
      tone: "warning" as const,
      icon: ClipboardList,
    },
    {
      area: "Contratos",
      item: "Vencendo em 30 dias",
      detail: "Solicitar renovação ou encerramento.",
      value: formatStat(contratos),
      tone: "info" as const,
      icon: BriefcaseBusiness,
    },
    {
      area: "LGPD",
      item: "Pendências abertas",
      detail: "Revisar incidentes e providências.",
      value: formatStat(lgpd),
      tone: "danger" as const,
      icon: ShieldAlert,
    },
    {
      area: "Central oficial",
      item: "Comunicados novos",
      detail: "Triar itens oficiais não lidos.",
      value: formatStat(comunicados),
      tone: "info" as const,
      icon: BellRing,
    },
    {
      area: "Inventário",
      item: "Em manutenção",
      detail: "Acompanhar itens patrimoniais parados.",
      value: formatStat(inventario),
      tone: "neutral" as const,
      icon: PackageSearch,
    },
  ];

  const equipe = [
    { label: "Funcionários ativos", value: formatStat(ativos), tone: "success" as const },
    { label: "Ausentes", value: formatStat(ausentes), tone: "warning" as const },
    { label: "Fornecedores cadastrados", value: String(data.fornecedores.length), tone: "neutral" as const },
  ];

  const criticalTotal = Number(vencidas?.value ?? 0) + Number(atrasadas?.value ?? 0) + Number(lgpd?.value ?? 0);
  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());
  const nextEvent = data.agenda[0];
  const headerSignals = [
    {
      label: "Hoje",
      value: capitalize(todayLabel),
      helper: "Dia operacional",
      icon: CalendarDays,
      tone: "info" as const,
    },
    {
      label: "Alertas",
      value: String(criticalTotal),
      helper: criticalTotal === 1 ? "Item pede atenção" : "Itens pedem atenção",
      icon: CircleAlert,
      tone: criticalTotal > 0 ? ("danger" as const) : ("success" as const),
    },
    {
      label: "Agenda",
      value: String(data.agenda.length),
      helper: nextEvent ? `Próximo: ${formatDate(nextEvent.data_inicio)}` : "Sem eventos próximos",
      icon: Activity,
      tone: "success" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="grid gap-6 overflow-hidden rounded-lg bg-[linear-gradient(135deg,#08111f_0%,#111827_58%,#0f766e_130%)] px-5 py-6 text-white shadow-raised xl:grid-cols-[minmax(0,1fr)_560px]">
          <div className="min-w-0 self-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
              Operação conectada
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Dashboard administrativo</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Mesa de controle</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Prioridades do dia, dinheiro, prazos e riscos em uma leitura única para operação administrativa.
            </p>
          </div>
          <div className="grid gap-3 self-stretch sm:grid-cols-3">
            {headerSignals.map((signal) => (
              <HeaderSignal key={signal.label} {...signal} />
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <MetricCell key={kpi.label} {...kpi} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
          <PanelHeader
            eyebrow="Mesa de controle"
            title="Fila de decisão"
            description="O que precisa de decisão ou acompanhamento antes de virar rotina."
          />
          <div className="overflow-x-auto p-3">
            <div className="min-w-[760px] space-y-2 text-sm">
              <div className="grid grid-cols-[12rem_minmax(0,1fr)_minmax(0,1.6fr)_4rem] gap-4 rounded-md bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                <span>Área</span>
                <span>Pendência</span>
                <span>Leitura</span>
                <span className="text-right">Qtd.</span>
              </div>
              {queue.map((row) => (
                <div
                  key={`${row.area}-${row.item}`}
                  className="grid grid-cols-[12rem_minmax(0,1fr)_minmax(0,1.6fr)_4rem] items-center gap-4 rounded-lg border border-slate-100 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-200 hover:bg-slate-50"
                >
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <row.icon className={cn("h-4 w-4", toneClass[row.tone])} />
                    {row.area}
                  </span>
                  <p className="font-semibold text-slate-950">{row.item}</p>
                  <p className="text-slate-500">{row.detail}</p>
                  <p className={cn("text-right text-lg font-semibold", toneClass[row.tone])}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
            <PanelHeader eyebrow="Agenda" title="Próximos eventos" />
            <div className="space-y-2 p-3">
              {data.agenda.length ? (
                data.agenda.slice(0, 6).map((event) => (
                  <div key={event.id} className="grid grid-cols-[7rem_1fr] gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {formatDate(event.data_inicio)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{event.titulo}</p>
                      <p className="mt-1 text-xs text-slate-500">{event.tipo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-sm text-slate-500">Nenhum evento previsto.</div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
            <PanelHeader eyebrow="Equipe" title="Capacidade interna" />
            <div className="space-y-2 p-3">
              {equipe.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <span className={cn("h-1.5 w-1.5 rounded-full", dotClass[item.tone])} />
                    {item.label}
                  </span>
                  <span className={cn("text-base font-semibold", toneClass[item.tone])}>{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <ActionList
          title="Tarefas atrasadas"
          eyebrow="Execução"
          icon={ClipboardList}
          empty="Nenhuma tarefa atrasada."
          items={data.tarefasAtrasadas.slice(0, 5).map((task) => ({
            id: task.id,
            title: task.titulo,
            description: task.data_prazo ? `Prazo ${formatDate(task.data_prazo)}` : "Sem prazo definido",
            status: task.status,
          }))}
        />
        <ActionList
          title="Comunicados importantes"
          eyebrow="Central oficial"
          icon={BellRing}
          empty="Nenhum comunicado importante."
          items={data.comunicadosImportantes.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.titulo,
            description: item.resumo ?? item.orgao,
            status: item.relevancia,
          }))}
        />
      </section>

      <DashboardCharts {...data.charts} />
    </div>
  );
}

function HeaderSignal({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: QueueTone;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        headerSignalClass[tone],
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md border bg-black/10", headerIconClass[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold leading-tight text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-300">{helper}</p>
    </div>
  );
}

function MetricCell({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: QueueTone;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-4 py-4 shadow-soft">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
        <p className={cn("mt-1 text-xl font-semibold leading-none", toneClass[tone])}>{value}</p>
      </div>
      <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-50 text-slate-400">
        <Icon className="h-4 w-4" />
      </span>
    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-slate-200/80 bg-[linear-gradient(90deg,#f8fafc_0%,#ffffff_100%)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
  );
}

function ActionList({
  title,
  eyebrow,
  icon: Icon,
  items,
  empty,
}: {
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  items: { id: string; title: string; description?: string | null; status: string }[];
  empty: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-soft">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 bg-[linear-gradient(90deg,#f8fafc_0%,#ffffff_100%)] px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">{title}</h2>
        </div>
        <Icon className="mt-1 h-4 w-4 text-slate-400" />
      </div>
      <div className="space-y-2 p-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
              <div className="min-w-0">
                <p className="line-clamp-1 text-sm font-semibold text-slate-950">{item.title}</p>
                {item.description ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p> : null}
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))
        ) : (
          <div className="py-4 text-sm text-slate-500">{empty}</div>
        )}
      </div>
    </section>
  );
}

function formatStat(stat?: StatRef) {
  if (!stat) return "0";
  return stat.format === "currency" ? formatCurrency(stat.value) : String(stat.value);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
