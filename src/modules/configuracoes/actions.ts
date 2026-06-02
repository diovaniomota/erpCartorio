"use server";

import { revalidatePath } from "next/cache";
import { createScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { configuracaoSchema } from "@/modules/configuracoes/schemas";
import { requirePermission } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

export async function createConfiguracao(input: unknown) {
  return createScopedRecord(input, {
    table: "configuracoes",
    schema: configuracaoSchema,
    permission: "gerenciar_configuracoes",
    modulo: "configuracoes",
    path: "/configuracoes",
  });
}

export async function deleteConfiguracao(id: string) {
  return softDeleteScopedRecord(id, {
    table: "configuracoes",
    permission: "gerenciar_configuracoes",
    modulo: "configuracoes",
    path: "/configuracoes",
  });
}

export async function updateConfiguracao(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "configuracoes",
    schema: configuracaoSchema,
    permission: "gerenciar_configuracoes",
    modulo: "configuracoes",
    path: "/configuracoes",
  });
}

// Upsert por chave — cria ou substitui
export async function saveConfiguracao(chave: string, valorJson: string): Promise<ActionResult> {
  try {
    const context = await requirePermission("gerenciar_configuracoes");
    let valor: unknown;
    try {
      valor = JSON.parse(valorJson || "{}");
    } catch {
      return { ok: false, message: "JSON inválido. Verifique o formato do valor." };
    }

    const supabase = await createSupabaseServerClient();

    // Check for existing record with same chave
    const { data: existing } = await supabase
      .from("configuracoes")
      .select("id")
      .eq("cartorio_id", context.cartorioId)
      .eq("chave", chave)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("configuracoes")
        .update({ valor, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .eq("cartorio_id", context.cartorioId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("configuracoes")
        .insert({ chave, valor, cartorio_id: context.cartorioId });
      if (error) throw new Error(error.message);
    }

    revalidatePath("/configuracoes");
    return { ok: true, message: `Configuração "${chave}" salva com sucesso.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro ao salvar configuração." };
  }
}
