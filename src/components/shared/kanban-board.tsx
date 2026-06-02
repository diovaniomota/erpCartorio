"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensors,
  useSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarClock,
  CheckSquare,
  GripVertical,
  MessageSquare,
  Paperclip,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import type { ActionResult, Task, TaskColumn } from "@/lib/types";

// ── Priority palette ──────────────────────────────────────────────────────────
const priorityBorder: Record<string, string> = {
  urgente: "border-l-red-500",
  alta:    "border-l-orange-500",
  média:   "border-l-amber-400",
  baixa:   "border-l-slate-300",
};

const priorityBadge: Record<string, string> = {
  urgente: "bg-red-100 text-red-800",
  alta:    "bg-orange-100 text-orange-800",
  média:   "bg-amber-100 text-amber-800",
  baixo:   "bg-slate-100 text-slate-600",
};

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name }: { name?: string | null }) {
  if (!name) return null;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700" title={name}>
      {initials}
    </span>
  );
}

// ── KanbanBoard ───────────────────────────────────────────────────────────────
export function KanbanBoard({
  columns,
  tasks,
  moveAction,
}: {
  columns: TaskColumn[];
  tasks: Task[];
  moveAction: (input: unknown) => Promise<ActionResult>;
}) {
  const [items, setItems] = useState(tasks);
  const [, startTransition] = useTransition();
  const orderedColumns = useMemo(
    () => [...columns].sort((a, b) => a.ordem - b.ordem),
    [columns],
  );

  // Distance constraint: moves < 8 px are treated as clicks, not drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const task = items.find((t) => t.id === taskId);
    const column = orderedColumns.find((c) => c.id === overId);
    if (!task || !column || task.column_id === column.id) return;

    const nextStatus = column.status_equivalente ?? task.status;
    setItems((current) =>
      current.map((t) =>
        t.id === taskId
          ? {
              ...t,
              column_id: column.id,
              status: nextStatus,
              data_conclusao:
                nextStatus === "concluída"
                  ? new Date().toISOString()
                  : t.data_conclusao,
            }
          : t,
      ),
    );

    startTransition(async () => {
      const result = await moveAction({
        taskId,
        oldColumnId: task.column_id,
        columnId: column.id,
        order: task.ordem,
        status: nextStatus,
      });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 600 }}>
        {orderedColumns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={items
              .filter((t) => t.column_id === col.id)
              .sort((a, b) => a.ordem - b.ordem)}
          />
        ))}
      </div>
    </DndContext>
  );
}

// ── KanbanColumn ──────────────────────────────────────────────────────────────
export function KanbanColumn({
  column,
  tasks,
}: {
  column: TaskColumn;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const cor = column.cor ?? "#94a3b8";

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50/80 transition-colors",
        isOver && "border-indigo-300 bg-indigo-50/40 ring-2 ring-indigo-200",
      )}
    >
      {/* Column header */}
      <div
        className="rounded-t-xl px-4 py-3"
        style={{ borderTop: `3px solid ${cor}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-800">
              {column.nome}
            </h2>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
            style={{
              background: `${cor}20`,
              color: cor,
            }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3 pt-1">
        {tasks.length === 0 ? (
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 text-center text-xs text-slate-400",
              isOver ? "border-indigo-300 text-indigo-400" : "border-slate-200",
            )}
          >
            <Plus className="h-4 w-4" />
            Solte um cartão aqui
          </div>
        ) : (
          tasks.map((task) => <KanbanCard key={task.id} task={task} />)
        )}
      </div>
    </section>
  );
}

// ── KanbanCard ────────────────────────────────────────────────────────────────
export function KanbanCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task.id });

  const style = { transform: CSS.Translate.toString(transform) };

  const today       = new Date();
  today.setHours(0, 0, 0, 0);
  const prazo       = task.data_prazo ? new Date(task.data_prazo) : null;
  const isOverdue   = prazo && prazo < today && task.status !== "concluída";
  const isDueToday  = prazo && prazo.getTime() === today.getTime() && task.status !== "concluída";
  const checkTotal  = task.checklist_total ?? 0;
  const checkDone   = task.checklist_done ?? 0;
  const checkPct    = checkTotal > 0 ? Math.round((checkDone / checkTotal) * 100) : 0;

  const pBorder = priorityBorder[task.prioridade] ?? "border-l-slate-300";
  const pBadge  = priorityBadge[task.prioridade] ?? "bg-slate-100 text-slate-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-slate-200 border-l-4 bg-white shadow-sm transition-shadow",
        pBorder,
        isDragging ? "opacity-50 shadow-lg rotate-1" : "hover:shadow-md",
        isOverdue && "border-t-red-100 bg-red-50/30",
      )}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        {...attributes}
        className="absolute right-2 top-2 cursor-grab touch-none rounded p-0.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Arrastar cartão"
        onClick={(e) => e.preventDefault()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className="p-3 pr-7">
        {/* Labels */}
        {(task.labels ?? []).length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {(task.labels ?? []).map((label) => (
              <span
                key={label.id}
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ background: label.cor }}
              >
                {label.nome}
              </span>
            ))}
          </div>
        )}

        {/* Title — clickable link (works because PointerSensor has distance constraint) */}
        <Link
          href={`/tarefas/${task.id}`}
          className="block text-sm font-semibold leading-snug text-slate-900 hover:text-indigo-700 hover:underline"
        >
          {task.titulo}
        </Link>

        {/* Description */}
        {task.descricao && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {task.descricao}
          </p>
        )}

        {/* Priority + Category */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", pBadge)}>
            {task.prioridade}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {task.categoria}
          </span>
        </div>

        {/* Checklist progress */}
        {checkTotal > 0 && (
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {checkDone}/{checkTotal}
              </span>
              <span>{checkPct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  checkPct === 100 ? "bg-emerald-500" : "bg-indigo-500",
                )}
                style={{ width: `${checkPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          {/* Date */}
          <span
            className={cn(
              "flex items-center gap-1 text-[11px]",
              isOverdue  ? "font-semibold text-red-600" :
              isDueToday ? "font-semibold text-amber-600" :
              "text-slate-400",
            )}
          >
            <CalendarClock className="h-3 w-3 shrink-0" />
            {task.data_prazo ? formatDate(task.data_prazo) : "—"}
            {isOverdue  && " · atrasada"}
            {isDueToday && " · hoje"}
          </span>

          {/* Avatar */}
          <Avatar name={task.responsavel_nome} />
        </div>

        {/* Counts */}
        {((task.comentarios_count ?? 0) > 0 || (task.anexos_count ?? 0) > 0) && (
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
            {(task.comentarios_count ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {task.comentarios_count}
              </span>
            )}
            {(task.anexos_count ?? 0) > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {task.anexos_count}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
