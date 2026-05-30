"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Bell,
  Hash,
  Lock,
  MessageCircle,
  Paperclip,
  Pin,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import type { ActionResult, ChatConversa, ChatMensagem, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChatWorkspaceProps = {
  conversas: ChatConversa[];
  mensagens: ChatMensagem[];
  activeConversaId?: string;
  currentUser: UserProfile;
  createConversaAction: (input: unknown) => Promise<ActionResult>;
  createMensagemAction: (input: unknown) => Promise<ActionResult<ChatMensagem>>;
};

const conversaFields: EntityField[] = [
  { name: "nome", label: "Nome", required: true },
  {
    name: "tipo",
    label: "Tipo",
    type: "select",
    defaultValue: "canal",
    options: ["canal", "grupo", "individual"].map((value) => ({ label: value, value })),
  },
  { name: "setor", label: "Setor" },
];

export function ChatWorkspace({
  conversas,
  mensagens,
  activeConversaId,
  currentUser,
  createConversaAction,
  createMensagemAction,
}: ChatWorkspaceProps) {
  const [localMessages, setLocalMessages] = useState(mensagens);
  const selectedConversa = conversas.find((item) => item.id === activeConversaId) ?? conversas[0] ?? null;

  useEffect(() => {
    setLocalMessages(mensagens);
  }, [mensagens]);

  const mensagensDaConversa = useMemo(
    () =>
      selectedConversa
        ? localMessages
            .filter((message) => message.conversa_id === selectedConversa.id)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        : [],
    [localMessages, selectedConversa],
  );

  const fixadas = mensagensDaConversa.filter((message) => message.fixada);
  const canais = conversas.filter((item) => item.tipo === "canal");

  return (
    <>
      <PageHeader
        title="Chat interno"
        description="Canais, grupos por setor, mensagens fixadas e histórico administrativo da equipe."
        actions={
          <EntityFormDialog
            title="Novo canal ou grupo"
            triggerLabel="Nova conversa"
            fields={conversaFields}
            action={createConversaAction}
          />
        }
      />

      <section className="grid h-[calc(100vh-13rem)] min-h-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:grid-cols-[330px_minmax(0,1fr)_300px]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-slate-50/80 xl:border-b-0 xl:border-r">
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Conversas</p>
                <p className="text-xs text-muted-foreground">
                  {conversas.length} conversas, {canais.length} canais
                </p>
              </div>
              <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {conversas.map((conversa) => (
              <ConversationLink
                key={conversa.id}
                conversa={conversa}
                messages={localMessages.filter((message) => message.conversa_id === conversa.id)}
                active={selectedConversa?.id === conversa.id}
              />
            ))}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col bg-white">
          {selectedConversa ? (
            <>
              <ChatHeader conversa={selectedConversa} messageCount={mensagensDaConversa.length} pinnedCount={fixadas.length} />
              {fixadas.length ? (
                <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <div className="flex items-start gap-2">
                    <Pin className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <div className="min-w-0">
                      <p className="font-medium">Mensagem fixada</p>
                      <p className="line-clamp-2 text-amber-900">{fixadas[fixadas.length - 1].mensagem}</p>
                    </div>
                  </div>
                </div>
              ) : null}
              <MessageList messages={mensagensDaConversa} currentUserId={currentUser.id} />
              <MessageComposer
                conversa={selectedConversa}
                currentUser={currentUser}
                createMensagemAction={createMensagemAction}
                onMessageCreated={(message) => setLocalMessages((current) => [...current, message])}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold">Nenhuma conversa cadastrada</h2>
                <p className="mt-1 text-sm text-muted-foreground">Crie um canal para iniciar a comunicação interna.</p>
              </div>
            </div>
          )}
        </main>

        <aside className="hidden min-h-0 flex-col border-l border-slate-200 bg-slate-50/70 xl:flex">
          {selectedConversa ? (
            <ConversationPanel conversa={selectedConversa} pinnedMessages={fixadas} messages={mensagensDaConversa} />
          ) : null}
        </aside>
      </section>
    </>
  );
}

function ConversationLink({
  conversa,
  messages,
  active,
}: {
  conversa: ChatConversa;
  messages: ChatMensagem[];
  active: boolean;
}) {
  const latest = messages[messages.length - 1];
  const Icon = conversa.tipo === "individual" ? Lock : conversa.tipo === "grupo" ? UsersRound : Hash;

  return (
    <Link
      href={`/chat/${conversa.id}`}
      className={cn(
        "block rounded-md border p-3 transition-colors",
        active
          ? "border-emerald-200 bg-white shadow-sm ring-1 ring-emerald-100"
          : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
            active ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-950">{conversa.nome}</p>
            <span className="text-[11px] text-muted-foreground">{latest ? formatChatTime(latest.created_at) : ""}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {latest ? latest.mensagem : conversa.setor ? `Canal do setor ${conversa.setor}` : "Sem mensagens ainda"}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant={active ? "secondary" : "outline"}>{conversa.tipo}</Badge>
            {messages.length ? <span className="text-xs font-medium text-slate-500">{messages.length}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ChatHeader({
  conversa,
  messageCount,
  pinnedCount,
}: {
  conversa: ChatConversa;
  messageCount: number;
  pinnedCount: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#0b1f25] text-white">
          {conversa.tipo === "canal" ? <Hash className="h-5 w-5" /> : <UsersRound className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-950">{conversa.nome}</h2>
          <p className="truncate text-xs text-muted-foreground">
            {conversa.setor ? `Setor ${conversa.setor}` : "Comunicação interna"} · {messageCount} mensagens
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        {pinnedCount ? (
          <Badge variant="outline" className="gap-1">
            <Pin className="h-3 w-3" />
            {pinnedCount}
          </Badge>
        ) : null}
        <Badge variant="secondary">{conversa.tipo}</Badge>
      </div>
    </div>
  );
}

function MessageList({ messages, currentUserId }: { messages: ChatMensagem[]; currentUserId: string }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.08),transparent_38%)] p-8 text-center">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Send className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">Comece a conversa</h3>
          <p className="mt-1 text-sm text-muted-foreground">Envie a primeira mensagem para registrar o histórico do canal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-5">
      <div className="mx-auto max-w-4xl space-y-4">
        {messages.map((message) => {
          const mine = message.usuario_id === currentUserId;
          return (
            <div key={message.id} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
              {!mine ? (
                <Avatar className="h-8 w-8 border border-slate-200">
                  <AvatarFallback>{initials(message.usuario_nome ?? "Usuário")}</AvatarFallback>
                </Avatar>
              ) : null}
              <div className={cn("max-w-[78%] space-y-1", mine && "items-end text-right")}>
                <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", mine && "justify-end")}>
                  <span className="font-medium text-slate-600">{message.usuario_nome ?? "Usuário"}</span>
                  <span>{formatChatTime(message.created_at)}</span>
                  {message.fixada ? <Pin className="h-3.5 w-3.5 text-amber-600" /> : null}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    mine
                      ? "rounded-br-sm bg-emerald-700 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.mensagem}</p>
                </div>
              </div>
              {mine ? (
                <Avatar className="h-8 w-8 border border-emerald-200">
                  <AvatarFallback className="bg-emerald-50 text-emerald-800">{initials(message.usuario_nome ?? "Eu")}</AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function MessageComposer({
  conversa,
  currentUser,
  createMensagemAction,
  onMessageCreated,
}: {
  conversa: ChatConversa;
  currentUser: UserProfile;
  createMensagemAction: (input: unknown) => Promise<ActionResult<ChatMensagem>>;
  onMessageCreated: (message: ChatMensagem) => void;
}) {
  const [message, setMessage] = useState("");
  const [fixada, setFixada] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await createMensagemAction({
        conversa_id: conversa.id,
        mensagem: trimmed,
        fixada,
      });

      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }

      onMessageCreated({
        ...result.data,
        conversa_nome: conversa.nome ?? null,
        usuario_nome: result.data.usuario_nome ?? currentUser.nome,
      });
      setMessage("");
      setFixada(false);
      toast.success(result.message);
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-slate-200 bg-white p-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-inner">
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Mensagem para ${conversa.nome}`}
          className="min-h-20 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2">
          <div className="flex items-center gap-2">
            <Button type="button" variant={fixada ? "secondary" : "ghost"} size="sm" onClick={() => setFixada((current) => !current)}>
              <Pin className="h-4 w-4" />
              Fixar
            </Button>
            <span className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              Anexos no histórico
            </span>
          </div>
          <Button type="submit" disabled={!message.trim() || isPending}>
            <Send className="h-4 w-4" />
            {isPending ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ConversationPanel({
  conversa,
  pinnedMessages,
  messages,
}: {
  conversa: ChatConversa;
  pinnedMessages: ChatMensagem[];
  messages: ChatMensagem[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0b1f25] text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-950">{conversa.nome}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {conversa.tipo === "canal" ? "Canal interno" : "Conversa interna"} com histórico por cartório.
        </p>
      </div>

      <div className="space-y-4 overflow-y-auto p-4">
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resumo</p>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Mensagens" value={messages.length} />
            <Metric label="Fixadas" value={pinnedMessages.length} />
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recursos</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 rounded-md border bg-white p-2">
              <Bell className="h-4 w-4 text-emerald-700" />
              Notificações internas
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-white p-2">
              <Paperclip className="h-4 w-4 text-emerald-700" />
              Anexos vinculados ao storage
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-white p-2">
              <Pin className="h-4 w-4 text-emerald-700" />
              Mensagens fixadas
            </div>
          </div>
        </section>

        {pinnedMessages.length ? (
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fixadas</p>
            <div className="space-y-2">
              {pinnedMessages.map((message) => (
                <div key={message.id} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                  <p className="line-clamp-4">{message.mensagem}</p>
                  <p className="mt-2 text-[11px] text-amber-800">{formatChatTime(message.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <p className="text-lg font-semibold text-slate-950">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatChatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return format(date, "dd/MM HH:mm");
}
