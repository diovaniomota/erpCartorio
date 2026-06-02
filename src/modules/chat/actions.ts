"use server";

import { revalidatePath } from "next/cache";
import { softDeleteScopedRecord } from "@/lib/server-actions";
import { registerAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { chatConversaSchema, chatMensagemSchema } from "@/modules/chat/schemas";
import type { ActionResult, ChatConversa, ChatMensagem, Json, UserProfile } from "@/lib/types";

export async function createChatConversa(input: unknown): Promise<ActionResult<ChatConversa>> {
  try {
    const context = await requirePermission("usar_chat");
    const parsed = chatConversaSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    let participante: UserProfile | null = null;

    if (parsed.tipo === "individual") {
      if (parsed.participante_id === context.userId) {
        throw new Error("Selecione outro usuario para iniciar a conversa.");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("cartorio_id", context.cartorioId)
        .eq("id", parsed.participante_id)
        .eq("ativo", true)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Usuario nao encontrado ou sem acesso ativo.");

      participante = data as UserProfile;

      const existing = await findExistingDirectConversation(context.cartorioId, context.userId, participante.id);
      if (existing) {
        revalidatePath("/chat");
        return {
          ok: true,
          message: "Conversa direta ja existente.",
          data: existing,
        };
      }
    }

    const { data: conversa, error: conversaError } = await supabase
      .from("chat_conversas")
      .insert({
        cartorio_id: context.cartorioId,
        nome: parsed.tipo === "individual" ? participante?.nome : parsed.nome,
        tipo: parsed.tipo,
        setor: parsed.tipo === "individual" ? participante?.setor : parsed.setor,
        criado_por: context.userId,
      })
      .select("*")
      .single();

    if (conversaError) throw new Error(conversaError.message);

    const participantes =
      parsed.tipo === "individual" && participante
        ? [context.userId, participante.id]
        : [context.userId];

    const { error: participantesError } = await supabase.from("chat_participantes").insert(
      participantes.map((usuarioId) => ({
        cartorio_id: context.cartorioId,
        conversa_id: conversa.id,
        usuario_id: usuarioId,
      })),
    );

    if (participantesError) throw new Error(participantesError.message);

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: "create",
      modulo: "chat",
      tabela: "chat_conversas",
      registroId: conversa.id,
      dadosNovos: conversa as Json,
    });

    revalidatePath("/chat");

    return {
      ok: true,
      message: parsed.tipo === "individual" ? "Conversa direta criada." : "Canal criado.",
      data: conversa as ChatConversa,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Nao foi possivel criar a conversa.",
    };
  }
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

    const supabase = await createSupabaseServerClient();
    const { data: conversa, error: conversaError } = await supabase
      .from("chat_conversas")
      .select("*")
      .eq("cartorio_id", context.cartorioId)
      .eq("id", parsed.conversa_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (conversaError) throw new Error(conversaError.message);
    if (!conversa) throw new Error("Conversa nao encontrada.");

    if (conversa.tipo === "individual") {
      const { data: participante, error: participanteError } = await supabase
        .from("chat_participantes")
        .select("id")
        .eq("cartorio_id", context.cartorioId)
        .eq("conversa_id", parsed.conversa_id)
        .eq("usuario_id", context.userId)
        .is("deleted_at", null)
        .maybeSingle();

      if (participanteError) throw new Error(participanteError.message);
      if (!participante) throw new Error("Voce nao participa desta conversa.");
    }

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
      message: error instanceof Error ? error.message : "Nao foi possivel enviar a mensagem.",
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

async function findExistingDirectConversation(cartorioId: string, currentUserId: string, targetUserId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: participantRows, error: participantError } = await supabase
    .from("chat_participantes")
    .select("conversa_id, usuario_id")
    .eq("cartorio_id", cartorioId)
    .is("deleted_at", null)
    .in("usuario_id", [currentUserId, targetUserId]);

  if (participantError) throw new Error(participantError.message);

  const counts = new Map<string, Set<string>>();
  for (const row of participantRows ?? []) {
    const userIds = counts.get(row.conversa_id) ?? new Set<string>();
    userIds.add(row.usuario_id);
    counts.set(row.conversa_id, userIds);
  }

  const candidateIds = Array.from(counts.entries())
    .filter(([, userIds]) => userIds.has(currentUserId) && userIds.has(targetUserId))
    .map(([conversaId]) => conversaId);

  if (!candidateIds.length) return null;

  const { data, error } = await supabase
    .from("chat_conversas")
    .select("*")
    .eq("cartorio_id", cartorioId)
    .eq("tipo", "individual")
    .is("deleted_at", null)
    .in("id", candidateIds)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as ChatConversa | null;
}
