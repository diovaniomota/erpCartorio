"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerAuditLog } from "@/lib/audit";
import type { ActionResult, Json, TableName } from "@/lib/types";

type MutationOptions = {
  table: TableName | string;
  schema: z.ZodTypeAny;
  permission: string;
  modulo: string;
  path?: string;
  audit?: boolean;
};

export async function createScopedRecord(
  input: unknown,
  options: MutationOptions,
): Promise<ActionResult> {
  try {
    const context = await requirePermission(options.permission);
    const parsed = options.schema.parse(input) as Record<string, unknown>;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(options.table)
      .insert({
        ...parsed,
        cartorio_id: context.cartorioId,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (options.audit ?? true) {
      await registerAuditLog({
        cartorioId: context.cartorioId,
        userId: context.userId,
        acao: "create",
        modulo: options.modulo,
        tabela: options.table,
        registroId: data.id,
        dadosNovos: data as Json,
      });
    }

    if (options.path) {
      revalidatePath(options.path);
    }

    return { ok: true, message: "Registro criado com sucesso.", data };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível criar o registro.",
    };
  }
}

export async function updateScopedRecord(
  id: string,
  input: unknown,
  options: MutationOptions,
): Promise<ActionResult> {
  try {
    const context = await requirePermission(options.permission);
    const parsed = (options.schema as z.ZodObject<z.ZodRawShape>)
      .partial()
      .parse(input) as Record<string, unknown>;

    const supabase = await createSupabaseServerClient();
    const { data: previous } = await supabase
      .from(options.table)
      .select("*")
      .eq("cartorio_id", context.cartorioId)
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await supabase
      .from(options.table)
      .update(parsed)
      .eq("cartorio_id", context.cartorioId)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: "update",
      modulo: options.modulo,
      tabela: options.table,
      registroId: id,
      dadosAnteriores: previous as Json,
      dadosNovos: data as Json,
    });

    if (options.path) {
      revalidatePath(options.path);
    }

    return { ok: true, message: "Registro atualizado com sucesso.", data };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível atualizar o registro.",
    };
  }
}

export async function softDeleteScopedRecord(
  id: string,
  options: Omit<MutationOptions, "schema"> & { motivo?: string },
): Promise<ActionResult> {
  try {
    const context = await requirePermission(options.permission);

    const supabase = await createSupabaseServerClient();
    const { data: previous } = await supabase
      .from(options.table)
      .select("*")
      .eq("cartorio_id", context.cartorioId)
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await supabase
      .from(options.table)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: context.userId,
        motivo_exclusao: options.motivo ?? "Exclusão lógica pelo usuário",
      })
      .eq("cartorio_id", context.cartorioId)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: "soft_delete",
      modulo: options.modulo,
      tabela: options.table,
      registroId: id,
      dadosAnteriores: previous as Json,
      dadosNovos: data as Json,
    });

    if (options.path) {
      revalidatePath(options.path);
    }

    return { ok: true, message: "Registro arquivado com segurança." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível arquivar o registro.",
    };
  }
}

export async function restoreScopedRecord(
  id: string,
  options: Omit<MutationOptions, "schema">,
): Promise<ActionResult> {
  try {
    const context = await requirePermission(options.permission);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(options.table)
      .update({ deleted_at: null, deleted_by: null, motivo_exclusao: null })
      .eq("cartorio_id", context.cartorioId)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: "restore",
      modulo: options.modulo,
      tabela: options.table,
      registroId: id,
      dadosNovos: data as Json,
    });

    if (options.path) revalidatePath(options.path);

    return { ok: true, message: "Registro restaurado com sucesso." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível restaurar o registro.",
    };
  }
}
