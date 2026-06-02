import {
  Bell,
  ExternalLink,
  FileText,
  Newspaper,
  Star,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createOfficialUpdate, deleteOfficialUpdate } from "@/modules/central-oficial/actions";
import { getOfficialSources, getOfficialUpdates } from "@/modules/central-oficial/queries";
import { cn, formatDate } from "@/lib/utils";

// ── Órgão config ──────────────────────────────────────────────────────────────
const orgMap: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  TJSC: { bg: "bg-blue-600",   text: "text-white", border: "border-blue-700",   ring: "ring-blue-200" },
  STJ:  { bg: "bg-purple-700", text: "text-white", border: "border-purple-800", ring: "ring-purple-200" },
  STF:  { bg: "bg-red-700",    text: "text-white", border: "border-red-800",    ring: "ring-red-200" },
  CNJ:  { bg: "bg-teal-600",   text: "text-white", border: "border-teal-700",   ring: "ring-teal-200" },
};

function getOrg(orgao: string) {
  const key = Object.keys(orgMap).find((k) => orgao?.toUpperCase().includes(k));
  return key
    ? { ...orgMap[key], abbr: key }
    : { bg: "bg-slate-500", text: "text-white", border: "border-slate-600", ring: "ring-slate-200", abbr: orgao?.split(/[\s,/]/)[0]?.toUpperCase().slice(0, 4) ?? "—" };
}

const relevBg: Record<string, string> = {
  crítica: "border-l-red-500 bg-red-50/30",
  alta:    "border-l-orange-500",
  média:   "border-l-amber-400",
  baixa:   "border-l-slate-200",
};

export default async function NoticiasOficiaisPage() {
  const [updates, sources] = await Promise.all([getOfficialUpdates(), getOfficialSources()]);
  const noticias = updates.filter((u) => u.tipo === "notícia");

  const novas      = noticias.filter((u) => u.status === "nova");
  const importantes = noticias.filter((u) => u.importante);
  const criticas   = noticias.filter((u) => u.relevancia === "crítica" || u.relevancia === "alta");

  // Agrupamento por órgão
  const porOrgao = ["TJSC", "STJ", "STF", "CNJ"].map((org) => ({
    org,
    count: noticias.filter((u) => u.orgao?.toUpperCase().includes(org)).length,
  }));

  const fields: EntityField[] = [
    { name: "titulo",      label: "Título",      required: true },
    { name: "source_id",   label: "Fonte",       type: "select", options: sources.map((s) => ({ label: s.nome, value: s.id })) },
    { name: "orgao",       label: "Órgão",       required: true },
    { name: "tipo",        label: "Tipo",        type: "select", defaultValue: "notícia", options: ["notícia", "comunicado", "provimento", "publicação oficial", "alerta", "norma", "portaria"].map((value) => ({ label: value, value })) },
    { name: "relevancia",  label: "Relevância",  type: "select", defaultValue: "média",   options: ["baixa", "média", "alta", "crítica"].map((value) => ({ label: value, value })) },
    { name: "status",      label: "Status",      type: "select", defaultValue: "nova",    options: ["nova", "lida", "em análise", "gerou tarefa", "arquivada"].map((value) => ({ label: value, value })) },
    { name: "publicado_em",label: "Publicado em",type: "date" },
    { name: "url_original",label: "URL original" },
    { name: "anexo_url",   label: "URL do PDF" },
    { name: "importante",  label: "Importante",  type: "checkbox" },
    { name: "resumo",      label: "Resumo",      type: "textarea" },
    { name: "conteudo",    label: "Conteúdo",    type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Notícias oficiais"
        description="Feed de publicações do TJSC, STJ, STF, CNJ e demais órgãos — relevância, status de leitura e vínculos internos."
        actions={<EntityFormDialog title="Nova notícia" fields={fields} action={createOfficialUpdate} />}
      />

      {/* Órgãos monitorados */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {porOrgao.map(({ org, count }) => {
          const conf = orgMap[org];
          return (
            <div key={org} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3.5", conf.ring, "ring-1")}>
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-black", conf.bg, conf.text)}>
                {org}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{org}</p>
                <p className="text-xl font-bold tabular-nums text-slate-900">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn("rounded-xl border border-l-4 border-slate-200 bg-white px-5 py-3", novas.length > 0 ? "border-l-red-500" : "border-l-slate-300")}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Não lidas</p>
          <p className={cn("mt-1 text-2xl font-bold tabular-nums", novas.length > 0 ? "text-red-700" : "text-slate-400")}>{novas.length}</p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-amber-500 bg-white px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Importantes</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-amber-700">{importantes.length}</p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-orange-500 bg-white px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Alta/Crítica</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-orange-700">{criticas.length}</p>
        </div>
      </div>

      {/* News feed */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Newspaper className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Feed de notícias</p>
            <h2 className="text-base font-semibold text-slate-900">Publicações oficiais</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {noticias.length}
          </span>
        </div>

        {noticias.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Newspaper className="h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">Nenhuma notícia cadastrada.</p>
            <p className="text-xs text-slate-300">Use o botão acima para registrar publicações oficiais.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {noticias.map((u) => {
              const org     = getOrg(u.orgao ?? "");
              const isNew   = u.status === "nova";
              const relBg   = relevBg[u.relevancia] ?? "border-l-slate-200";

              return (
                <article
                  key={u.id}
                  className={cn(
                    "group flex gap-4 border-l-4 px-5 py-5 transition-colors hover:bg-slate-50/60",
                    relBg,
                  )}
                >
                  {/* Org badge */}
                  <div className="shrink-0">
                    <span className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black shadow-sm",
                      org.bg, org.text,
                    )}>
                      {org.abbr}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      {u.importante && (
                        <Star className="mt-0.5 h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />
                      )}
                      <h3 className={cn(
                        "text-[15px] font-semibold leading-snug",
                        isNew ? "text-slate-900" : "text-slate-500",
                      )}>
                        {u.titulo}
                        {isNew && (
                          <span className="ml-2 inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-700">
                            novo
                          </span>
                        )}
                      </h3>
                    </div>

                    {u.resumo && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 leading-relaxed">
                        {u.resumo}
                      </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {u.publicado_em && (
                        <span className="text-xs text-slate-400">{formatDate(u.publicado_em)}</span>
                      )}
                      {u.fonte_nome && (
                        <span className="text-xs text-slate-400">· {u.fonte_nome}</span>
                      )}
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        u.relevancia === "crítica" ? "bg-red-100 text-red-800" :
                        u.relevancia === "alta"    ? "bg-orange-100 text-orange-800" :
                        u.relevancia === "média"   ? "bg-amber-100 text-amber-800" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {u.relevancia}
                      </span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex shrink-0 flex-col items-end gap-2.5">
                    <StatusBadge status={u.status} />
                    <div className="flex gap-2">
                      {u.url_original && (
                        <a href={u.url_original} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-500 hover:border-blue-300 hover:text-blue-600">
                          <ExternalLink className="h-3 w-3" /> Link
                        </a>
                      )}
                      {u.anexo_url && (
                        <a href={u.anexo_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-500 hover:border-red-300 hover:text-red-600">
                          <FileText className="h-3 w-3" /> PDF
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
