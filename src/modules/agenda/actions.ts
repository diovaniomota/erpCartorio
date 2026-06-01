"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { registerAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult, Json } from "@/lib/types";
import { normalizeAgendaTipos } from "@/modules/agenda/constants";
import { agendaEventoSchema } from "@/modules/agenda/schemas";

const agendaTiposSchema = z
  .array(z.string())
  .transform((values) => normalizeAgendaTipos(values))
  .refine((values) => values.length > 0, "Mantenha pelo menos um tipo.");

export async function createAgendaEvento(input: unknown) {
  return createScopedRecord(input, {
    table: "agenda_eventos",
    schema: agendaEventoSchema,
    permission: "ver_dashboard",
    modulo: "agenda",
    path: "/agenda",
  });
}

export async function updateAgendaEvento(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "agenda_eventos",
    schema: agendaEventoSchema,
    permission: "ver_dashboard",
    modulo: "agenda",
    path: "/agenda",
  });
}

export async function deleteAgendaEvento(id: string) {
  return softDeleteScopedRecord(id, {
    table: "agenda_eventos",
    permission: "ver_dashboard",
    modulo: "agenda",
    path: "/agenda",
  });
}

export async function updateAgendaTipos(input: unknown): Promise<ActionResult<string[]>> {
  try {
    const context = await requirePermission("gerenciar_configuracoes");
    const tipos = agendaTiposSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data: previous } = await supabase
      .from("configuracoes")
      .select("*")
      .eq("cartorio_id", context.cartorioId)
      .eq("chave", "agenda_tipos")
      .maybeSingle();

    const { data, error } = await supabase
      .from("configuracoes")
      .upsert(
        {
          cartorio_id: context.cartorioId,
          chave: "agenda_tipos",
          valor: { items: tipos },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cartorio_id,chave" },
      )
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: previous ? "update" : "create",
      modulo: "agenda",
      tabela: "configuracoes",
      registroId: data.id,
      dadosAnteriores: previous as Json,
      dadosNovos: data as Json,
    });

    revalidatePath("/agenda");
    return { ok: true, message: "Tipos da agenda atualizados.", data: tipos };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível atualizar os tipos.",
    };
  }
}
