import { BadgeDollarSign, CircleCheck, UsersRound } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createBeneficio, deleteBeneficio } from "@/modules/rh/actions";
import { getBeneficios, getFuncionarios } from "@/modules/rh/queries";

export default async function BeneficiosPage() {
  const [beneficios, funcionarios] = await Promise.all([getBeneficios(), getFuncionarios()]);
  const ativos = beneficios.filter((item) => item.ativo);
  const custoMensal = ativos.reduce((sum, item) => sum + Number(item.valor ?? 0), 0);
  const funcionariosAtendidos = new Set(ativos.map((item) => item.funcionario_id)).size;

  const fields: EntityField[] = [
    {
      name: "funcionario_id",
      label: "Funcionário",
      type: "select",
      required: true,
      options: funcionarios.map((item) => ({ label: item.nome, value: item.id })),
    },
    { name: "nome", label: "Benefício", required: true },
    { name: "valor", label: "Valor mensal", type: "money" },
    { name: "ativo", label: "Ativo", type: "checkbox", defaultValue: true },
  ];

  return (
    <>
      <PageHeader
        title="Benefícios"
        description="Benefícios por funcionário, valores mensais e situação ativa/inativa."
        actions={<EntityFormDialog title="Novo benefício" fields={fields} action={createBeneficio} />}
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Benefícios ativos" value={ativos.length} icon={CircleCheck} tone="success" />
        <StatCard title="Funcionários atendidos" value={funcionariosAtendidos} icon={UsersRound} tone="info" />
        <StatCard title="Custo mensal" value={custoMensal} format="currency" icon={BadgeDollarSign} tone="warning" />
      </div>
      <DataTable
        data={beneficios as unknown as Record<string, unknown>[]}
        columns={[
          { key: "funcionario_nome", label: "Funcionário" },
          { key: "nome", label: "Benefício" },
          { key: "valor", label: "Valor", format: "currency" },
          { key: "ativo", label: "Ativo", format: "boolean" },
        ]}
        deleteAction={deleteBeneficio}
      />
    </>
  );
}
