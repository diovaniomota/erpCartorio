import { CheckCircle2, Globe, Rss, ServerCog, Wrench, type LucideIcon } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createOfficialSource } from "@/modules/central-oficial/actions";
import { getOfficialSources } from "@/modules/central-oficial/queries";
import { cn } from "@/lib/utils";

type Tone = "amber" | "success" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  amber:   { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

const tipoIcon: Record<string, LucideIcon> = {
  RSS:      Rss,
  API:      ServerCog,
  scraping: Globe,
  manual:   Wrench,
};

const tipoColor: Record<string, string> = {
  RSS:      "bg-orange-50 text-orange-700 border-orange-200",
  API:      "bg-blue-50 text-blue-700 border-blue-200",
  scraping: "bg-purple-50 text-purple-700 border-purple-200",
  manual:   "bg-slate-100 text-slate-600 border-slate-200",
};

const fields: EntityField[] = [
  { name: "nome",  label: "Nome",  required: true },
  { name: "orgao", label: "Órgão", required: true },
  { name: "tipo",  label: "Tipo",  type: "select", defaultValue: "manual", options: ["API", "RSS", "scraping", "manual"].map((value) => ({ label: value, value })) },
  { name: "url",   label: "URL" },
  { name: "ativa", label: "Ativa", type: "checkbox", defaultValue: true },
];

export default async function FontesPage() {
  const sources = await getOfficialSources();

  const ativas   = sources.filter((s) => s.ativa);
  const inativas = sources.filter((s) => !s.ativa);

  const porTipo = Object.entries(
    sources.reduce<Record<string, number>>((acc, s) => {
      acc[s.tipo] = (acc[s.tipo] ?? 0) + 1;
      return acc;
    }, {}),
  );

  return (
    <>
      <PageHeader
        title="Fontes monitoradas"
        description="Fontes oficiais configuradas para cadastro manual, RSS, API e scraping."
        actions={<EntityFormDialog title="Nova fonte" fields={fields} action={createOfficialSource} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KPICard label="Total de fontes" value={String(sources.length)} sub="Cadastradas" icon={Globe} tone="amber" />
        <KPICard label="Ativas"          value={String(ativas.length)}  sub="Monitorando" icon={CheckCircle2} tone="success" />
        <KPICard label="Inativas"        value={String(inativas.length)} sub="Desabilitadas" icon={Globe} tone="neutral" />
      </div>

      {/* Fontes por tipo + lista de fontes ativas */}
      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        {/* Tipos */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Integração</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Por tipo</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {porTipo.map(([tipo, count]) => {
              const Icon = tipoIcon[tipo] ?? Globe;
              const color = tipoColor[tipo] ?? tipoColor.manual;
              return (
                <div key={tipo} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold", color)}>
                    <Icon className="h-3 w-3" />
                    {tipo}
                  </span>
                  <span className="ml-auto text-sm font-bold tabular-nums text-amber-700">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fontes ativas em cards */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Monitoramento</p>
              <h2 className="mt-0.5 text-base font-semibold text-slate-900">Fontes ativas</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              {ativas.length}
            </span>
          </div>
          {ativas.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma fonte ativa.</p>
          ) : (
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {ativas.map((s) => {
                const Icon  = tipoIcon[s.tipo] ?? Globe;
                const color = tipoColor[s.tipo] ?? tipoColor.manual;
                return (
                  <div key={s.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{s.nome}</p>
                      <p className="text-xs text-slate-500">{s.orgao}</p>
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="mt-0.5 truncate block text-[10px] text-blue-500 hover:underline">
                          {s.url.replace(/^https?:\/\//, "").slice(0, 40)}…
                        </a>
                      )}
                    </div>
                    <span className="ml-auto mt-0.5 shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                      ativa
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cadastro</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todas as fontes</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {sources.length}
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={sources as unknown as Record<string, unknown>[]}
            columns={[
              { key: "nome",  label: "Fonte" },
              { key: "orgao", label: "Órgão" },
              { key: "tipo",  label: "Tipo",  format: "status" },
              { key: "url",   label: "URL" },
              { key: "ativa", label: "Ativa", format: "boolean" },
            ]}
          />
        </div>
      </section>
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
