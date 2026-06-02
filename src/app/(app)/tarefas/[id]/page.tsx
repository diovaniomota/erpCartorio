import { notFound } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Flame,
  Link2,
  Tag,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { getTask } from "@/modules/tarefas/queries";
import { cn, formatDate } from "@/lib/utils";

const priorityBorder: Record<string, string> = {
  urgente: "border-l-red-500",
  alta:    "border-l-orange-500",
  média:   "border-l-amber-400",
  baixa:   "border-l-slate-300",
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo      = task.data_prazo ? new Date(task.data_prazo) : null;
  const isOverdue  = prazo && prazo < hoje && task.status !== "concluída";
  const checkTotal = task.checklist_total ?? 0;
  const checkDone  = task.checklist_done ?? 0;
  const checkPct   = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;

  const pBorder = priorityBorder[task.prioridade] ?? "border-l-slate-300";

  return (
    <>
      <PageHeader
        title={task.titulo}
        description={task.descricao ?? "Detalhes da tarefa administrativa."}
      />

      {/* Hero card */}
      <section className={cn("overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white", pBorder)}>
        {/* Header strip */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Tarefa</p>
              <code className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                {task.categoria}
              </code>
            </div>
            <h2 className="mt-1 truncate text-xl font-semibold text-white">{task.titulo}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PriorityBadge priority={task.prioridade} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">
          <InfoCell icon={User}         label="Responsável" value={task.responsavel_nome} />
          <InfoCell
            icon={CalendarDays}
            label="Prazo"
            value={formatDate(task.data_prazo)}
            sub={isOverdue ? `Atrasada ${Math.abs(Math.ceil((prazo!.getTime() - hoje.getTime()) / 86400000))} dia(s)` : undefined}
            tone={isOverdue ? "danger" : "neutral"}
          />
          <InfoCell icon={CalendarClock} label="Início"     value={formatDate(task.data_inicio)} />
          <InfoCell icon={Tag}           label="Categoria"  value={task.categoria} />
          {task.vinculo_tipo && (
            <InfoCell icon={Link2} label="Vínculo" value={`${task.vinculo_tipo}${task.vinculo_id ? ` · ${task.vinculo_id}` : ""}`} />
          )}
          {task.data_conclusao && (
            <InfoCell icon={CheckSquare} label="Concluída em" value={formatDate(task.data_conclusao)} tone="success" />
          )}
        </div>

        {/* Description */}
        {task.descricao && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Descrição</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{task.descricao}</p>
          </div>
        )}
      </section>

      {/* Checklist progress */}
      {checkTotal > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className={cn("h-4 w-4", checkPct === 100 ? "text-emerald-500" : "text-indigo-500")} />
              <p className="text-sm font-semibold text-slate-900">Checklist</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-bold tabular-nums", checkPct === 100 ? "text-emerald-700" : "text-indigo-700")}>
                {checkDone}/{checkTotal}
              </span>
              <span className="text-xs text-slate-400">{checkPct}%</span>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                checkPct === 100 ? "bg-emerald-500" : "bg-indigo-500",
              )}
              style={{ width: `${checkPct}%` }}
            />
          </div>
          {checkPct === 100 && (
            <p className="mt-2 text-xs font-medium text-emerald-600">Todos os itens concluídos.</p>
          )}
        </section>
      )}

      {/* Counts row */}
      {((task.comentarios_count ?? 0) > 0 || (task.anexos_count ?? 0) > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3">
            <Flame className="h-4 w-4 text-slate-400" />
            <span className="flex-1 text-sm text-slate-600">Comentários</span>
            <span className="text-sm font-bold text-indigo-700 tabular-nums">{task.comentarios_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3">
            <Tag className="h-4 w-4 text-slate-400" />
            <span className="flex-1 text-sm text-slate-600">Anexos</span>
            <span className="text-sm font-bold text-indigo-700 tabular-nums">{task.anexos_count ?? 0}</span>
          </div>
        </div>
      )}

      {/* Overdue alert */}
      {isOverdue && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <CalendarClock className="h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700">
              Tarefa atrasada — prazo era {formatDate(task.data_prazo)}.
            </p>
            <p className="text-xs text-red-500">Atualize o prazo ou mova para concluída/cancelada.</p>
          </div>
        </div>
      )}
    </>
  );
}

type Tone = "success" | "danger" | "warning" | "neutral";
const toneText: Record<Tone, string> = {
  success: "text-emerald-700",
  danger:  "text-red-700",
  warning: "text-amber-700",
  neutral: "text-slate-600",
};

function InfoCell({ icon: Icon, label, value, sub, tone = "neutral" }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneText[tone])} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={cn("mt-1 text-sm font-medium", value ? "text-slate-900" : "text-slate-400")}>
          {value || "—"}
        </p>
        {sub && <p className={cn("mt-0.5 text-xs", toneText[tone])}>{sub}</p>}
      </div>
    </div>
  );
}
