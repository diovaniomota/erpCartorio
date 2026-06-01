import { CircleDollarSign, Hammer, Wrench } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createInventarioManutencao, deleteInventarioManutencao } from "@/modules/inventario/actions";
import { getInventarioItens, getInventarioManutencoes } from "@/modules/inventario/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";

export default async function InventarioManutencoesPage() {
  const [manutencoes, itens, fornecedores] = await Promise.all([
    getInventarioManutencoes(),
    getInventarioItens(),
    getFornecedores(),
  ]);
  const abertas = manutencoes.filter((item) => item.status !== "concluída" && item.status !== "cancelada").length;
  const custo = manutencoes.reduce((sum, item) => sum + Number(item.custo ?? 0), 0);

  const fields: EntityField[] = [
    {
      name: "item_id",
      label: "Patrimônio",
      type: "select",
      required: true,
      options: itens.map((item) => ({ label: `${item.codigo_patrimonio} - ${item.nome}`, value: item.id })),
    },
    {
      name: "fornecedor_id",
      label: "Fornecedor",
      type: "select",
      options: fornecedores.map((item) => ({ label: item.nome, value: item.id })),
    },
    { name: "descricao", label: "Descrição", type: "textarea", required: true },
    { name: "data_inicio", label: "Início", type: "date", required: true },
    { name: "data_fim", label: "Fim", type: "date" },
    { name: "custo", label: "Custo", type: "money" },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "aberta",
      options: ["aberta", "em andamento", "concluída", "cancelada"].map((value) => ({ label: value, value })),
    },
  ];

  return (
    <>
      <PageHeader
        title="Manutenções do patrimônio"
        description="Controle de manutenção preventiva e corretiva, fornecedor, custo, início, conclusão e status."
        actions={<EntityFormDialog title="Nova manutenção" fields={fields} action={createInventarioManutencao} />}
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Manutenções registradas" value={manutencoes.length} icon={Wrench} tone="info" />
        <StatCard title="Em aberto" value={abertas} icon={Hammer} tone="warning" />
        <StatCard title="Custo registrado" value={custo} format="currency" icon={CircleDollarSign} tone="neutral" />
      </div>
      <DataTable
        data={manutencoes as unknown as Record<string, unknown>[]}
        columns={[
          { key: "item_nome", label: "Patrimônio" },
          { key: "fornecedor_nome", label: "Fornecedor" },
          { key: "descricao", label: "Descrição" },
          { key: "data_inicio", label: "Início", format: "date" },
          { key: "data_fim", label: "Fim", format: "date" },
          { key: "custo", label: "Custo", format: "currency" },
          { key: "status", label: "Status", format: "status" },
        ]}
        deleteAction={deleteInventarioManutencao}
      />
    </>
  );
}
