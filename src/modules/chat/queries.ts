import { getScopedRecord, listScopedRecords } from "@/lib/data";

export const getChatConversas = () => listScopedRecords("chat_conversas", { orderBy: "nome", ascending: true });
export const getChatConversa = (id: string) => getScopedRecord("chat_conversas", id);
export async function getChatMensagens() {
  const [mensagens, conversas, profiles] = await Promise.all([
    listScopedRecords("chat_mensagens", { orderBy: "created_at", ascending: true }),
    getChatConversas(),
    listScopedRecords("profiles", { orderBy: "nome", ascending: true }),
  ]);
  const conversaPorId = new Map(conversas.map((item) => [item.id, item.nome]));
  const usuarioPorId = new Map(profiles.map((item) => [item.id, item.nome]));

  return mensagens.map((mensagem) => ({
    ...mensagem,
    conversa_nome: mensagem.conversa_nome ?? conversaPorId.get(mensagem.conversa_id) ?? null,
    usuario_nome: mensagem.usuario_nome ?? usuarioPorId.get(mensagem.usuario_id ?? "") ?? null,
  }));
}
