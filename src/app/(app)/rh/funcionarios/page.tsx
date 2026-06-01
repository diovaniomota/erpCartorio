import { UserCheck, UserMinus, Users, CircleDollarSign, type LucideIcon } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StaffDirectory } from "@/components/shared/record-views";
import { createFuncionario, deleteFuncionario, restoreFuncionario } from "@/modules/rh/actions";
import { getFuncionarios } from "@/modules/rh/queries";
import { cn, formatCurrency } from "@/lib/utils";

type Tone = "violet" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  violet:  { text: "text-violet-700",  border: "border-l-violet-500",  icon: "text-violet-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

const fields: EntityField[] = [
  { name: "nome", label: "Nome", required: true },
  { name: "cpf", label: "CPF", type: "cpf" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "telefone", label: "Telefone" },
  { name: "cargo", label: "Cargo", required: true },
  { name: "setor", label: "Setor", required: true },
  { name: "data_admissao", label: "Admissão", type: "date", required: true },
  { name: "tipo_contrato", label: "Tipo de contrato", required: true, defaultValue: "CLT" },
  { name: "salario", label: "Salário", type: "money" },
  { name: "status", label: "Status", type: "select", defaultValue: "ativo", options: ["ativo", "afastado", "férias", "desligado", "licença"].map((value) => ({ label: value, value })) },
  { name: "observacoes", label: "Observações", type: "textarea" },
];

export default async function FuncionariosPage() {
  const funcionarios = await getFuncionarios({ includeDeleted: true });

  const ativos     = funcionarios.filter((f) => !f.deleted_at && f.status === "ativo");
  const ausentes   = funcionarios.filter((f) => !f.deleted_at && ["afastado", "férias", "licença"].includes(f.status));
  const folha      = ativos.reduce((s, f) => s + Number(f.salario ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Funcionários"
        description="Cadastro funcional com dados contratuais, status e histórico administrativo."
        actions={<EntityFormDialog title="Novo funcionário" fields={fields} action={createFuncionario} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total" value={String(funcionarios.filter((f) => !f.deleted_at).length)} sub="Incluindo ausentes" icon={Users} tone="violet" />
        <KPICard label="Ativos" value={String(ativos.length)} sub="Em exercício" icon={UserCheck} tone="success" />
        <KPICard label="Ausentes" value={String(ausentes.length)} sub={ausentes.length > 0 ? "Afastados / férias / licença" : "Nenhum ausente"} icon={UserMinus} tone={ausentes.length > 0 ? "warning" : "success"} />
        <KPICard label="Folha estimada" value={formatCurrency(folha)} sub="Soma dos salários ativos" icon={CircleDollarSign} tone="violet" />
      </div>

      <StaffDirectory funcionarios={funcionarios} deleteAction={deleteFuncionario} restoreAction={restoreFuncionario} />
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
