import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { ModuleTabs } from "@/components/shared/module-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { AssetGrid } from "@/components/shared/record-views";
import { StatCard } from "@/components/shared/stat-card";
import { createInventarioItem, deleteInventarioItem } from "@/modules/inventario/actions";
import { getInventarioItens } from "@/modules/inventario/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";
import { getFuncionarios } from "@/modules/rh/queries";
import { Archive, CircleDollarSign, PackageCheck, Wrench } from "lucide-react";

type InventarioPageProps = {
  searchParams?: Promise<{ status?: string }>;
};

export default async function InventarioPage({ searchParams }: InventarioPageProps) {
  const params = await searchParams;
  const [itens, fornecedores, funcionarios] = await Promise.all([getInventarioItens(), getFornecedores(), getFuncionarios()]);
  const statusFiltro = params?.status;
  const itensFiltrados = statusFiltro ? itens.filter((item) => item.status === statusFiltro) : itens;
  const fields: EntityField[] = [
    { name: "codigo_patrimonio", label: "Código patrimonial", required: true },
    { name: "nome", label: "Nome", required: true },
    { name: "categoria", label: "Categoria", required: true },
    { name: "numero_serie", label: "Número de série" },
    { name: "fornecedor_id", label: "Fornecedor", type: "select", options: fornecedores.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "valor_compra", label: "Valor de compra", type: "money" },
    { name: "data_compra", label: "Compra", type: "date" },
    { name: "garantia_ate", label: "Garantia até", type: "date" },
    { name: "localizacao", label: "Localização", required: true },
    { name: "responsavel_id", label: "Responsável", type: "select", options: funcionarios.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "status", label: "Status", type: "select", defaultValue: "em uso", options: ["em uso", "em manutenção", "reservado", "baixado", "perdido", "danificado", "vendido"].map((value) => ({ label: value, value })) },
    { name: "descricao", label: "Descrição", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title={statusFiltro === "baixado" ? "Baixas patrimoniais" : "Inventário e patrimônio"}
        description={
          statusFiltro
            ? `Itens patrimoniais com status ${statusFiltro}.`
            : "Itens patrimoniais, responsáveis, localizações, garantias, manutenções e baixas."
        }
        actions={<EntityFormDialog title="Novo patrimônio" fields={fields} action={createInventarioItem} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Itens patrimoniais" value={itens.length} icon={PackageCheck} tone="info" />
        <StatCard title="Em manutenção" value={itens.filter((item) => item.status === "em manutenção").length} icon={Wrench} tone="warning" />
        <StatCard title="Patrimônio total" value={itens.reduce((sum, item) => sum + Number(item.valor_compra ?? 0), 0)} format="currency" icon={CircleDollarSign} tone="success" />
      </div>
      <ModuleTabs
        tabs={[
          { label: "Todos", href: "/inventario", active: !statusFiltro, count: itens.length, icon: PackageCheck },
          { label: "Em uso", href: "/inventario?status=em%20uso", active: statusFiltro === "em uso", count: itens.filter((item) => item.status === "em uso").length, icon: PackageCheck },
          { label: "Manutenção", href: "/inventario?status=em%20manutenção", active: statusFiltro === "em manutenção", count: itens.filter((item) => item.status === "em manutenção").length, icon: Wrench },
          { label: "Baixas", href: "/inventario?status=baixado", active: statusFiltro === "baixado", count: itens.filter((item) => item.status === "baixado").length, icon: Archive },
        ]}
      />
      <AssetGrid itens={itensFiltrados} deleteAction={deleteInventarioItem} />
    </>
  );
}
