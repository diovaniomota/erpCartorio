import {
  Clock,
  Clock3,
  FileCheck2,
  LogIn,
  LogOut,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createPonto, deletePonto } from "@/modules/rh/actions";
import { getFuncionarios, getPonto } from "@/modules/rh/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "violet" | "success" | "warning" | "danger" | "info" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  violet:  { text: "text-violet-700",  border: "border-l-violet-500",  icon: "text-violet-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

const tipoLabel: Record<string, string> = {
  entrada:       "Entrada",
  saida_almoco:  "Saída almoço",
  retorno_almoco:"Retorno almoço",
  saida:         "Saída final",
};

export default async function PontoPage() {
  const [ponto, funcionarios] = await Promise.all([getPonto(), getFuncionarios()]);

  const hoje             = new Date().toISOString().slice(0, 10);
  const marcacoesHoje    = ponto.filter((p) => p.registrado_em?.startsWith(hoje));
  const ajustesPendentes = ponto.filter((p) => p.ajuste_manual && !p.aprovado_em);
  const funcComPonto     = new Set(marcacoesHoje.map((p) => p.funcionario_id)).size;

  const fields: EntityField[] = [
    { name: "funcionario_id", label: "Funcionário", type: "select", required: true, options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "tipo", label: "Marcação", type: "select", defaultValue: "entrada", options: [
      { label: "Entrada",         value: "entrada" },
      { label: "Saída almoço",    value: "saida_almoco" },
      { label: "Retorno almoço",  value: "retorno_almoco" },
      { label: "Saída final",     value: "saida" },
    ]},
    { name: "registrado_em", label: "Data e hora", type: "datetime-local", required: true },
    { name: "ajuste_manual", label: "Ajuste manual", type: "checkbox" },
    { name: "justificativa_ajuste", label: "Justificativa do ajuste", type: "textarea" },
    { name: "observacao", label: "Observação", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Controle de ponto"
        description="Marcações de entrada, almoço, retorno, saída final, ajustes manuais e aprovação administrativa."
        actions={<EntityFormDialog title="Nova marcação" fields={fields} action={createPonto} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KPICard label="Marcações hoje" value={String(marcacoesHoje.length)} sub={`${funcComPonto} funcionário${funcComPonto !== 1 ? "s" : ""}`} icon={Clock3} tone="violet" />
        <KPICard label="Com ponto hoje" value={String(funcComPonto)} sub={`de ${funcionarios.filter((f) => f.status === "ativo").length} ativos`} icon={UserCheck} tone="success" />
        <KPICard label="Ajustes pendentes" value={String(ajustesPendentes.length)} sub={ajustesPendentes.length > 0 ? "Aguardando aprovação" : "Tudo aprovado"} icon={FileCheck2} tone={ajustesPendentes.length > 0 ? "warning" : "success"} />
      </div>

      {/* Feed de hoje */}
      {marcacoesHoje.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Hoje</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Marcações de hoje</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {marcacoesHoje.slice(0, 10).map((p) => {
              const isEntrada = ["entrada", "retorno_almoco"].includes(p.tipo);
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    isEntrada ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500",
                  )}>
                    {isEntrada ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{p.funcionario_nome ?? "—"}</p>
                    <p className="text-xs text-slate-500">{tipoLabel[p.tipo] ?? p.tipo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{formatDate(p.registrado_em)}</p>
                    {p.ajuste_manual && !p.aprovado_em && (
                      <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Ajuste pendente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {marcacoesHoje.length > 10 && (
              <p className="px-5 py-3 text-xs text-slate-400">+ {marcacoesHoje.length - 10} marcações — veja a tabela abaixo</p>
            )}
          </div>
        </section>
      )}

      {/* Ajustes pendentes */}
      {ajustesPendentes.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3 border-b border-amber-100 px-5 py-4">
            <Clock className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Pendente</p>
              <h2 className="text-base font-semibold text-amber-900">Ajustes aguardando aprovação</h2>
            </div>
            <span className="ml-auto rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {ajustesPendentes.length}
            </span>
          </div>
          <div className="divide-y divide-amber-100">
            {ajustesPendentes.map((p) => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-amber-900">{p.funcionario_nome ?? "—"}</p>
                  <StatusBadge status={p.tipo} />
                </div>
                <p className="mt-0.5 text-xs text-amber-700">{formatDate(p.registrado_em)}</p>
                {p.justificativa_ajuste && (
                  <p className="mt-1 line-clamp-1 text-xs text-amber-600">{p.justificativa_ajuste}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todas as marcações</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {ponto.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={ponto as unknown as Record<string, unknown>[]}
            columns={[
              { key: "funcionario_nome",    label: "Funcionário" },
              { key: "tipo",                label: "Tipo",        format: "status" },
              { key: "registrado_em",       label: "Data",        format: "date" },
              { key: "ajuste_manual",       label: "Ajuste",      format: "boolean" },
              { key: "justificativa_ajuste",label: "Justificativa" },
              { key: "observacao",          label: "Observação" },
            ]}
            deleteAction={deletePonto}
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
