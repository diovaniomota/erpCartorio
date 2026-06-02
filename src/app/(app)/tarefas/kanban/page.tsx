import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Flame,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { PageHeader } from "@/components/shared/page-header";
import { createTask, moveTask } from "@/modules/tarefas/actions";
import { getTaskBoards, getTaskColumns, getTasks } from "@/modules/tarefas/queries";
import { getFuncionarios } from "@/modules/rh/queries";
import { cn } from "@/lib/utils";

type Tone = "indigo" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  indigo:  { text: "text-indigo-700",  border: "border-l-indigo-500",  icon: "text-indigo-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function KanbanPage() {
  const [boards, columns, tasks, funcionarios] = await Promise.all([
    getTaskBoards(),
    getTaskColumns(),
    getTasks(),
    getFuncionarios(),
  ]);

  const board       = boards[0];
  const firstColumn = columns[0];

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const abertas    = tasks.filter((t) => t.status !== "concluída" && t.status !== "cancelada");
  const atrasadas  = tasks.filter((t) => t.data_prazo && new Date(t.data_prazo) < hoje && t.status !== "concluída" && t.status !== "cancelada");
  const urgentes   = tasks.filter((t) => t.prioridade === "urgente" && t.status !== "concluída");
  const concluidas = tasks.filter((t) => t.status === "concluída" && t.data_conclusao?.startsWith(new Date().toISOString().slice(0, 10)));

  const fields: EntityField[] = [
    { name: "board_id",      label: "Quadro",      type: "select", required: true, defaultValue: board?.id, options: boards.map((b) => ({ label: b.nome, value: b.id })) },
    { name: "column_id",     label: "Coluna",      type: "select", required: true, defaultValue: firstColumn?.id, options: columns.map((c) => ({ label: c.nome, value: c.id })) },
    { name: "titulo",        label: "Título",      required: true },
    { name: "categoria",     label: "Categoria",   required: true, defaultValue: "administrativo" },
    { name: "prioridade",    label: "Prioridade",  type: "select", defaultValue: "média", options: ["baixa", "média", "alta", "urgente"].map((value) => ({ label: value, value })) },
    { name: "status",        label: "Status",      type: "select", defaultValue: "aberta", options: ["aberta", "em andamento", "aguardando terceiro", "em revisão", "concluída", "cancelada", "atrasada"].map((value) => ({ label: value, value })) },
    { name: "responsavel_id",label: "Responsável", type: "select", options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "data_inicio",   label: "Início",      type: "date" },
    { name: "data_prazo",    label: "Prazo",       type: "date" },
    { name: "vinculo_tipo",  label: "Vínculo tipo" },
    { name: "vinculo_id",    label: "Vínculo ID" },
    { name: "ordem",         label: "Ordem",       type: "number", defaultValue: 1 },
    { name: "descricao",     label: "Descrição",   type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Tarefas · Quadro Kanban"
        description="Cartões administrativos com prioridade, responsável, prazo, checklist e vínculos. Arraste para mover entre colunas."
        actions={<EntityFormDialog title="Nova tarefa" fields={fields} action={createTask} />}
      />

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Em aberto" value={String(abertas.length)} sub={`${tasks.length} total`} icon={ListTodo} tone="indigo" />
        <KPICard label="Atrasadas" value={String(atrasadas.length)} sub={atrasadas.length > 0 ? "Prazo vencido" : "Tudo em dia"} icon={AlertTriangle} tone={atrasadas.length > 0 ? "danger" : "success"} />
        <KPICard label="Urgentes" value={String(urgentes.length)} sub="Prioridade máxima" icon={Flame} tone={urgentes.length > 0 ? "warning" : "neutral"} />
        <KPICard label="Concluídas hoje" value={String(concluidas.length)} sub={`${tasks.filter((t) => t.status === "concluída").length} total concluídas`} icon={CheckCircle2} tone="success" />
      </div>

      {/* Alerta de atrasadas */}
      {atrasadas.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-red-700">
              {atrasadas.length} tarefa{atrasadas.length !== 1 ? "s" : ""} com prazo vencido
            </p>
            <p className="mt-0.5 truncate text-xs text-red-500">
              {atrasadas.slice(0, 3).map((t) => t.titulo).join(" · ")}
              {atrasadas.length > 3 ? ` + ${atrasadas.length - 3} mais` : ""}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            {atrasadas.length}
          </span>
        </div>
      )}

      {/* Kanban board — full width, horizontal scroll */}
      <div className="-mx-4 px-4 lg:-mx-7 lg:px-7">
        <KanbanBoard columns={columns} tasks={tasks} moveAction={moveTask} />
      </div>
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
