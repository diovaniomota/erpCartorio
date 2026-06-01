import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldOff,
  Users,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createLgpdIncidente, deleteLgpdIncidente } from "@/modules/lgpd/actions";
import { getLgpdIncidentes } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "teal" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  teal:    { text: "text-teal-700",    border: "border-l-teal-500",    icon: "text-teal-500",    dot: "bg-teal-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

const riscoBadge: Record<string, string> = {
  crítico: "bg-red-100 text-red-800 border border-red-200",
  alto:    "bg-orange-100 text-orange-800 border border-orange-200",
  médio:   "bg-amber-100 text-amber-800 border border-amber-200",
  baixo:   "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

export default async function LgpdIncidentesPage() {
  const [incidentes, funcionarios] = await Promise.all([getLgpdIncidentes(), getFuncionarios()]);

  const criticos   = incidentes.filter((i) => i.risco === "crítico");
  const altos      = incidentes.filter((i) => i.risco === "alto");
  const emAnalise  = incidentes.filter((i) => i.status === "em análise" || i.status === "em andamento");
  const encerrados = incidentes.filter((i) => i.status === "encerrado").length;
  const pessoasAfetadas = incidentes.reduce((s, i) => s + Number(i.pessoas_afetadas ?? 0), 0);

  const abertosAltoRisco = [...criticos, ...altos].filter((i) => i.status !== "encerrado");

  const fields: EntityField[] = [
    { name: "data_incidente",    label: "Data do incidente",  type: "date",   required: true },
    { name: "tipo_dado_afetado", label: "Tipo de dado afetado", required: true },
    { name: "pessoas_afetadas",  label: "Pessoas afetadas",   type: "number" },
    { name: "risco", label: "Risco", type: "select", defaultValue: "médio", options: ["baixo", "médio", "alto", "crítico"].map((value) => ({ label: value, value })) },
    { name: "responsavel_id", label: "Responsável", type: "select", options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "status",            label: "Status",             defaultValue: "em análise" },
    { name: "descricao",         label: "Descrição",          type: "textarea", required: true },
    { name: "medidas_tomadas",   label: "Medidas tomadas",    type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Incidentes de segurança"
        description="Registro de incidentes com dados pessoais, nível de risco, medidas tomadas e status de resolução."
        actions={<EntityFormDialog title="Novo incidente" fields={fields} action={createLgpdIncidente} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total de incidentes" value={String(incidentes.length)} sub={`${encerrados} encerrado${encerrados !== 1 ? "s" : ""}`} icon={ShieldAlert} tone="teal" />
        <KPICard label="Críticos/alto risco" value={String(criticos.length + altos.length)} sub={abertosAltoRisco.length > 0 ? `${abertosAltoRisco.length} em aberto` : "Nenhum em aberto"} icon={AlertTriangle} tone={abertosAltoRisco.length > 0 ? "danger" : "teal"} />
        <KPICard label="Em análise" value={String(emAnalise.length)} sub="Requerem ação" icon={ShieldOff} tone={emAnalise.length > 0 ? "warning" : "success"} />
        <KPICard label="Pessoas afetadas" value={String(pessoasAfetadas)} sub="Total acumulado" icon={Users} tone={pessoasAfetadas > 0 ? "danger" : "neutral"} />
      </div>

      {/* Incidentes de alto risco em aberto */}
      {abertosAltoRisco.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-white">
          <div className="flex items-center gap-3 border-b border-red-100 bg-red-50/60 px-5 py-4">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">Alto risco</p>
              <h2 className="text-base font-semibold text-red-900">Incidentes críticos/alto risco abertos</h2>
            </div>
            <span className="ml-auto rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
              {abertosAltoRisco.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {abertosAltoRisco.map((i) => (
              <div key={i.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{i.descricao}</p>
                      <p className="text-xs text-slate-500">{i.tipo_dado_afetado}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", riscoBadge[i.risco] ?? riscoBadge.médio)}>
                        {i.risco}
                      </span>
                      <StatusBadge status={i.status} />
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 text-xs text-slate-400">
                    <span>{formatDate(i.data_incidente)}</span>
                    {i.pessoas_afetadas ? <span className="text-red-600 font-medium">{i.pessoas_afetadas} pessoa{Number(i.pessoas_afetadas) !== 1 ? "s" : ""} afetada{Number(i.pessoas_afetadas) !== 1 ? "s" : ""}</span> : null}
                    {i.responsavel_nome && <span>{i.responsavel_nome}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Breakdown por risco */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Crítico", count: criticos.length,                                           tone: "danger"  as Tone },
          { label: "Alto",    count: altos.length,                                              tone: "warning" as Tone },
          { label: "Médio",   count: incidentes.filter((i) => i.risco === "médio").length,      tone: "teal"    as Tone },
          { label: "Baixo",   count: incidentes.filter((i) => i.risco === "baixo").length,      tone: "success" as Tone },
        ].map((s) => {
          const c = toneConf[s.tone];
          return (
            <div key={s.label} className="flex flex-col items-center rounded-xl border border-slate-200 bg-white py-4">
              <span className={cn("text-3xl font-bold tabular-nums", c.text)}>{s.count}</span>
              <span className="mt-1 text-xs text-slate-500">{s.label}</span>
              <span className={cn("mt-2 h-1 w-8 rounded-full", c.dot)} />
            </div>
          );
        })}
      </div>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todos os incidentes</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {incidentes.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={incidentes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "data_incidente",    label: "Data",        format: "date" },
              { key: "descricao",         label: "Descrição" },
              { key: "tipo_dado_afetado", label: "Dado afetado" },
              { key: "pessoas_afetadas",  label: "Pessoas" },
              { key: "risco",             label: "Risco",       format: "priority" },
              { key: "status",            label: "Status",      format: "status" },
            ]}
            deleteAction={deleteLgpdIncidente}
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
