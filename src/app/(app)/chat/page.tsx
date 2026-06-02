import { getSessionContext } from "@/lib/auth";
import { createChatConversa, createChatMensagem } from "@/modules/chat/actions";
import { ChatWorkspace } from "@/modules/chat/components/chat-workspace";
import { getChatConversas, getChatMensagens, getChatUsuarios } from "@/modules/chat/queries";

export default async function ChatPage() {
  const [context, conversas, mensagens, usuarios] = await Promise.all([
    getSessionContext(),
    getChatConversas(),
    getChatMensagens(),
    getChatUsuarios(),
  ]);

  return (
    <ChatWorkspace
      conversas={conversas}
      mensagens={mensagens}
      usuarios={usuarios}
      currentUser={context.profile}
      createConversaAction={createChatConversa}
      createMensagemAction={createChatMensagem}
    />
  );
}
