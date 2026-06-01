import {
  AlertTriangle,
  Database,
  FileText,
  GraduationCap,
  Inbox,
  ServerCog,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  getLgpdFornecedoresOperadores,
  getLgpdIncidentes,
  getLgpdInventarioDados,
  getLgpdPoliticas,
  getLgpdSolicitacoes,
  getLgpdTreinamentos,
} from "@/modules/lgpd/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "teal" | "success" | "warning" | "danger" | "info" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  teal:    { text: "text-teal-700",    border: "border-l-teal-500",    icon: "text-teal-500",    dot: "bg-teal-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500",    dot: "bg-blue-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

const riscoCor: Record<string, string> = {
  crítico: "text-red-700 bg-red-50 border-red-200",
  alto:    "text-orange-700 bg-orange-50 border-orange-200",
  médio:   "text-amber-700 bg-amber-50 border-amber-200",
  baixo:   "text-emerald-700 bg-emerald-50 border-emerald-200",
};

export default async function LgpdPage() {
  const [incidentes, solicitacoes, inventario, operadores, politicas, treinamentos] = await Promise.all([
    getLgpdIncidentes(),
    getLgpdSolicitacoes(),
    getLgpdInventarioDados(),
    getLgpdFornecedoresOperadores(),
    getLgpdPoliticas(),
    getLgpdTreinamentos(),
  ]);

  const hoje = new Date();
  const solAbertas   = solicitacoes.filter((s) => s.status !== "concluída");
  const solAtrasadas = solicitacoes.filter((s) => new Date(s.prazo_resposta) < hoje && s.status !== "concluída");
  const incCriticos  = incidentes.filter((i) => ["crítico", "alto"].includes(i.risco) && i.status !== "encerrado");
  const politicasVencendo = politicas.filter((p) => {
    if (!p.validade_em) return false;
    const diff = new Date(p.validade_em).getTime() - hoje.getTime();
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <>
      <PageHeader
        title="Painel LGPD"
        description="Visão geral de conformidade: incidentes, solicitações de titulares, políticas, treinamentos e operadores."
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Processos mapeados" value={String(inventario.length)} sub="Inventário de dados" icon={Database} tone="teal" />
        <KPICard label="Solicitações abertas" value={String(solAbertas.length)} sub={solAtrasadas.length > 0 ? `${solAtrasadas.length} atrasada${solAtrasadas.length !== 1 ? "s" : ""}` : "Em dia"} icon={Inbox} tone={solAtrasadas.length > 0 ? "danger" : "warning"} />
        <KPICard label="Incidentes" value={String(incidentes.length)} sub={incCriticos.length > 0 ? `${incCriticos.length} crítico${incCriticos.length !== 1 ? "s" : ""}/alto risco` : "Nenhum crítico"} icon={ShieldAlert} tone={incCriticos.length > 0 ? "danger" : "teal"} />
        <KPICard label="Operadores ativos" value={String(operadores.filter((o) => o.status === "ativo").length)} sub={`${operadores.length} total`} icon={ServerCog} tone="success" />
      </div>

      {/* Alertas + status geral */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Compliance status */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Conformidade</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Status geral</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
            {[
              { label: "Processos",  count: inventario.length,                             tone: "teal" as Tone },
              { label: "Políticas",  count: politicas.filter((p) => p.status === "ativa").length, tone: "success" as Tone },
              { label: "Treinamentos",count: treinamentos.length,                          tone: "info" as Tone },
              { label: "Sol. abertas",count: solAbertas.length,                            tone: solAtrasadas.length > 0 ? "danger" as Tone : "warning" as Tone },
              { label: "Incidentes", count: incidentes.length,                             tone: incCriticos.length > 0 ? "danger" as Tone : "neutral" as Tone },
              { label: "Operadores", count: operadores.filter((o) => o.status === "ativo").length, tone: "success" as Tone },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 py-4">
                <span className={cn("text-3xl font-bold tabular-nums", toneConf[s.tone].text)}>{s.count}</span>
                <span className="mt-1 text-xs text-slate-500">{s.label}</span>
                <span className={cn("mt-2 h-1 w-8 rounded-full", toneConf[s.tone].dot)} />
              </div>
            ))}
          </div>
        </section>

        {/* Alertas críticos */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Atenção</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Alertas</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {solAtrasadas.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{solAtrasadas.length} solicitação{solAtrasadas.length !== 1 ? "ões" : ""} atrasada{solAtrasadas.length !== 1 ? "s" : ""}</p>
                  <p className="text-xs text-slate-400">Prazo de resposta ultrapassado</p>
                </div>
              </div>
            )}
            {incCriticos.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3">
                <ShieldAlert className="h-4 w-4 shrink-0 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700">{incCriticos.length} incidente{incCriticos.length !== 1 ? "s" : ""} de alto risco</p>
                  <p className="text-xs text-slate-400">Crítico ou alto — requer ação</p>
                </div>
              </div>
            )}
            {politicasVencendo.length > 0 && (
              <div className="flex items-center gap-3 px-5 py-3">
                <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-700">{politicasVencendo.length} política{politicasVencendo.length !== 1 ? "s" : ""} vencendo</p>
                  <p className="text-xs text-slate-400">Nos próximos 30 dias</p>
                </div>
              </div>
            )}
            {solAtrasadas.length === 0 && incCriticos.length === 0 && politicasVencendo.length === 0 && (
              <div className="flex items-center gap-3 px-5 py-4">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <p className="text-sm text-emerald-700">Nenhum alerta crítico no momento</p>
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Treinamentos</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-slate-600">Total realizados</span>
              <span className="text-sm font-bold text-teal-700">{treinamentos.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Com comprovante</span>
              <span className="text-sm font-bold text-slate-600">{treinamentos.filter((t) => t.comprovante_url).length}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Incidentes recentes */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Segurança</p>
            <h2 className="text-base font-semibold text-slate-900">Incidentes recentes</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {incidentes.length}
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={incidentes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "data_incidente",     label: "Data",        format: "date" },
              { key: "descricao",          label: "Descrição" },
              { key: "tipo_dado_afetado",  label: "Dado afetado" },
              { key: "responsavel_nome",   label: "Responsável" },
              { key: "risco",              label: "Risco",       format: "priority" },
              { key: "status",             label: "Status",      format: "status" },
            ]}
          />
        </div>
      </section>
    </>
  );
}

function KPICard({ label, value, sub, icon: Icon, tone }: {
  label: string; value: string; sub?: string; icon: LucideIcon; tone: Tone;
}) {
  const c = toneConf[tone];
  return (
    <div className={cn("rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4", c.border)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", c.icon)} aria-hidden="true" />
      </div>
      <p className={cn("mt-3 text-2xl font-bold leading-none tabular-nums", c.text)}>{value}</p>
      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
