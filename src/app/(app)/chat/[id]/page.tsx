import { notFound } from "next/navigation";
import { getSessionContext } from "@/lib/auth";
import { createChatConversa, createChatMensagem } from "@/modules/chat/actions";
import { ChatWorkspace } from "@/modules/chat/components/chat-workspace";
import { getChatConversa, getChatConversas, getChatMensagens } from "@/modules/chat/queries";

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [context, conversa, conversas, mensagens] = await Promise.all([
    getSessionContext(),
    getChatConversa(id),
    getChatConversas(),
    getChatMensagens(),
  ]);

  if (!conversa) {
    notFound();
  }

  return (
    <ChatWorkspace
      conversas={conversas}
      mensagens={mensagens}
      activeConversaId={id}
      currentUser={context.profile}
      createConversaAction={createChatConversa}
      createMensagemAction={createChatMensagem}
    />
  );
}
