import {
  AlertTriangle,
  CheckCircle2,
  FileHeart,
  FileX2,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createAtestado, deleteAtestado } from "@/modules/rh/actions";
import { getAtestados, getFuncionarios } from "@/modules/rh/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "violet" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  violet:  { text: "text-violet-700",  border: "border-l-violet-500",  icon: "text-violet-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function AtestadosPage() {
  const [atestados, funcionarios] = await Promise.all([getAtestados(), getFuncionarios()]);

  const pendentes  = atestados.filter((a) => a.status === "pendente");
  const aprovados  = atestados.filter((a) => a.status === "aprovado");
  const reprovados = atestados.filter((a) => a.status === "reprovado");
  const diasTotal  = atestados.reduce((s, a) => s + Number(a.quantidade_dias ?? 0), 0);

  const fields: EntityField[] = [
    { name: "funcionario_id", label: "Funcionário", type: "select", required: true, options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "tipo", label: "Tipo", type: "select", defaultValue: "atestado médico", options: [
      "atestado médico", "licença", "falta justificada", "falta injustificada",
      "afastamento INSS", "licença maternidade", "licença paternidade",
    ].map((value) => ({ label: value, value })) },
    { name: "data_inicio",     label: "Início",      type: "date",   required: true },
    { name: "data_fim",        label: "Fim",         type: "date",   required: true },
    { name: "quantidade_dias", label: "Dias",        type: "number", required: true },
    { name: "cid",             label: "CID (opcional)" },
    { name: "status",          label: "Status",      type: "select", defaultValue: "pendente", options: ["pendente", "aprovado", "reprovado"].map((value) => ({ label: value, value })) },
    { name: "documento_url",   label: "URL do documento" },
    { name: "observacoes",     label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Atestados e afastamentos"
        description="Registro, aprovação e reflexo administrativo de atestados médicos e afastamentos."
        actions={<EntityFormDialog title="Novo atestado" fields={fields} action={createAtestado} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total" value={String(atestados.length)} sub={`${diasTotal} dias registrados`} icon={FileHeart} tone="violet" />
        <KPICard label="Pendentes" value={String(pendentes.length)} sub={pendentes.length > 0 ? "Aguardando avaliação" : "Nenhum pendente"} icon={Timer} tone={pendentes.length > 0 ? "warning" : "success"} />
        <KPICard label="Aprovados" value={String(aprovados.length)} sub="Validados" icon={CheckCircle2} tone="success" />
        <KPICard label="Reprovados" value={String(reprovados.length)} sub="Negados" icon={FileX2} tone={reprovados.length > 0 ? "danger" : "neutral"} />
      </div>

      {/* Pipeline de pendentes */}
      {pendentes.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-white">
          <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50/60 px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Atenção</p>
              <h2 className="text-base font-semibold text-amber-900">Atestados pendentes</h2>
            </div>
            <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {pendentes.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendentes.map((a) => (
              <div key={a.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  <FileHeart className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.funcionario_nome ?? "—"}</p>
                      <p className="text-xs text-slate-500">{a.tipo}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 text-xs text-slate-400">
                    <span>{formatDate(a.data_inicio)} → {formatDate(a.data_fim)}</span>
                    <span className="font-medium text-slate-600">{a.quantidade_dias} dia{Number(a.quantidade_dias) !== 1 ? "s" : ""}</span>
                    {a.cid && <span>CID: {a.cid}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resumo por status */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pendentes",  count: pendentes.length,  tone: "warning" as Tone,  icon: Timer },
          { label: "Aprovados",  count: aprovados.length,  tone: "success" as Tone,  icon: CheckCircle2 },
          { label: "Reprovados", count: reprovados.length, tone: "danger"  as Tone,  icon: FileX2 },
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
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todos os atestados</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {atestados.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={atestados as unknown as Record<string, unknown>[]}
            columns={[
              { key: "funcionario_nome", label: "Funcionário" },
              { key: "tipo",             label: "Tipo" },
              { key: "data_inicio",      label: "Início",  format: "date" },
              { key: "data_fim",         label: "Fim",     format: "date" },
              { key: "quantidade_dias",  label: "Dias" },
              { key: "status",           label: "Status",  format: "status" },
            ]}
            deleteAction={deleteAtestado}
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
