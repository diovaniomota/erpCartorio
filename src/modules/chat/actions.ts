"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createScopedRecord, softDeleteScopedRecord } from "@/lib/server-actions";
import { registerAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { chatConversaSchema, chatMensagemSchema } from "@/modules/chat/schemas";
import type { ActionResult, ChatMensagem, Json } from "@/lib/types";

export async function createChatConversa(input: unknown) {
  return createScopedRecord(input, {
    table: "chat_conversas",
    schema: chatConversaSchema,
    permission: "usar_chat",
    modulo: "chat",
    path: "/chat",
  });
}

export async function deleteChatConversa(id: string) {
  return softDeleteScopedRecord(id, {
    table: "chat_conversas",
    permission: "usar_chat",
    modulo: "chat",
    path: "/chat",
  });
}

export async function createChatMensagem(input: unknown): Promise<ActionResult<ChatMensagem>> {
  try {
    const context = await requirePermission("usar_chat");
    const parsed = chatMensagemSchema.parse(input);
    const now = new Date().toISOString();

    if (!hasSupabaseConfig() || context.isDemo) {
      return {
        ok: true,
        message: "Mensagem enviada.",
        data: {
          id: randomUUID(),
          cartorio_id: context.cartorioId,
          conversa_id: parsed.conversa_id,
          conversa_nome: null,
          usuario_id: context.userId,
          usuario_nome: context.profile.nome,
          mensagem: parsed.mensagem,
          anexos: [],
          fixada: parsed.fixada,
          created_at: now,
          updated_at: now,
        },
      };
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("chat_mensagens")
      .insert({
        ...parsed,
        cartorio_id: context.cartorioId,
        usuario_id: context.userId,
        anexos: [],
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: "create",
      modulo: "chat",
      tabela: "chat_mensagens",
      registroId: data.id,
      dadosNovos: data as Json,
    });

    revalidatePath("/chat");
    revalidatePath(`/chat/${parsed.conversa_id}`);

    return {
      ok: true,
      message: "Mensagem enviada.",
      data: {
        ...(data as ChatMensagem),
        usuario_nome: context.profile.nome,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível enviar a mensagem.",
    };
  }
}

export async function deleteChatMensagem(id: string) {
  return softDeleteScopedRecord(id, {
    table: "chat_mensagens",
    permission: "usar_chat",
    modulo: "chat",
    path: "/chat",
  });
}
