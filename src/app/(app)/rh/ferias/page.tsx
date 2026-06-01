import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Plane,
  Timer,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createFerias, deleteFerias } from "@/modules/rh/actions";
import { getFerias, getFuncionarios } from "@/modules/rh/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "violet" | "success" | "warning" | "danger" | "info" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  violet:  { text: "text-violet-700",  border: "border-l-violet-500",  icon: "text-violet-500",  dot: "bg-violet-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500",    dot: "bg-blue-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

export default async function FeriasPage() {
  const [ferias, funcionarios] = await Promise.all([getFerias(), getFuncionarios()]);

  const emAndamento = ferias.filter((f) => f.status === "em andamento");
  const aprovadas   = ferias.filter((f) => f.status === "aprovada");
  const pendentes   = ferias.filter((f) => f.status === "pendente");
  const concluidas  = ferias.filter((f) => f.status === "concluída").length;
  const canceladas  = ferias.filter((f) => f.status === "cancelada").length;

  const ativas = [...emAndamento, ...aprovadas, ...pendentes];

  const fields: EntityField[] = [
    { name: "funcionario_id", label: "Funcionário", type: "select", required: true, options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "periodo_aquisitivo_inicio", label: "Período aquisitivo início", type: "date", required: true },
    { name: "periodo_aquisitivo_fim",    label: "Período aquisitivo fim",    type: "date", required: true },
    { name: "data_inicio",               label: "Início das férias",         type: "date", required: true },
    { name: "data_fim",                  label: "Fim das férias",            type: "date", required: true },
    { name: "status", label: "Status", type: "select", defaultValue: "pendente", options: [
      "pendente", "aprovada", "reprovada", "em andamento", "concluída", "cancelada",
    ].map((value) => ({ label: value, value })) },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Férias"
        description="Controle de período aquisitivo, solicitações, aprovação e calendário de afastamentos."
        actions={<EntityFormDialog title="Nova solicitação de férias" fields={fields} action={createFerias} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Em andamento" value={String(emAndamento.length)} sub="Em gozo agora" icon={Plane} tone="info" />
        <KPICard label="Aprovadas" value={String(aprovadas.length)} sub="Agendadas" icon={CalendarCheck2} tone="success" />
        <KPICard label="Pendentes" value={String(pendentes.length)} sub={pendentes.length > 0 ? "Aguardando aprovação" : "Nenhuma pendente"} icon={Timer} tone={pendentes.length > 0 ? "warning" : "success"} />
        <KPICard label="Concluídas" value={String(concluidas)} sub={`${canceladas} cancelada${canceladas !== 1 ? "s" : ""}`} icon={CheckCircle2} tone="violet" />
      </div>

      {/* Pipeline de ativas */}
      {ativas.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pipeline</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Férias em aberto</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {ativas.map((f) => {
              const tone: Tone = f.status === "em andamento" ? "info" : f.status === "aprovada" ? "success" : "warning";
              const c = toneConf[tone];
              return (
                <div key={f.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", `bg-${tone === "info" ? "blue" : tone === "success" ? "emerald" : "amber"}-50`)}>
                    <Plane className={cn("h-4 w-4", c.icon)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{f.funcionario_nome ?? "—"}</p>
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {formatDate(f.data_inicio)} → {formatDate(f.data_fim)}
                      </span>
                      {f.periodo_aquisitivo_inicio && (
                        <span>Aquisitivo: {formatDate(f.periodo_aquisitivo_inicio)} → {formatDate(f.periodo_aquisitivo_fim)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Status breakdown */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Em andamento", count: emAndamento.length, tone: "info"    as Tone, icon: Plane },
          { label: "Aprovadas",    count: aprovadas.length,   tone: "success" as Tone, icon: CalendarCheck2 },
          { label: "Pendentes",    count: pendentes.length,   tone: "warning" as Tone, icon: Timer },
          { label: "Canceladas",   count: canceladas,         tone: "neutral" as Tone, icon: XCircle },
        ].map((s) => {
          const c = toneConf[s.tone];
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Icon className={cn("h-4 w-4 shrink-0", c.icon)} />
              <span className="flex-1 text-sm text-slate-600">{s.label}</span>
              <span className={cn("text-lg font-bold tabular-nums", c.text)}>{s.count}</span>
            </div>
          );
        })}
      </div>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todas as férias</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {ferias.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={ferias as unknown as Record<string, unknown>[]}
            columns={[
              { key: "funcionario_nome",          label: "Funcionário" },
              { key: "periodo_aquisitivo_inicio",  label: "Aquisitivo início", format: "date" },
              { key: "periodo_aquisitivo_fim",     label: "Aquisitivo fim",    format: "date" },
              { key: "data_inicio",                label: "Início",            format: "date" },
              { key: "data_fim",                   label: "Fim",               format: "date" },
              { key: "status",                     label: "Status",            format: "status" },
            ]}
            deleteAction={deleteFerias}
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
