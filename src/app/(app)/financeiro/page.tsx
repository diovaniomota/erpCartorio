import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Receipt,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getContasFinanceiras, getLivroCaixa } from "@/modules/financeiro/queries";

export default async function FinanceiroPage() {
  const [contas, livroCaixa] = await Promise.all([getContasFinanceiras(), getLivroCaixa()]);

  const ativas = contas.filter((c) => !c.deleted_at);
  const despesasTotal = ativas.filter((c) => c.tipo === "pagar" && !["paga", "cancelada"].includes(c.status)).reduce((s, c) => s + c.valor, 0);
  const receitasTotal = ativas.filter((c) => c.tipo === "receber" && !["recebida", "cancelada"].includes(c.status)).reduce((s, c) => s + c.valor, 0);
  const vencidas = ativas.filter((c) => c.status === "vencida");
  const boletos = ativas.filter((c) => c.codigo_barras && c.status !== "paga");
  const saldo = livroCaixa.reduce((s, m) => s + m.valor * (["entrada", "ajuste"].includes(m.tipo) ? 1 : -1), 0);
  const totalVencido = vencidas.reduce((s, c) => s + c.valor, 0);
  const resultado = receitasTotal - despesasTotal;

  const proximas = [...ativas]
    .filter((c) => ["aberta", "agendada"].includes(c.status))
    .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())
    .slice(0, 6);

  const porStatus = [
    { label: "Abertas", count: ativas.filter((c) => c.status === "aberta").length, tone: "info" as const },
    { label: "Agendadas", count: ativas.filter((c) => c.status === "agendada").length, tone: "neutral" as const },
    { label: "Vencidas", count: vencidas.length, tone: "danger" as const },
    { label: "Pagas", count: ativas.filter((c) => c.status === "paga").length, tone: "success" as const },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro administrativo" description="Contas, boletos, pagamentos e caixa com leitura rápida de risco e previsão." />

      {/* KPI principal */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Saldo do caixa"
          value={formatCurrency(saldo)}
          sub="Livro caixa interno"
          icon={Banknote}
          tone={saldo >= 0 ? "success" : "danger"}
        />
        <KPICard
          label="Despesas em aberto"
          value={formatCurrency(despesasTotal)}
          sub={`${ativas.filter((c) => c.tipo === "pagar" && !["paga", "cancelada"].includes(c.status)).length} contas a pagar`}
          icon={TrendingDown}
          tone="warning"
        />
        <KPICard
          label="Receitas previstas"
          value={formatCurrency(receitasTotal)}
          sub={`${ativas.filter((c) => c.tipo === "receber" && !["recebida", "cancelada"].includes(c.status)).length} entradas`}
          icon={TrendingUp}
          tone="success"
        />
        <KPICard
          label="Resultado previsto"
          value={formatCurrency(resultado)}
          sub={resultado >= 0 ? "Resultado positivo" : "Deficit previsto"}
          icon={resultado >= 0 ? CheckCircle2 : CircleAlert}
          tone={resultado >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Status e boletos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {porStatus.map((s) => (
          <StatusPill key={s.label} label={s.label} count={s.count} tone={s.tone} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Próximos vencimentos */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <SectionHeader icon={CalendarClock} eyebrow="Agenda financeira" title="Próximos vencimentos" />
          <div className="divide-y divide-slate-100">
            {proximas.length ? proximas.map((conta) => (
              <div key={conta.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  conta.tipo === "receber" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
                )}>
                  {conta.tipo === "receber"
                    ? <TrendingUp className="h-3.5 w-3.5" />
                    : <TrendingDown className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{conta.descricao}</p>
                  <p className="text-xs text-slate-400">{formatDate(conta.data_vencimento)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(conta.valor)}</p>
                  <div className="mt-1 flex justify-end">
                    <StatusBadge status={conta.status} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma conta pendente.</p>
            )}
          </div>
        </section>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Saldo operacional */}
          <section className="rounded-xl border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Saldo operacional</p>
            <p className={cn("mt-3 text-4xl font-bold tracking-tight", saldo >= 0 ? "text-emerald-300" : "text-red-300")}>
              {formatCurrency(saldo)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/[0.06] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Resultado previsto</p>
                <p className={cn("mt-1 text-sm font-bold", resultado >= 0 ? "text-emerald-300" : "text-red-300")}>
                  {formatCurrency(resultado)}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.06] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total vencido</p>
                <p className={cn("mt-1 text-sm font-bold", totalVencido > 0 ? "text-red-300" : "text-emerald-300")}>
                  {formatCurrency(totalVencido)}
                </p>
              </div>
            </div>
          </section>

          {/* Alerta de risco */}
          <section className="rounded-xl border border-slate-200 bg-white">
            <SectionHeader icon={AlertTriangle} eyebrow="Alertas" title="Situação financeira" />
            <div className="space-y-1.5 p-3">
              <RiskRow
                label="Contas vencidas"
                value={String(vencidas.length)}
                tone={vencidas.length > 0 ? "danger" : "success"}
              />
              <RiskRow
                label="Valor em atraso"
                value={formatCurrency(totalVencido)}
                tone={totalVencido > 0 ? "danger" : "success"}
              />
              <RiskRow
                label="Boletos pendentes"
                value={String(boletos.length)}
                tone={boletos.length > 0 ? "warning" : "success"}
                icon={Receipt}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneConfig: Record<Tone, { text: string; bg: string; border: string; dot: string }> = {
  success: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-l-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   bg: "bg-amber-50",   border: "border-l-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     bg: "bg-red-50",     border: "border-l-red-500",     dot: "bg-red-500" },
  info:    { text: "text-blue-700",    bg: "bg-blue-50",    border: "border-l-blue-500",    dot: "bg-blue-500" },
  neutral: { text: "text-slate-600",   bg: "bg-slate-50",   border: "border-l-slate-300",   dot: "bg-slate-400" },
};

function KPICard({ label, value, sub, icon: Icon, tone = "neutral" }: {
  label: string; value: string; sub?: string; icon: LucideIcon; tone?: Tone;
}) {
  const t = toneConfig[tone];
  return (
    <div className={cn("rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4", t.border)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", t.text)} aria-hidden="true" />
      </div>
      <p className={cn("mt-3 text-2xl font-bold leading-none tracking-tight", t.text)}>{value}</p>
      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function StatusPill({ label, count, tone }: { label: string; count: number; tone: Tone }) {
  const t = toneConfig[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", t.dot)} />
      <span className="min-w-0 flex-1 text-sm text-slate-600">{label}</span>
      <span className={cn("text-lg font-bold tabular-nums", t.text)}>{count}</span>
    </div>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title }: { icon: LucideIcon; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{eyebrow}</p>
        <h2 className="mt-0.5 text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <Icon className="h-4 w-4 text-slate-300" aria-hidden="true" />
    </div>
  );
}

function RiskRow({ label, value, tone, icon: Icon }: { label: string; value: string; tone: Tone; icon?: LucideIcon }) {
  const t = toneConfig[tone];
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50">
      {Icon
        ? <Icon className={cn("h-4 w-4 shrink-0", t.text)} aria-hidden="true" />
        : <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", t.dot)} />}
      <span className="flex-1 text-sm text-slate-600">{label}</span>
      <span className={cn("text-sm font-bold tabular-nums", t.text)}>{value}</span>
    </div>
  );
}
