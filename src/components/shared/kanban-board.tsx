"use client";

import { useMemo, useState, useTransition } from "react";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, MessageSquare, Paperclip, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { ActionResult, Task, TaskColumn } from "@/lib/types";

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
  const orderedColumns = useMemo(() => [...columns].sort((a, b) => a.ordem - b.ordem), [columns]);

  function onDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const task = items.find((item) => item.id === taskId);
    const column = orderedColumns.find((item) => item.id === overId);
    if (!task || !column || task.column_id === column.id) return;

    const nextStatus = column.status_equivalente ?? task.status;
    setItems((current) =>
      current.map((item) =>
        item.id === taskId
          ? {
              ...item,
              column_id: column.id,
              status: nextStatus,
              data_conclusao: nextStatus === "concluída" ? new Date().toISOString() : item.data_conclusao,
            }
          : item,
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
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid min-h-[640px] gap-4 overflow-x-auto pb-2 xl:grid-cols-5">
        {orderedColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={items.filter((task) => task.column_id === column.id).sort((a, b) => a.ordem - b.ordem)}
          />
        ))}
      </div>
    </DndContext>
  );
}

export function KanbanColumn({ column, tasks }: { column: TaskColumn; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      className={`min-w-72 rounded-lg border bg-slate-50 p-3 ${isOver ? "ring-2 ring-primary" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: column.cor ?? "#64748b" }} />
          <h2 className="text-sm font-semibold">{column.nome}</h2>
        </div>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

export function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  const checklist = task.checklist_total ? `${task.checklist_done ?? 0}/${task.checklist_total}` : "0/0";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab p-3 active:cursor-grabbing ${isDragging ? "opacity-60" : ""}`}
      {...listeners}
      {...attributes}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {(task.labels ?? []).map((label) => (
            <span
              key={label.id}
              className="rounded px-2 py-0.5 text-[11px] font-medium text-white"
              style={{ background: label.cor }}
            >
              {label.nome}
            </span>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-snug">{task.titulo}</h3>
          {task.descricao ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.descricao}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={task.prioridade} />
          <StatusBadge status={task.status} />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(task.data_prazo)}
          </span>
          <span className="font-medium">{task.responsavel_nome ?? "Sem responsável"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" />
            {checklist}
          </span>
          <span className="flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            {task.anexos_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {task.comentarios_count ?? 0}
          </span>
        </div>
      </div>
    </Card>
  );
}
