"use server";

import { revalidatePath } from "next/cache";
import { createScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { requirePermission } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerAuditLog } from "@/lib/audit";
import { moveTaskSchema, taskSchema } from "@/modules/tarefas/schemas";
import type { ActionResult, Json } from "@/lib/types";

export async function createTask(input: unknown) {
  return createScopedRecord(input, {
    table: "tasks",
    schema: taskSchema,
    permission: "gerenciar_tarefas",
    modulo: "tarefas",
    path: "/tarefas/kanban",
  });
}

export async function updateTask(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "tasks",
    schema: taskSchema,
    permission: "gerenciar_tarefas",
    modulo: "tarefas",
    path: "/tarefas/kanban",
  });
}

export async function deleteTask(id: string) {
  return softDeleteScopedRecord(id, {
    table: "tasks",
    permission: "gerenciar_tarefas",
    modulo: "tarefas",
    path: "/tarefas/kanban",
  });
}

export async function moveTask(input: unknown): Promise<ActionResult> {
  try {
    const context = await requirePermission("gerenciar_tarefas");
    const parsed = moveTaskSchema.parse(input);

    if (!hasSupabaseConfig() || context.isDemo) {
      return { ok: true, message: "Tarefa movida no quadro demo.", data: parsed };
    }

    const supabase = await createSupabaseServerClient();
    const { data: previous } = await supabase
      .from("tasks")
      .select("*")
      .eq("cartorio_id", context.cartorioId)
      .eq("id", parsed.taskId)
      .maybeSingle();

    const dataConclusao =
      parsed.status === "concluída"
        ? new Date().toISOString()
        : previous?.status === "concluída"
          ? null
          : previous?.data_conclusao;

    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: parsed.columnId,
        ordem: parsed.order,
        status: parsed.status ?? previous?.status,
        data_conclusao: dataConclusao,
      })
      .eq("cartorio_id", context.cartorioId)
      .eq("id", parsed.taskId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("task_activity_logs").insert({
      cartorio_id: context.cartorioId,
      task_id: parsed.taskId,
      usuario_id: context.userId,
      acao: "move",
      dados_anteriores: previous,
      dados_novos: data,
    });

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: "move",
      modulo: "tarefas",
      tabela: "tasks",
      registroId: parsed.taskId,
      dadosAnteriores: previous as Json,
      dadosNovos: data as Json,
    });

    revalidatePath("/tarefas/kanban");

    return { ok: true, message: "Tarefa movida com histórico registrado.", data };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível mover a tarefa.",
    };
  }
}
