import { ExternalLink, FileText, Star } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createOfficialUpdate, deleteOfficialUpdate } from "@/modules/central-oficial/actions";
import { getOfficialSources, getOfficialUpdates } from "@/modules/central-oficial/queries";
import { cn, formatDate } from "@/lib/utils";
import type { OfficialUpdate } from "@/lib/types";

type CentralOficialScreenProps = {
  tipoFiltro?: string;
  title?: string;
  description?: string;
};

// ── Org badge colors ──────────────────────────────────────────────────────────
const orgCor: Record<string, { bg: string; text: string; border: string }> = {
  TJSC: { bg: "bg-blue-50",   text: "text-blue-800",   border: "border-blue-200" },
  STJ:  { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  STF:  { bg: "bg-red-50",    text: "text-red-800",    border: "border-red-200" },
  CNJ:  { bg: "bg-teal-50",   text: "text-teal-800",   border: "border-teal-200" },
};

function orgConf(orgao: string) {
  const key = Object.keys(orgCor).find((k) => orgao?.toUpperCase().includes(k));
  return key ? orgCor[key] : { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
}

// ── Relevance border ──────────────────────────────────────────────────────────
const relevBorder: Record<string, string> = {
  crítica: "border-l-red-500",
  alta:    "border-l-orange-500",
  média:   "border-l-amber-400",
  baixa:   "border-l-slate-300",
};

export async function CentralOficialScreen({ tipoFiltro, title, description }: CentralOficialScreenProps) {
  const [updates, sources] = await Promise.all([getOfficialUpdates(), getOfficialSources()]);
  const filtered = tipoFiltro ? updates.filter((u) => u.tipo === tipoFiltro) : updates;

  const novas      = filtered.filter((u) => u.status === "nova").length;
  const importantes = filtered.filter((u) => u.importante).length;
  const lidas      = filtered.filter((u) => u.status === "lida").length;

  const fields: EntityField[] = [
    { name: "titulo",      label: "Título",      required: true },
    { name: "source_id",   label: "Fonte",        type: "select", options: sources.map((s) => ({ label: s.nome, value: s.id })) },
    { name: "orgao",       label: "Órgão",        required: true },
    { name: "tipo",        label: "Tipo",         type: "select", defaultValue: tipoFiltro ?? "comunicado", options: ["notícia", "comunicado", "provimento", "publicação oficial", "alerta", "norma", "portaria"].map((value) => ({ label: value, value })) },
    { name: "relevancia",  label: "Relevância",   type: "select", defaultValue: "média", options: ["baixa", "média", "alta", "crítica"].map((value) => ({ label: value, value })) },
    { name: "status",      label: "Status",       type: "select", defaultValue: "nova", options: ["nova", "lida", "em análise", "gerou tarefa", "arquivada"].map((value) => ({ label: value, value })) },
    { name: "publicado_em",label: "Publicado em", type: "date" },
    { name: "url_original",label: "URL original" },
    { name: "anexo_url",   label: "URL do PDF" },
    { name: "importante",  label: "Importante",   type: "checkbox" },
    { name: "resumo",      label: "Resumo",       type: "textarea" },
    { name: "conteudo",    label: "Conteúdo",     type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title={title ?? "Central Oficial"}
        description={description ?? "Cadastro manual de publicações oficiais por fonte, órgão, relevância e status."}
        actions={<EntityFormDialog title="Nova publicação oficial" fields={fields} action={createOfficialUpdate} />}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-amber-500 bg-white px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-700">{filtered.length}</p>
        </div>
        <div className={cn("rounded-xl border border-l-4 border-slate-200 bg-white px-5 py-3", novas > 0 ? "border-l-red-500" : "border-l-slate-300")}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Novas</p>
          <p className={cn("mt-1 text-2xl font-bold tabular-nums", novas > 0 ? "text-red-700" : "text-slate-500")}>{novas}</p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-yellow-400 bg-white px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Importantes</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-yellow-700">{importantes}</p>
        </div>
      </div>

      {/* Feed */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Publicações</p>
          <h2 className="mt-0.5 text-base font-semibold text-slate-900">{title ?? "Todas as publicações"}</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <FileText className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">Nenhuma publicação cadastrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <FeedItem key={u.id} update={u} deleteAction={deleteOfficialUpdate} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FeedItem({ update: u, deleteAction }: { update: OfficialUpdate; deleteAction: (id: string) => Promise<unknown> }) {
  const org  = orgConf(u.orgao ?? "");
  const bdr  = relevBorder[u.relevancia] ?? "border-l-slate-300";
  const isNew = u.status === "nova";

  return (
    <article className={cn(
      "group flex gap-4 border-l-4 px-5 py-4 transition-colors hover:bg-slate-50/60",
      bdr,
      isNew ? "" : "opacity-80",
    )}>
      {/* Left: org badge */}
      <div className="shrink-0 pt-0.5">
        <span className={cn("inline-block rounded-md border px-2 py-1 text-[11px] font-bold uppercase tracking-wide", org.bg, org.text, org.border)}>
          {u.orgao ?? "—"}
        </span>
      </div>

      {/* Center: content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {u.importante && <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
          <h3 className={cn("text-sm font-semibold leading-snug", isNew ? "text-slate-900" : "text-slate-600")}>
            {u.titulo}
          </h3>
        </div>
        {u.resumo && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{u.resumo}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          {u.publicado_em && <span>{formatDate(u.publicado_em)}</span>}
          {u.fonte_nome && <span className="text-slate-500">· {u.fonte_nome}</span>}
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
            u.relevancia === "crítica" ? "bg-red-100 text-red-800" :
            u.relevancia === "alta"    ? "bg-orange-100 text-orange-800" :
            u.relevancia === "média"   ? "bg-amber-100 text-amber-800" :
            "bg-slate-100 text-slate-600"
          )}>{u.relevancia}</span>
        </div>
      </div>

      {/* Right: status + links */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge status={u.status} />
        <div className="flex gap-2">
          {u.url_original && (
            <a href={u.url_original} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600">
              <ExternalLink className="h-3 w-3" /> Link
            </a>
          )}
          {u.anexo_url && (
            <a href={u.anexo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-600">
              <FileText className="h-3 w-3" /> PDF
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
