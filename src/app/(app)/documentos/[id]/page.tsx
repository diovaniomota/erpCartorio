import { notFound } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  FolderOpen,
  Link2,
  Lock,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDocumentoInterno } from "@/modules/documentos/queries";
import { cn, formatDate } from "@/lib/utils";

export default async function DocumentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocumentoInterno(id);
  if (!doc) notFound();

  const hoje = new Date();
  const vencidoEm  = doc.validade_em ? new Date(doc.validade_em) : null;
  const diasRestantes = vencidoEm
    ? Math.ceil((vencidoEm.getTime() - hoje.getTime()) / 86_400_000)
    : null;
  const vencido = diasRestantes !== null && diasRestantes < 0;
  const vencendo = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 30;

  return (
    <>
      <PageHeader
        title={doc.titulo}
        description="Documento interno administrativo com metadados, validade e controle de acesso."
      />

      {/* Hero card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Header strip */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Documento</p>
              {doc.pasta && (
                <code className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                  {doc.pasta}
                </code>
              )}
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">{doc.titulo}</h2>
          </div>
          <StatusBadge status={doc.status} />
        </div>

        {/* Info grid */}
        <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">
          <InfoCell icon={Tag}         label="Categoria"  value={doc.categoria} />
          <InfoCell icon={FolderOpen}  label="Pasta"      value={doc.pasta} />
          <InfoCell icon={Lock}        label="Acesso"     value={doc.acesso} tone={doc.acesso === "restrito" ? "warning" : doc.acesso === "gestores" ? "info" : "success"} />
          <InfoCell
            icon={CalendarDays}
            label="Validade"
            value={formatDate(doc.validade_em)}
            sub={
              diasRestantes !== null
                ? vencido
                  ? `Vencido há ${Math.abs(diasRestantes)} dia${Math.abs(diasRestantes) !== 1 ? "s" : ""}`
                  : `${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} restante${diasRestantes !== 1 ? "s" : ""}`
                : undefined
            }
            tone={vencido ? "danger" : vencendo ? "warning" : "success"}
          />
          {doc.vinculo_tipo && <InfoCell icon={Link2} label="Vínculo" value={`${doc.vinculo_tipo}${doc.vinculo_id ? ` · ${doc.vinculo_id}` : ""}`} />}
        </div>

        {/* Arquivo */}
        {doc.arquivo_url && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Arquivo</p>
            <a
              href={doc.arquivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir documento
            </a>
          </div>
        )}
      </section>

      {/* Alerta de validade */}
      {(vencido || vencendo) && (
        <div className={cn(
          "flex items-center gap-3 rounded-xl border px-5 py-4",
          vencido ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50",
        )}>
          <CalendarDays className={cn("h-4 w-4 shrink-0", vencido ? "text-red-500" : "text-amber-500")} />
          <div>
            <p className={cn("text-sm font-medium", vencido ? "text-red-700" : "text-amber-700")}>
              {vencido
                ? `Este documento está vencido há ${Math.abs(diasRestantes!)} dia${Math.abs(diasRestantes!) !== 1 ? "s" : ""}.`
                : `Este documento vence em ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""} (${formatDate(doc.validade_em)}).`}
            </p>
            <p className={cn("text-xs", vencido ? "text-red-500" : "text-amber-500")}>
              {vencido ? "Considere renovar ou arquivar." : "Renove antes do vencimento."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

type Tone = "success" | "danger" | "warning" | "info" | "neutral";
const toneText: Record<Tone, string> = {
  success: "text-emerald-700",
  danger:  "text-red-700",
  warning: "text-amber-700",
  info:    "text-blue-700",
  neutral: "text-slate-600",
};

function InfoCell({ icon: Icon, label, value, sub, tone = "neutral" }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneText[tone])} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={cn("mt-1 text-sm font-medium", value ? "text-slate-900" : "text-slate-400")}>
          {value || "—"}
        </p>
        {sub && <p className={cn("mt-0.5 text-xs", toneText[tone])}>{sub}</p>}
      </div>
    </div>
  );
}
