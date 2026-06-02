import {
  Bell,
  FileText,
  Megaphone,
  ScrollText,
  Star,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getOfficialSources, getOfficialUpdates } from "@/modules/central-oficial/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "amber" | "danger" | "success" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  amber:   { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

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

export default async function CentralOficialPage() {
  const [updates, sources] = await Promise.all([getOfficialUpdates(), getOfficialSources()]);

  const novas      = updates.filter((u) => u.status === "nova");
  const importantes = updates.filter((u) => u.importante);
  const fontes      = sources.filter((s) => s.ativa).length;

  const porTipo = {
    noticias:    updates.filter((u) => u.tipo === "notícia"),
    comunicados: updates.filter((u) => u.tipo === "comunicado"),
    provimentos: updates.filter((u) => u.tipo === "provimento"),
  };

  return (
    <>
      <PageHeader
        title="Central Oficial"
        description="Acompanhamento consolidado de publicações, comunicados, provimentos e alertas oficiais."
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total de publicações" value={String(updates.length)}     sub={`${fontes} fonte${fontes !== 1 ? "s" : ""} ativa${fontes !== 1 ? "s" : ""}`} icon={Bell}      tone="amber" />
        <KPICard label="Novas / não lidas"    value={String(novas.length)}       sub={novas.length > 0 ? "Aguardando leitura" : "Tudo lido"} icon={Bell}         tone={novas.length > 0 ? "danger" : "success"} />
        <KPICard label="Importantes"          value={String(importantes.length)} sub="Marcadas com estrela"  icon={Star}         tone="amber" />
        <KPICard label="Provimentos"          value={String(porTipo.provimentos.length)} sub="Normas e regulações"  icon={ScrollText}  tone="neutral" />
      </div>

      {/* Tipo breakdown */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Notícias",    count: porTipo.noticias.length,    icon: FileText,    href: "/central-oficial/noticias" },
          { label: "Comunicados", count: porTipo.comunicados.length, icon: Megaphone,   href: "/central-oficial/comunicados" },
          { label: "Provimentos", count: porTipo.provimentos.length, icon: ScrollText,  href: "/central-oficial/provimentos" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <a key={s.label} href={s.href}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-colors hover:border-amber-300 hover:bg-amber-50/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <Icon className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className="text-2xl font-bold tabular-nums text-amber-700">{s.count}</p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Publicações recentes + novas */}
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        {/* Recentes */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Feed</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Publicações recentes</h2>
          </div>
          {updates.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma publicação cadastrada.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {updates.slice(0, 8).map((u) => {
                const org = orgConf(u.orgao ?? "");
                return (
                  <div key={u.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className={cn("mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase", org.bg, org.text, org.border)}>
                      {u.orgao?.split(/[\s,/]/)[0] ?? "—"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("line-clamp-1 text-sm font-medium", u.status === "nova" ? "text-slate-900" : "text-slate-500")}>
                        {u.titulo}
                      </p>
                      <p className="text-[11px] text-slate-400">{formatDate(u.publicado_em)} · {u.tipo}</p>
                    </div>
                    {u.importante && <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Novas não lidas */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Inbox</p>
              <h2 className="mt-0.5 text-base font-semibold text-slate-900">Não lidas</h2>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", novas.length > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500")}>
              {novas.length}
            </span>
          </div>
          {novas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <Bell className="h-7 w-7 text-slate-200" />
              <p className="text-sm text-slate-400">Tudo lido.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {novas.slice(0, 8).map((u) => {
                const rel = u.relevancia === "crítica" ? "bg-red-50 border-l-red-400" :
                            u.relevancia === "alta"    ? "bg-orange-50 border-l-orange-400" :
                            "border-l-amber-300";
                return (
                  <div key={u.id} className={cn("flex items-start gap-3 border-l-2 px-5 py-3.5", rel)}>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{u.titulo}</p>
                      <p className="text-[11px] text-slate-400">{u.orgao} · {formatDate(u.publicado_em)}</p>
                    </div>
                  </div>
                );
              })}
              {novas.length > 8 && (
                <p className="px-5 py-2 text-xs text-slate-400">+ {novas.length - 8} não lidas</p>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function KPICard({ label, value, sub, icon: Icon, tone }: {
  label: string; value: string; sub?: string; icon: LucideIcon; tone: Tone;
}) {
  const c = toneConf[tone];
  return (
    <div className={cn("rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4", c.border)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", c.icon)} aria-hidden="true" />
      </div>
      <p className={cn("mt-3 text-2xl font-bold leading-none tabular-nums", c.text)}>{value}</p>
      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
