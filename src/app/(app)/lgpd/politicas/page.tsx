import {
  CalendarClock,
  ExternalLink,
  FileText,
  ShieldCheck,
  Timer,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createLgpdPolitica, deleteLgpdPolitica } from "@/modules/lgpd/actions";
import { getLgpdPoliticas } from "@/modules/lgpd/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "teal" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  teal:    { text: "text-teal-700",    border: "border-l-teal-500",    icon: "text-teal-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function LgpdPoliticasPage() {
  const politicas = await getLgpdPoliticas();

  const ativas    = politicas.filter((p) => p.status === "ativa");
  const inativas  = politicas.filter((p) => p.status !== "ativa").length;
  const vencendo  = politicas.filter((p) => {
    if (!p.validade_em) return false;
    const diff = new Date(p.validade_em).getTime() - Date.now();
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  });
  const vencidas  = politicas.filter((p) => p.validade_em && new Date(p.validade_em) < new Date()).length;

  const fields: EntityField[] = [
    { name: "titulo",       label: "Título",    required: true },
    { name: "versao",       label: "Versão" },
    { name: "documento_url",label: "URL do documento", type: "url" },
    { name: "validade_em",  label: "Validade",  type: "date" },
    { name: "status",       label: "Status",    defaultValue: "ativa" },
  ];

  return (
    <>
      <PageHeader
        title="Políticas LGPD"
        description="Políticas internas de privacidade, versões, validade, documentos e situação de vigência."
        actions={<EntityFormDialog title="Nova política" fields={fields} action={createLgpdPolitica} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total" value={String(politicas.length)} sub={`${inativas} inativa${inativas !== 1 ? "s" : ""}`} icon={FileText} tone="teal" />
        <KPICard label="Ativas" value={String(ativas.length)} sub="Em vigência" icon={ShieldCheck} tone="success" />
        <KPICard label="Vencendo em 30 dias" value={String(vencendo.length)} sub={vencendo.length > 0 ? "Renovar em breve" : "Nenhuma vencendo"} icon={Timer} tone={vencendo.length > 0 ? "warning" : "success"} />
        <KPICard label="Vencidas" value={String(vencidas)} sub="Fora da validade" icon={XCircle} tone={vencidas > 0 ? "danger" : "neutral"} />
      </div>

      {/* Alerta vencendo */}
      {vencendo.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-white">
          <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50/60 px-5 py-4">
            <Timer className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Atenção</p>
              <h2 className="text-base font-semibold text-amber-900">Políticas vencendo nos próximos 30 dias</h2>
            </div>
            <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              {vencendo.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {vencendo.map((p) => {
              const dias = Math.ceil((new Date(p.validade_em!).getTime() - Date.now()) / 86_400_000);
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{p.titulo}</p>
                    <p className="text-xs text-slate-500">
                      Versão {p.versao ?? "—"} · vence em {formatDate(p.validade_em)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-semibold text-amber-700">{dias} dia{dias !== 1 ? "s" : ""}</span>
                    {p.documento_url && (
                      <a href={p.documento_url} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-teal-600 hover:underline">
                        <ExternalLink className="h-2.5 w-2.5" /> Ver doc
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Políticas ativas */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Vigência</p>
            <h2 className="text-base font-semibold text-slate-900">Políticas ativas</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {ativas.length}
          </span>
        </div>
        {ativas.length ? (
          <div className="divide-y divide-slate-100">
            {ativas.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50">
                  <FileText className="h-4 w-4 text-teal-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{p.titulo}</p>
                  <p className="text-xs text-slate-500">Versão {p.versao ?? "—"} · válida até {formatDate(p.validade_em) ?? "indeterminado"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {p.documento_url && (
                    <a href={p.documento_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-teal-600 hover:underline">
                      <ExternalLink className="h-3 w-3" /> Documento
                    </a>
                  )}
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma política ativa.</p>
        )}
      </section>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cadastro</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todas as políticas</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {politicas.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={politicas as unknown as Record<string, unknown>[]}
            columns={[
              { key: "titulo",       label: "Política" },
              { key: "versao",       label: "Versão" },
              { key: "validade_em",  label: "Validade", format: "date" },
              { key: "status",       label: "Status",   format: "status" },
              { key: "documento_url",label: "Documento" },
            ]}
            deleteAction={deleteLgpdPolitica}
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
