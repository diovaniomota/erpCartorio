"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import { Hash, Lock, MessageSquarePlus, Paperclip, Pin, Search, Send, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
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
  const [query, setQuery] = useState("");
  const [localMessages, setLocalMessages] = useState(mensagens);
  const selectedConversa = conversas.find((item) => item.id === activeConversaId) ?? conversas[0] ?? null;

  useEffect(() => {
    setLocalMessages(mensagens);
  }, [mensagens]);

  const filteredConversas = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversas;

    return conversas.filter((conversa) => {
      const latest = localMessages
        .filter((message) => message.conversa_id === conversa.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      return `${conversa.nome ?? ""} ${conversa.setor ?? ""} ${latest?.mensagem ?? ""}`.toLowerCase().includes(needle);
    });
  }, [conversas, localMessages, query]);

  const mensagensDaConversa = useMemo(
    () =>
      selectedConversa
        ? localMessages
            .filter((message) => message.conversa_id === selectedConversa.id)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        : [],
    [localMessages, selectedConversa],
  );

  const pinnedMessages = mensagensDaConversa.filter((message) => message.fixada);
  const canais = conversas.filter((item) => item.tipo === "canal");

  function persistMessage(message: ChatMensagem) {
    setLocalMessages((current) => mergeMessages(current, [message]));
  }

  return (
    <section className="h-[calc(100vh-6.5rem)] min-h-[720px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
      <div className="grid h-full lg:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[330px_minmax(0,1fr)_310px]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-[#08111f] text-white lg:border-b-0 lg:border-r lg:border-slate-900">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">Chat interno</p>
                <p className="text-xs text-slate-300">
                  {canais.length} canais · {localMessages.length} mensagens
                </p>
              </div>
              <EntityFormDialog
                title="Nova conversa"
                triggerLabel="Nova"
                fields={conversaFields}
                action={createConversaAction}
              />
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar conversa"
                className="border-white/10 bg-white/[0.08] pl-9 text-white placeholder:text-slate-400 focus-visible:ring-[#d6b25e]"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {filteredConversas.map((conversa) => (
                <ConversationRow
                  key={conversa.id}
                  conversa={conversa}
                  messages={localMessages.filter((message) => message.conversa_id === conversa.id)}
                  active={selectedConversa?.id === conversa.id}
                />
              ))}
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-col bg-[linear-gradient(180deg,#f8fafc,#edf3f8)]">
          {selectedConversa ? (
            <>
              <ThreadHeader conversa={selectedConversa} messageCount={mensagensDaConversa.length} pinnedCount={pinnedMessages.length} />
              {pinnedMessages.length ? <PinnedStrip message={pinnedMessages[pinnedMessages.length - 1]} /> : null}
              <MessageThread messages={mensagensDaConversa} currentUserId={currentUser.id} />
              <Composer
                conversa={selectedConversa}
                currentUser={currentUser}
                createMensagemAction={createMensagemAction}
                onCreated={persistMessage}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <MessageSquarePlus className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-950">Nenhuma conversa encontrada</h2>
                <p className="mt-1 text-sm text-muted-foreground">Crie um canal ou ajuste a busca.</p>
              </div>
            </div>
          )}
        </main>

        <aside className="hidden min-h-0 flex-col border-l border-slate-200 bg-white/[0.92] 2xl:flex">
          {selectedConversa ? (
            <ThreadDetails conversa={selectedConversa} messages={mensagensDaConversa} pinnedMessages={pinnedMessages} />
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function ConversationRow({
  conversa,
  messages,
  active,
}: {
  conversa: ChatConversa;
  messages: ChatMensagem[];
  active: boolean;
}) {
  const latest = [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  const Icon = conversa.tipo === "individual" ? Lock : conversa.tipo === "grupo" ? UsersRound : Hash;

  return (
    <Link
      href={`/chat/${conversa.id}`}
      className={cn(
        "block rounded-2xl px-3 py-3 transition-colors",
        active ? "bg-white text-slate-950 shadow-lg shadow-slate-950/15" : "text-slate-300 hover:bg-white/[0.08] hover:text-white",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", active ? "bg-[#d6b25e]/20 text-[#9b7928]" : "bg-white/10 text-slate-300")}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{conversa.nome}</p>
            <span className={cn("text-[11px]", active ? "text-slate-500" : "text-slate-400")}>{latest ? formatChatTime(latest.created_at) : ""}</span>
          </div>
          <p className={cn("mt-1 line-clamp-1 text-xs", active ? "text-slate-500" : "text-slate-400")}>
            {latest?.mensagem ?? (conversa.setor ? `Canal do setor ${conversa.setor}` : "Sem mensagens")}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ThreadHeader({ conversa, messageCount, pinnedCount }: { conversa: ChatConversa; messageCount: number; pinnedCount: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/[0.92] px-5 py-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
          {conversa.tipo === "canal" ? <Hash className="h-5 w-5" /> : <UsersRound className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-950">{conversa.nome}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {conversa.setor ? `Setor ${conversa.setor}` : "Comunicação interna"} · {messageCount} mensagens
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        {pinnedCount ? (
          <Badge variant="warning" className="gap-1">
            <Pin className="h-3 w-3" />
            {pinnedCount}
          </Badge>
        ) : null}
        <Badge variant="secondary">{conversa.tipo}</Badge>
      </div>
    </div>
  );
}

function PinnedStrip({ message }: { message: ChatMensagem }) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
      <div className="flex items-start gap-2">
        <Pin className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div className="min-w-0">
          <p className="font-semibold">Fixada</p>
          <p className="line-clamp-1 text-amber-900">{message.mensagem}</p>
        </div>
      </div>
    </div>
  );
}

function MessageThread({ messages, currentUserId }: { messages: ChatMensagem[]; currentUserId: string }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-950">Conversa vazia</h2>
          <p className="mt-1 text-sm text-muted-foreground">Envie a primeira mensagem para iniciar o histórico.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
      <div className="mx-auto max-w-3xl space-y-5">
        {messages.map((message) => {
          const mine = message.usuario_id === currentUserId;
          return (
            <div key={message.id} className={cn("flex gap-3", mine ? "justify-end" : "justify-start")}>
              {!mine ? (
                <Avatar className="mt-6 h-9 w-9 border border-slate-200">
                  <AvatarFallback>{initials(message.usuario_nome ?? "U")}</AvatarFallback>
                </Avatar>
              ) : null}
              <div className={cn("max-w-[78%]", mine && "text-right")}>
                <div className={cn("mb-1 flex items-center gap-2 text-xs text-slate-500", mine && "justify-end")}>
                  <span>{message.usuario_nome ?? "Usuário"}</span>
                  <span>{formatChatTime(message.created_at)}</span>
                  {message.fixada ? <Pin className="h-3.5 w-3.5 text-amber-600" /> : null}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                    mine ? "rounded-br-md bg-[#0f766e] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800",
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.mensagem}</p>
                </div>
              </div>
              {mine ? (
                <Avatar className="mt-6 h-9 w-9 border border-emerald-200">
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

function Composer({
  conversa,
  currentUser,
  createMensagemAction,
  onCreated,
}: {
  conversa: ChatConversa;
  currentUser: UserProfile;
  createMensagemAction: (input: unknown) => Promise<ActionResult<ChatMensagem>>;
  onCreated: (message: ChatMensagem) => void;
}) {
  const [message, setMessage] = useState("");
  const [fixada, setFixada] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isPending) return;

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

      onCreated({
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
    <form onSubmit={submit} className="border-t border-slate-200 bg-white/[0.94] px-5 py-4 backdrop-blur">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-2 shadow-inner">
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Escreva em ${conversa.nome}`}
          className="min-h-16 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-2">
          <div className="flex items-center gap-1">
            <Button type="button" variant={fixada ? "secondary" : "ghost"} size="sm" onClick={() => setFixada((current) => !current)}>
              <Pin className="h-4 w-4" />
              Fixar
            </Button>
            <span className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              Anexo
            </span>
          </div>
          <Button type="submit" disabled={!message.trim() || isPending}>
            <Send className="h-4 w-4" />
            {isPending ? "Enviando" : "Enviar"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ThreadDetails({
  conversa,
  messages,
  pinnedMessages,
}: {
  conversa: ChatConversa;
  messages: ChatMensagem[];
  pinnedMessages: ChatMensagem[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Detalhes</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">{conversa.nome}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{conversa.setor ? `Setor ${conversa.setor}` : "Sem setor vinculado"}</p>
      </div>
      <div className="space-y-4 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-2">
          <SmallMetric label="Mensagens" value={messages.length} />
          <SmallMetric label="Fixadas" value={pinnedMessages.length} />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fixadas</p>
          <div className="space-y-2">
            {pinnedMessages.length ? (
              pinnedMessages.map((message) => (
                <div key={message.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="line-clamp-4">{message.mensagem}</p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Nenhuma mensagem fixada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <p className="text-xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function mergeMessages(...groups: ChatMensagem[][]) {
  const map = new Map<string, ChatMensagem>();
  for (const group of groups) {
    for (const message of group) {
      map.set(message.id, message);
    }
  }

  return Array.from(map.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "dd/MM HH:mm");
}
