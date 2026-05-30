import { getSessionContext } from "@/lib/auth";
import { createChatConversa, createChatMensagem } from "@/modules/chat/actions";
import { ChatWorkspace } from "@/modules/chat/components/chat-workspace";
import { getChatConversas, getChatMensagens } from "@/modules/chat/queries";

export default async function ChatPage() {
  const [context, conversas, mensagens] = await Promise.all([
    getSessionContext(),
    getChatConversas(),
    getChatMensagens(),
  ]);

  return (
    <ChatWorkspace
      conversas={conversas}
      mensagens={mensagens}
      currentUser={context.profile}
      createConversaAction={createChatConversa}
      createMensagemAction={createChatMensagem}
    />
  );
}
