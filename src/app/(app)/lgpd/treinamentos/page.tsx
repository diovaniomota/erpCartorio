import {
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Paperclip,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createLgpdTreinamento, deleteLgpdTreinamento } from "@/modules/lgpd/actions";
import { getLgpdTreinamentos } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";
import { cn, formatDate } from "@/lib/utils";

type Tone = "teal" | "success" | "warning" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  teal:    { text: "text-teal-700",    border: "border-l-teal-500",    icon: "text-teal-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function LgpdTreinamentosPage() {
  const [treinamentos, funcionarios] = await Promise.all([getLgpdTreinamentos(), getFuncionarios()]);

  const participantes  = treinamentos.reduce((s, t) => s + (Array.isArray(t.participantes) ? t.participantes.length : 0), 0);
  const comComprovante = treinamentos.filter((t) => t.comprovante_url).length;
  const semComprovante = treinamentos.length - comComprovante;

  const fields: EntityField[] = [
    { name: "titulo",           label: "Título",     required: true },
    { name: "data_treinamento", label: "Data",       type: "date", required: true },
    { name: "responsavel_id",   label: "Responsável", type: "select", options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "participantes",    label: "Participantes (separados por vírgula)", type: "textarea" },
    { name: "comprovante_url",  label: "URL do comprovante", type: "url" },
  ];

  return (
    <>
      <PageHeader
        title="Treinamentos LGPD"
        description="Treinamentos de proteção de dados realizados, participantes, responsáveis e comprovantes."
        actions={<EntityFormDialog title="Novo treinamento" fields={fields} action={createLgpdTreinamento} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KPICard label="Treinamentos" value={String(treinamentos.length)} sub="Total realizado" icon={GraduationCap} tone="teal" />
        <KPICard label="Participações" value={String(participantes)} sub="Total acumulado" icon={UsersRound} tone="success" />
        <KPICard label="Com comprovante" value={String(comComprovante)} sub={semComprovante > 0 ? `${semComprovante} sem comprovante` : "Todos comprovados"} icon={Paperclip} tone={semComprovante > 0 ? "warning" : "success"} />
      </div>

      {/* Lista de treinamentos */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <GraduationCap className="h-4 w-4 text-teal-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="text-base font-semibold text-slate-900">Treinamentos realizados</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {treinamentos.length}
          </span>
        </div>
        {treinamentos.length ? (
          <div className="divide-y divide-slate-100">
            {treinamentos.map((t) => {
              const qtdPart = Array.isArray(t.participantes) ? t.participantes.length : 0;
              return (
                <div key={t.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50">
                    <GraduationCap className="h-4 w-4 text-teal-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{t.titulo}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {formatDate(t.data_treinamento)}
                      </span>
                      {t.responsavel_nome && <span>{t.responsavel_nome}</span>}
                      {qtdPart > 0 && (
                        <span className="flex items-center gap-1">
                          <UsersRound className="h-3 w-3" /> {qtdPart} participante{qtdPart !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  {t.comprovante_url ? (
                    <a
                      href={t.comprovante_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
                    >
                      <ExternalLink className="h-3 w-3" /> Comprovante
                    </a>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400">
                      <Paperclip className="h-3 w-3" /> Sem comprovante
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <GraduationCap className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Nenhum treinamento registrado.</p>
          </div>
        )}
      </section>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Dados</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Tabela completa</h2>
          </div>
        </div>
        <div className="p-4">
          <DataTable
            data={treinamentos as unknown as Record<string, unknown>[]}
            columns={[
              { key: "titulo",           label: "Treinamento" },
              { key: "data_treinamento", label: "Data",         format: "date" },
              { key: "responsavel_nome", label: "Responsável" },
              { key: "comprovante_url",  label: "Comprovante" },
            ]}
            deleteAction={deleteLgpdTreinamento}
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
