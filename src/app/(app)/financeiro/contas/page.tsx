import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Clock } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { FinancialLedger } from "@/components/shared/record-views";
import { createContaFinanceira, deleteContaFinanceira, restoreContaFinanceira } from "@/modules/financeiro/actions";
import { getFinanceiroCategorias, getContasFinanceiras } from "@/modules/financeiro/queries";
import { getContratos } from "@/modules/contratos/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";
import { cn, formatCurrency } from "@/lib/utils";

type ContasPageProps = {
  searchParams?: Promise<{ tipo?: string }>;
};

export default async function ContasPage({ searchParams }: ContasPageProps) {
  const params = await searchParams;
  const [contas, fornecedores, contratos, categorias] = await Promise.all([
    getContasFinanceiras({ includeDeleted: true }),
    getFornecedores(),
    getContratos(),
    getFinanceiroCategorias(),
  ]);

  const tipoFiltro = params?.tipo === "pagar" || params?.tipo === "receber" ? params.tipo : undefined;
  const contasFiltradas = tipoFiltro ? contas.filter((conta) => conta.tipo === tipoFiltro) : contas;

  // KPI numbers (active records only)
  const ativas = contas.filter((c) => !c.deleted_at);
  const totalPagar  = ativas.filter((c) => c.tipo === "pagar"    && !["paga", "cancelada"].includes(c.status)).reduce((s, c) => s + c.valor, 0);
  const totalReceber = ativas.filter((c) => c.tipo === "receber" && !["recebida", "cancelada"].includes(c.status)).reduce((s, c) => s + c.valor, 0);
  const vencidas = ativas.filter((c) => c.status === "vencida").length;
  const pendentes = ativas.filter((c) => c.status === "aberta").length;

  const fields: EntityField[] = [
    { name: "descricao", label: "Descrição", required: true },
    { name: "tipo", label: "Tipo", type: "select", defaultValue: "pagar", options: [{ label: "Pagar", value: "pagar" }, { label: "Receber", value: "receber" }] },
    { name: "valor", label: "Valor", type: "money", required: true },
    { name: "data_vencimento", label: "Vencimento", type: "date", required: true },
    { name: "status", label: "Status", type: "select", defaultValue: "aberta", options: ["aberta", "agendada", "paga", "vencida", "cancelada", "estornada"].map((value) => ({ label: value, value })) },
    { name: "fornecedor_id", label: "Fornecedor", type: "select", options: fornecedores.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "contrato_id", label: "Contrato", type: "select", options: contratos.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "categoria_id", label: "Categoria", type: "select", options: categorias.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "centro_custo", label: "Centro de custo" },
    { name: "codigo_barras", label: "Código de barras" },
    { name: "recorrente", label: "Recorrente", type: "checkbox" },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  const title = tipoFiltro === "pagar" ? "Contas a pagar" : tipoFiltro === "receber" ? "Contas a receber" : "Contas e boletos";

  return (
    <>
      <PageHeader
        title={title}
        description={
          tipoFiltro
            ? `Controle filtrado de contas a ${tipoFiltro === "pagar" ? "pagar" : "receber"}, vencimentos e status financeiro.`
            : "Controle de contas a pagar/receber, boletos, vencimentos e status financeiro."
        }
        actions={<EntityFormDialog title="Nova conta" fields={fields} action={createContaFinanceira} />}
      />

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="A pagar" value={formatCurrency(totalPagar)} icon={ArrowDownCircle} tone="warning" />
        <KPICard label="A receber" value={formatCurrency(totalReceber)} icon={ArrowUpCircle} tone="success" />
        <KPICard label="Contas abertas" value={String(pendentes)} icon={Clock} tone="info" />
        <KPICard label="Vencidas" value={String(vencidas)} icon={AlertCircle} tone={vencidas > 0 ? "danger" : "success"} />
      </div>

      <FinancialLedger contas={contasFiltradas} deleteAction={deleteContaFinanceira} restoreAction={restoreContaFinanceira} />
    </>
  );
}

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

function KPICard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone: Tone }) {
  const config: Record<Tone, { text: string; border: string; icon: string }> = {
    success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
    warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
    danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
    info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500" },
    neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
  };
  const c = config[tone];
  return (
    <div className={cn("rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4", c.border)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", c.icon)} />
      </div>
      <p className={cn("mt-3 text-xl font-bold leading-none tabular-nums", c.text)}>{value}</p>
    </div>
  );
}
