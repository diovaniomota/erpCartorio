import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Inbox,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createLgpdSolicitacao, deleteLgpdSolicitacao } from "@/modules/lgpd/actions";
import { getLgpdSolicitacoes } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "teal" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  teal:    { text: "text-teal-700",    border: "border-l-teal-500",    icon: "text-teal-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function LgpdSolicitacoesPage() {
  const [solicitacoes, funcionarios] = await Promise.all([getLgpdSolicitacoes(), getFuncionarios()]);

  const hoje = new Date();
  const abertas    = solicitacoes.filter((s) => s.status !== "concluída");
  const vencendo   = solicitacoes.filter((s) => {
    const diff = new Date(s.prazo_resposta).getTime() - hoje.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000 && s.status !== "concluída";
  });
  const atrasadas  = solicitacoes.filter((s) => new Date(s.prazo_resposta) < hoje && s.status !== "concluída");
  const concluidas = solicitacoes.filter((s) => s.status === "concluída").length;

  const criticas = [...atrasadas, ...vencendo.filter((v) => !atrasadas.find((a) => a.id === v.id))];

  const fields: EntityField[] = [
    { name: "titular_nome",  label: "Titular",  required: true },
    { name: "titular_email", label: "E-mail",   type: "email" },
    { name: "tipo", label: "Tipo", type: "select", defaultValue: "acesso aos dados", options: [
      "acesso aos dados",
      "correção",
      "exclusão/bloqueio quando aplicável",
      "informação sobre compartilhamento",
      "revogação de consentimento quando aplicável",
    ].map((value) => ({ label: value, value })) },
    { name: "prazo_resposta", label: "Prazo de resposta", type: "date", required: true },
    { name: "status", label: "Status", defaultValue: "aberta" },
    { name: "responsavel_id", label: "Responsável", type: "select", options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Solicitações de titulares"
        description="Pedidos LGPD de acesso, correção, exclusão e revogação — controle de prazos e responsáveis."
        actions={<EntityFormDialog title="Nova solicitação" fields={fields} action={createLgpdSolicitacao} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Abertas" value={String(abertas.length)} sub="Aguardando resposta" icon={Inbox} tone="teal" />
        <KPICard label="Vencendo em 7 dias" value={String(vencendo.length)} sub={vencendo.length > 0 ? "Atenção ao prazo" : "Nenhuma vencendo"} icon={Timer} tone={vencendo.length > 0 ? "warning" : "success"} />
        <KPICard label="Atrasadas" value={String(atrasadas.length)} sub={atrasadas.length > 0 ? "Prazo ultrapassado" : "Tudo em dia"} icon={AlertTriangle} tone={atrasadas.length > 0 ? "danger" : "success"} />
        <KPICard label="Concluídas" value={String(concluidas)} sub={`${solicitacoes.length} total`} icon={CheckCircle2} tone="success" />
      </div>

      {/* Pipeline crítico */}
      {criticas.length > 0 && (
        <section className={cn("rounded-xl border bg-white", atrasadas.length > 0 ? "border-red-200" : "border-amber-200")}>
          <div className={cn("flex items-center gap-3 border-b px-5 py-4", atrasadas.length > 0 ? "border-red-100 bg-red-50/60" : "border-amber-100 bg-amber-50/60")}>
            <AlertTriangle className={cn("h-4 w-4", atrasadas.length > 0 ? "text-red-500" : "text-amber-500")} />
            <div>
              <p className={cn("text-[10px] font-semibold uppercase tracking-widest", atrasadas.length > 0 ? "text-red-400" : "text-amber-500")}>
                {atrasadas.length > 0 ? "Urgente" : "Atenção"}
              </p>
              <h2 className={cn("text-base font-semibold", atrasadas.length > 0 ? "text-red-900" : "text-amber-900")}>
                {atrasadas.length > 0 ? `${atrasadas.length} solicitação${atrasadas.length !== 1 ? "ões" : ""} atrasada${atrasadas.length !== 1 ? "s" : ""}` : `Vencendo em breve`}
              </h2>
            </div>
            <span className={cn("ml-auto rounded-full px-2.5 py-1 text-xs font-semibold", atrasadas.length > 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800")}>
              {criticas.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {criticas.map((s) => {
              const atrasada = new Date(s.prazo_resposta) < hoje;
              return (
                <div key={s.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", atrasada ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500")}>
                    {atrasada ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.titular_nome}</p>
                        <p className="text-xs text-slate-500">{s.tipo}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Prazo: {formatDate(s.prazo_resposta)}
                      </span>
                      {s.responsavel_nome && <span>{s.responsavel_nome}</span>}
                      {s.titular_email && <span>{s.titular_email}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Status breakdown */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Abertas",    count: abertas.length,    tone: "teal" as Tone,    icon: Inbox },
          { label: "Vencendo",   count: vencendo.length,   tone: "warning" as Tone, icon: Timer },
          { label: "Atrasadas",  count: atrasadas.length,  tone: "danger" as Tone,  icon: AlertTriangle },
        ].map((s) => {
          const c = toneConf[s.tone];
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Icon className={cn("h-4 w-4 shrink-0", c.icon)} />
              <span className="flex-1 text-sm text-slate-600">{s.label}</span>
              <span className={cn("text-lg font-bold tabular-nums", c.text)}>{s.count}</span>
            </div>
          );
        })}
      </div>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todas as solicitações</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {solicitacoes.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={solicitacoes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "titular_nome",    label: "Titular" },
              { key: "tipo",            label: "Tipo" },
              { key: "prazo_resposta",  label: "Prazo",       format: "date" },
              { key: "responsavel_nome",label: "Responsável" },
              { key: "status",          label: "Status",      format: "status" },
            ]}
            deleteAction={deleteLgpdSolicitacao}
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
