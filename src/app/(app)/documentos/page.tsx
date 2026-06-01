import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  FileCheck,
  Files,
  FolderOpen,
  ShieldOff,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentLibrary } from "@/components/shared/record-views";
import { createDocumentoInterno, deleteDocumentoInterno, restoreDocumentoInterno } from "@/modules/documentos/actions";
import { getDocumentosInternos } from "@/modules/documentos/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "sky" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  sky:     { text: "text-sky-700",     border: "border-l-sky-500",     icon: "text-sky-500",     dot: "bg-sky-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

const fields: EntityField[] = [
  { name: "titulo", label: "Título", required: true },
  { name: "categoria", label: "Categoria", type: "select", defaultValue: "outros", options: [
    "contratos", "políticas internas", "manuais", "comprovantes",
    "documentos de funcionários", "documentos de fornecedores", "documentos LGPD",
    "documentos financeiros", "atas de reunião", "treinamentos", "outros",
  ].map((value) => ({ label: value, value })) },
  { name: "pasta",       label: "Pasta" },
  { name: "arquivo_url", label: "URL do arquivo" },
  { name: "validade_em", label: "Validade",  type: "date" },
  { name: "status",      label: "Status",    type: "select", defaultValue: "ativo", options: ["ativo", "vencido", "arquivado"].map((value) => ({ label: value, value })) },
  { name: "acesso",      label: "Acesso",    type: "select", defaultValue: "restrito", options: ["todos", "restrito", "gestores"].map((value) => ({ label: value, value })) },
  { name: "vinculo_tipo",label: "Vínculo tipo" },
  { name: "vinculo_id",  label: "Vínculo ID" },
];

export default async function DocumentosPage() {
  const docs = await getDocumentosInternos({ includeDeleted: true });

  const hoje    = new Date();
  const ativos  = docs.filter((d) => !d.deleted_at && d.status === "ativo");
  const vencidos = docs.filter((d) => !d.deleted_at && (
    d.status === "vencido" || (d.validade_em && new Date(d.validade_em) < hoje)
  ));
  const vencendo = docs.filter((d) => {
    if (!d.validade_em || d.deleted_at) return false;
    const diff = new Date(d.validade_em).getTime() - hoje.getTime();
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000 && d.status === "ativo";
  });
  const semAcesso = ativos.filter((d) => !d.acesso || d.acesso === "restrito");

  const pastas = [...new Set(ativos.map((d) => d.pasta).filter(Boolean))];

  const porCategoria = Object.entries(
    ativos.reduce<Record<string, number>>((acc, d) => {
      const c = d.categoria ?? "outros";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Documentos internos"
        description="Arquivo administrativo com categorias, pastas, validade, controle de acesso e vínculos."
        actions={<EntityFormDialog title="Novo documento" fields={fields} action={createDocumentoInterno} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total de documentos" value={String(docs.filter((d) => !d.deleted_at).length)} sub={`${pastas.length} pasta${pastas.length !== 1 ? "s" : ""}`} icon={Files} tone="sky" />
        <KPICard label="Ativos" value={String(ativos.length)} sub="Com acesso" icon={FileCheck} tone="success" />
        <KPICard label="Vencendo em 30 dias" value={String(vencendo.length)} sub={vencendo.length > 0 ? "Renovar em breve" : "Nenhum vencendo"} icon={Timer} tone={vencendo.length > 0 ? "warning" : "success"} />
        <KPICard label="Vencidos" value={String(vencidos.length)} sub="Fora da validade" icon={AlertTriangle} tone={vencidos.length > 0 ? "danger" : "neutral"} />
      </div>

      {/* Categorias + Pastas */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        {/* Categorias */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Organização</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Distribuição por categoria</h2>
          </div>
          {porCategoria.length ? (
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
              {porCategoria.map(([cat, count]) => (
                <div key={cat} className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="text-2xl font-bold tabular-nums text-sky-700">{count}</span>
                  <span className="mt-1 line-clamp-1 text-xs text-slate-500 capitalize">{cat}</span>
                  <span className="mt-2 h-0.5 w-6 rounded-full bg-sky-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum documento cadastrado.</p>
          )}
        </section>

        {/* Pastas */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Arquivo</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Pastas</h2>
          </div>
          {pastas.length ? (
            <div className="divide-y divide-slate-100">
              {pastas.map((pasta) => {
                const count = ativos.filter((d) => d.pasta === pasta).length;
                return (
                  <div key={pasta} className="flex items-center gap-3 px-5 py-3">
                    <FolderOpen className="h-4 w-4 shrink-0 text-sky-400" />
                    <span className="flex-1 truncate text-sm text-slate-700">{pasta}</span>
                    <span className="text-sm font-semibold tabular-nums text-sky-700">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma pasta criada.</p>
          )}
          {vencendo.length > 0 && (
            <div className="border-t border-amber-100 bg-amber-50 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <CalendarClock className="h-3.5 w-3.5" />
                <span><strong>{vencendo.length}</strong> documento{vencendo.length !== 1 ? "s" : ""} vencendo em 30 dias</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Alerta vencendo */}
      {vencendo.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-white">
          <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50/60 px-5 py-4">
            <Timer className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Atenção</p>
              <h2 className="text-base font-semibold text-amber-900">Documentos vencendo nos próximos 30 dias</h2>
            </div>
            <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {vencendo.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {vencendo.map((d) => {
              const dias = Math.ceil((new Date(d.validade_em!).getTime() - hoje.getTime()) / 86_400_000);
              return (
                <div key={d.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{d.titulo}</p>
                    <p className="text-xs text-slate-500">{d.categoria} {d.pasta ? `· ${d.pasta}` : ""}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-amber-700">{dias} dia{dias !== 1 ? "s" : ""}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(d.validade_em)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Alerta vencidos */}
      {vencidos.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-white">
          <div className="flex items-center gap-3 border-b border-red-100 bg-red-50/60 px-5 py-4">
            <ShieldOff className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">Vencidos</p>
              <h2 className="text-base font-semibold text-red-900">{vencidos.length} documento{vencidos.length !== 1 ? "s" : ""} fora da validade</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {vencidos.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-slate-50/60">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-900">{d.titulo}</p>
                  <p className="text-xs text-slate-500">{d.categoria}</p>
                </div>
                <p className="shrink-0 text-xs text-red-600">{formatDate(d.validade_em)}</p>
              </div>
            ))}
            {vencidos.length > 5 && (
              <p className="px-5 py-2 text-xs text-slate-400">+ {vencidos.length - 5} vencidos</p>
            )}
          </div>
        </section>
      )}

      {/* Biblioteca de documentos */}
      <DocumentLibrary docs={docs} deleteAction={deleteDocumentoInterno} restoreAction={restoreDocumentoInterno} />
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
