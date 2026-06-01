import {
  BadgeDollarSign,
  CircleCheck,
  CircleDollarSign,
  CircleOff,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createBeneficio, deleteBeneficio } from "@/modules/rh/actions";
import { getBeneficios, getFuncionarios } from "@/modules/rh/queries";
import { cn, formatCurrency } from "@/lib/utils";

type Tone = "violet" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  violet:  { text: "text-violet-700",  border: "border-l-violet-500",  icon: "text-violet-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function BeneficiosPage() {
  const [beneficios, funcionarios] = await Promise.all([getBeneficios(), getFuncionarios()]);

  const ativos              = beneficios.filter((b) => b.ativo);
  const inativos            = beneficios.filter((b) => !b.ativo);
  const custoMensal         = ativos.reduce((s, b) => s + Number(b.valor ?? 0), 0);
  const funcionariosAtendidos = new Set(ativos.map((b) => b.funcionario_id)).size;

  // Breakdown por tipo de benefício
  const porNome = Object.entries(
    ativos.reduce<Record<string, { count: number; custo: number }>>((acc, b) => {
      const n = b.nome ?? "Sem nome";
      acc[n] = acc[n] ?? { count: 0, custo: 0 };
      acc[n].count += 1;
      acc[n].custo += Number(b.valor ?? 0);
      return acc;
    }, {}),
  ).sort((a, b) => b[1].custo - a[1].custo);

  const fields: EntityField[] = [
    { name: "funcionario_id", label: "Funcionário", type: "select", required: true, options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "nome",  label: "Benefício",    required: true },
    { name: "valor", label: "Valor mensal", type: "money" },
    { name: "ativo", label: "Ativo",        type: "checkbox", defaultValue: true },
  ];

  return (
    <>
      <PageHeader
        title="Benefícios"
        description="Benefícios por funcionário, valores mensais e situação ativa/inativa."
        actions={<EntityFormDialog title="Novo benefício" fields={fields} action={createBeneficio} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Benefícios ativos" value={String(ativos.length)} sub={`${inativos.length} inativo${inativos.length !== 1 ? "s" : ""}`} icon={CircleCheck} tone="success" />
        <KPICard label="Funcionários cobertos" value={String(funcionariosAtendidos)} sub={`de ${funcionarios.filter((f) => f.status === "ativo").length} ativos`} icon={UsersRound} tone="violet" />
        <KPICard label="Custo mensal" value={formatCurrency(custoMensal)} sub="Benefícios ativos" icon={CircleDollarSign} tone="warning" />
        <KPICard label="Custo por funcionário" value={funcionariosAtendidos > 0 ? formatCurrency(custoMensal / funcionariosAtendidos) : "—"} sub="Média" icon={BadgeDollarSign} tone="neutral" />
      </div>

      {/* Breakdown por tipo + distribuição */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Tipos de benefício */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Composição</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Tipos de benefício</h2>
          </div>
          {porNome.length ? (
            <div className="divide-y divide-slate-100">
              {porNome.map(([nome, { count, custo }]) => (
                <div key={nome} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50">
                    <CircleCheck className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{nome}</p>
                    <p className="text-xs text-slate-500">{count} funcionário{count !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-violet-700">{formatCurrency(custo)}/mês</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum benefício ativo.</p>
          )}
        </section>

        {/* Distribuição ativo/inativo */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Situação</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Status</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 py-5">
              <CircleCheck className="mb-2 h-5 w-5 text-emerald-500" />
              <span className="text-3xl font-bold tabular-nums text-emerald-700">{ativos.length}</span>
              <span className="mt-1 text-xs text-slate-500">Ativos</span>
              <span className="mt-2 h-1 w-8 rounded-full bg-emerald-500" />
            </div>
            <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 py-5">
              <CircleOff className="mb-2 h-5 w-5 text-slate-400" />
              <span className="text-3xl font-bold tabular-nums text-slate-600">{inativos.length}</span>
              <span className="mt-1 text-xs text-slate-500">Inativos</span>
              <span className="mt-2 h-1 w-8 rounded-full bg-slate-300" />
            </div>
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">
              Custo total ativo: <span className="font-semibold text-violet-700">{formatCurrency(custoMensal)}/mês</span>
            </p>
          </div>
        </section>
      </div>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cadastro</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todos os benefícios</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {beneficios.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={beneficios as unknown as Record<string, unknown>[]}
            columns={[
              { key: "funcionario_nome", label: "Funcionário" },
              { key: "nome",             label: "Benefício" },
              { key: "valor",            label: "Valor",    format: "currency" },
              { key: "ativo",            label: "Ativo",    format: "boolean" },
            ]}
            deleteAction={deleteBeneficio}
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
