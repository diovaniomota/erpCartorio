import { AlertTriangle, CheckCircle2, Clock, Copy, Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getContasFinanceiras } from "@/modules/financeiro/queries";

export default async function BoletosPage() {
  const todos = await getContasFinanceiras();
  const boletos = todos.filter((c) => c.codigo_barras);

  const pendentes = boletos.filter((b) => !["paga", "cancelada"].includes(b.status));
  const pagos     = boletos.filter((b) => b.status === "paga");
  const vencidos  = boletos.filter((b) => b.status === "vencida");
  const totalPendente = pendentes.reduce((s, b) => s + b.valor, 0);

  const hoje = new Date();
  const em7dias = new Date();
  em7dias.setDate(hoje.getDate() + 7);
  const vencendoEm7 = pendentes.filter((b) => {
    const d = new Date(b.data_vencimento);
    return d >= hoje && d <= em7dias;
  }).length;

  return (
    <>
      <PageHeader title="Boletos" description="Boletos com código de barras, vencimentos e situação de pagamento." />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Boletos pendentes" value={String(pendentes.length)} sub={formatCurrency(totalPendente) + " em aberto"} icon={Receipt} tone="info" />
        <KPICard label="Vencendo em 7 dias" value={String(vencendoEm7)} sub="Atenção urgente" icon={Clock} tone={vencendoEm7 > 0 ? "warning" : "success"} />
        <KPICard label="Vencidos" value={String(vencidos.length)} sub="Regularizar" icon={AlertTriangle} tone={vencidos.length > 0 ? "danger" : "success"} />
        <KPICard label="Pagos" value={String(pagos.length)} sub={boletos.length + " no total"} icon={CheckCircle2} tone="success" />
      </div>

      {/* Tabela de boletos */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Controle</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Lista de boletos</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{boletos.length} registros</span>
        </div>

        {boletos.length ? (
          <div className="divide-y divide-slate-100">
            {boletos.map((boleto) => {
              const isVencido = boleto.status === "vencida";
              const isPago = boleto.status === "paga";
              return (
                <div key={boleto.id} className={cn(
                  "grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-5 py-4 transition-colors hover:bg-slate-50/50",
                  isVencido && "bg-red-50/30",
                )}>
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-slate-900">{boleto.descricao}</p>
                      {isPago && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                      {isVencido && <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="max-w-xs truncate rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">
                        {boleto.codigo_barras}
                      </code>
                      <Copy className="h-3 w-3 shrink-0 text-slate-300" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Vencimento: <strong className={cn("font-medium", isVencido ? "text-red-600" : "text-slate-600")}>{formatDate(boleto.data_vencimento)}</strong></span>
                      {boleto.fornecedor_nome && <span>· {boleto.fornecedor_nome}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2">
                    <p className={cn("text-base font-bold tabular-nums", isPago ? "text-emerald-700" : isVencido ? "text-red-700" : "text-slate-900")}>
                      {formatCurrency(boleto.valor)}
                    </p>
                    <StatusBadge status={boleto.status} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Receipt className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Nenhum boleto cadastrado</p>
            <p className="text-xs text-slate-400">Boletos aparecem quando uma conta tem código de barras.</p>
          </div>
        )}
      </section>
    </>
  );
}

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

function KPICard({ label, value, sub, icon: Icon, tone }: {
  label: string; value: string; sub?: string; icon: React.ComponentType<{ className?: string }>; tone: Tone;
}) {
  const config: Record<Tone, { text: string; border: string }> = {
    success: { text: "text-emerald-700", border: "border-l-emerald-500" },
    warning: { text: "text-amber-700",   border: "border-l-amber-500" },
    danger:  { text: "text-red-700",     border: "border-l-red-500" },
    info:    { text: "text-blue-700",    border: "border-l-blue-500" },
    neutral: { text: "text-slate-600",   border: "border-l-slate-300" },
  };
  const c = config[tone];
  return (
    <div className={cn("rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4", c.border)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", c.text)} />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      </div>
      <p className={cn("mt-3 text-2xl font-bold leading-none tabular-nums", c.text)}>{value}</p>
      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
