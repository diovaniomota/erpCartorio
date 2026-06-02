import { Suspense } from "react";
import {
  AlertCircle,
  ExternalLink,
  Newspaper,
  RefreshCw,
  Star,
  Wifi,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createOfficialUpdate } from "@/modules/central-oficial/actions";
import { getOfficialSources, getOfficialUpdates } from "@/modules/central-oficial/queries";
import { getLiveOfficialFeed, type RSSItem } from "@/modules/central-oficial/rss";
import { cn, formatDate } from "@/lib/utils";

// ── Org palette ───────────────────────────────────────────────────────────────
const ORG: Record<string, { solid: string; text: string; ring: string }> = {
  STF:  { solid: "bg-red-700",    text: "text-red-800",    ring: "ring-red-200" },
  STJ:  { solid: "bg-purple-700", text: "text-purple-800", ring: "ring-purple-200" },
  CNJ:  { solid: "bg-teal-600",   text: "text-teal-800",   ring: "ring-teal-200" },
  TJSC: { solid: "bg-blue-700",   text: "text-blue-800",   ring: "ring-blue-200" },
};

function orgConf(orgao: string) {
  const key = Object.keys(ORG).find((k) => (orgao ?? "").toUpperCase().includes(k));
  return key
    ? { ...ORG[key], abbr: key }
    : { solid: "bg-slate-600", text: "text-slate-700", ring: "ring-slate-200", abbr: (orgao ?? "?").slice(0, 4).toUpperCase() };
}

const relevBorder: Record<string, string> = {
  crítica: "border-l-red-500",
  alta:    "border-l-orange-500",
  média:   "border-l-amber-400",
  baixa:   "border-l-slate-200",
};

// ── Skeleton while RSS loads ──────────────────────────────────────────────────
function LiveFeedSkeleton() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <Newspaper className="h-4 w-4 text-slate-300" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Ao vivo · RSS</p>
          <h2 className="text-base font-semibold text-slate-900">Carregando feed…</h2>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Buscando publicações…
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Live feed section (separate async component for Suspense) ─────────────────
async function LiveFeedSection() {
  const liveFeed = await getLiveOfficialFeed();

  const feedStats = ["STF", "STJ", "CNJ", "TJSC"].map((org) => ({
    org,
    count:  liveFeed.filter((i) => i.orgao === org).length,
    online: liveFeed.some((i) => i.orgao === org),
  }));

  return (
    <>
      {/* Org status chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {feedStats.map(({ org, count, online }) => {
          const c = ORG[org];
          return (
            <div key={org} className={cn("rounded-xl border bg-white p-4 ring-1", c.ring)}>
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-lg px-2.5 py-1.5 text-sm font-black text-white", c.solid)}>
                  {org}
                </span>
                <span className={cn("flex items-center gap-1 text-[10px] font-semibold", online ? "text-emerald-600" : "text-slate-400")}>
                  {online
                    ? <><Wifi className="h-3 w-3" /> online</>
                    : <><AlertCircle className="h-3 w-3" /> offline</>}
                </span>
              </div>
              <p className={cn("mt-3 text-3xl font-bold tabular-nums", c.text)}>{count}</p>
              <p className="mt-0.5 text-xs text-slate-400">notícias</p>
            </div>
          );
        })}
      </div>

      {/* Live banner */}
      <div className={cn(
        "flex items-center gap-3 rounded-xl border px-5 py-3",
        liveFeed.length > 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50",
      )}>
        {liveFeed.length > 0 ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              FEED AO VIVO
            </span>
            <span className="text-xs text-emerald-600">
              {liveFeed.length} publicação{liveFeed.length !== 1 ? "ões" : ""} carregada{liveFeed.length !== 1 ? "s" : ""} via RSS
            </span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500">
              <RefreshCw className="h-3 w-3" /> Atualiza a cada 30 min
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">Feeds indisponíveis no momento</p>
              <p className="text-xs text-amber-600">Os servidores podem estar temporariamente inacessíveis. Tente recarregar a página.</p>
            </div>
          </>
        )}
      </div>

      {/* Feed items */}
      {liveFeed.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <Newspaper className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Ao vivo · RSS</p>
              <h2 className="text-base font-semibold text-slate-900">Últimas publicações oficiais</h2>
            </div>
            <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {liveFeed.length} itens
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {liveFeed.map((item, i) => (
              <LiveFeedItem key={`${item.orgao}-${i}`} item={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ── Page (renders instantly — RSS loads via Suspense) ─────────────────────────
export default async function NoticiasOficiaisPage() {
  const [manualUpdates, sources] = await Promise.all([
    getOfficialUpdates(),
    getOfficialSources(),
  ]);

  const manuais = manualUpdates.filter((u) => u.tipo === "notícia");

  const fields: EntityField[] = [
    { name: "titulo",      label: "Título",      required: true },
    { name: "source_id",   label: "Fonte",       type: "select", options: sources.map((s) => ({ label: s.nome, value: s.id })) },
    { name: "orgao",       label: "Órgão",       required: true },
    { name: "tipo",        label: "Tipo",        type: "select", defaultValue: "notícia", options: ["notícia", "comunicado", "provimento", "publicação oficial", "alerta", "norma", "portaria"].map((v) => ({ label: v, value: v })) },
    { name: "relevancia",  label: "Relevância",  type: "select", defaultValue: "média",   options: ["baixa", "média", "alta", "crítica"].map((v) => ({ label: v, value: v })) },
    { name: "status",      label: "Status",      type: "select", defaultValue: "nova",    options: ["nova", "lida", "em análise", "gerou tarefa", "arquivada"].map((v) => ({ label: v, value: v })) },
    { name: "publicado_em",label: "Publicado em",type: "date" },
    { name: "url_original",label: "URL original" },
    { name: "anexo_url",   label: "URL do PDF" },
    { name: "importante",  label: "Importante",  type: "checkbox" },
    { name: "resumo",      label: "Resumo",      type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Notícias oficiais"
        description="Feed ao vivo do STF, STJ, CNJ e TJSC — atualizado automaticamente a cada 30 minutos via RSS."
        actions={<EntityFormDialog title="Adicionar notícia manual" fields={fields} action={createOfficialUpdate} />}
      />

      {/* RSS feed — via Suspense para não bloquear o render */}
      <Suspense fallback={<LiveFeedSkeleton />}>
        <LiveFeedSection />
      </Suspense>

      {/* Manual entries (renderiza imediatamente) */}
      {manuais.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <Star className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cadastro interno</p>
              <h2 className="text-base font-semibold text-slate-900">Notícias adicionadas manualmente</h2>
            </div>
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {manuais.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {manuais.map((u) => {
              const org = orgConf(u.orgao ?? "");
              const bdr = relevBorder[u.relevancia] ?? "border-l-slate-200";
              return (
                <article key={u.id} className={cn("flex gap-4 border-l-4 px-5 py-4 hover:bg-slate-50/60", bdr)}>
                  <span className={cn("mt-0.5 shrink-0 rounded-lg px-2 py-1 text-[11px] font-black text-white", org.solid)}>
                    {org.abbr}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {u.importante && <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{u.titulo}</p>
                    </div>
                    {u.resumo && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{u.resumo}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      {u.publicado_em && <span>{formatDate(u.publicado_em)}</span>}
                      {u.fonte_nome   && <span>· {u.fonte_nome}</span>}
                    </div>
                  </div>
                  <StatusBadge status={u.status} />
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state — sem feeds nem entradas manuais */}
      {manuais.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white py-16 text-center">
          <Newspaper className="h-10 w-10 text-slate-200" />
          <p className="text-sm font-medium text-slate-400">Nenhuma notícia manual cadastrada.</p>
          <p className="text-xs text-slate-300">Use o botão acima para registrar ou aguarde o feed ao vivo carregar.</p>
        </div>
      )}
    </>
  );
}

// ── LiveFeedItem ──────────────────────────────────────────────────────────────
function LiveFeedItem({ item }: { item: RSSItem }) {
  const org = orgConf(item.orgao);

  return (
    <article className="group flex gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
      <div className="shrink-0 pt-0.5">
        <span className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl text-xs font-black text-white shadow-sm",
          org.solid,
        )}>
          {org.abbr}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-blue-700">
          {item.titulo}
        </p>
        {item.descricao && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {item.descricao}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[11px] text-slate-400">
          {item.publicado_em && <span>{formatDate(item.publicado_em)}</span>}
          <span>· {item.fonte}</span>
        </div>
      </div>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Abrir
        </a>
      )}
    </article>
  );
}
