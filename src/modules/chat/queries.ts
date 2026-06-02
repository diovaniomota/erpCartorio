import { unstable_noStore as noStore } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { getScopedRecord, listScopedRecords } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ChatConversa } from "@/lib/types";

export async function getChatConversas() {
  noStore();

  const context = await getSessionContext();
  const supabase = await createSupabaseServerClient();
  const [{ data: conversas, error: conversasError }, { data: participantes, error: participantesError }] = await Promise.all([
    supabase
      .from("chat_conversas")
      .select("*")
      .eq("cartorio_id", context.cartorioId)
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    supabase
      .from("chat_participantes")
      .select("conversa_id")
      .eq("cartorio_id", context.cartorioId)
      .eq("usuario_id", context.userId)
      .is("deleted_at", null),
  ]);

  if (conversasError) throw new Error(conversasError.message);
  if (participantesError) throw new Error(participantesError.message);

  const participantConversationIds = new Set((participantes ?? []).map((item) => item.conversa_id));

  return ((conversas ?? []) as ChatConversa[]).filter(
    (conversa) => conversa.tipo !== "individual" || participantConversationIds.has(conversa.id) || conversa.criado_por === context.userId,
  );
}

export async function getChatConversa(id: string) {
  const context = await getSessionContext();
  const conversa = await getScopedRecord("chat_conversas", id);

  if (!conversa) return null;
  if (conversa.tipo !== "individual") return conversa;

  const participates = await userParticipatesInConversation(context.cartorioId, id, context.userId);
  return participates ? conversa : null;
}

export async function getChatMensagens() {
  const [mensagens, conversas, profiles] = await Promise.all([
    listScopedRecords("chat_mensagens", { orderBy: "created_at", ascending: true }),
    getChatConversas(),
    listScopedRecords("profiles", { orderBy: "nome", ascending: true }),
  ]);
  const visibleConversationIds = new Set(conversas.map((item) => item.id));
  const conversaPorId = new Map(conversas.map((item) => [item.id, item.nome]));
  const usuarioPorId = new Map(profiles.map((item) => [item.id, item.nome]));

  return mensagens
    .filter((mensagem) => visibleConversationIds.has(mensagem.conversa_id))
    .map((mensagem) => ({
      ...mensagem,
      conversa_nome: mensagem.conversa_nome ?? conversaPorId.get(mensagem.conversa_id) ?? null,
      usuario_nome: mensagem.usuario_nome ?? usuarioPorId.get(mensagem.usuario_id ?? "") ?? null,
    }));
}

export async function getChatUsuarios() {
  const profiles = await listScopedRecords("profiles", { orderBy: "nome", ascending: true });
  return profiles.filter((profile) => profile.ativo);
}

async function userParticipatesInConversation(cartorioId: string, conversaId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chat_participantes")
    .select("id")
    .eq("cartorio_id", cartorioId)
    .eq("conversa_id", conversaId)
    .eq("usuario_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return Boolean(data);
}
