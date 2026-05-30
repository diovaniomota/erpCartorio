import { FileCheck2, ServerCog, ShieldCheck } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createLgpdFornecedorOperador, deleteLgpdFornecedorOperador } from "@/modules/lgpd/actions";
import { getLgpdFornecedoresOperadores } from "@/modules/lgpd/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";

export default async function LgpdFornecedoresOperadoresPage() {
  const [operadores, fornecedores] = await Promise.all([getLgpdFornecedoresOperadores(), getFornecedores()]);
  const ativos = operadores.filter((item) => item.status === "ativo").length;
  const comContrato = operadores.filter((item) => item.contrato_operador_url).length;

  const fields: EntityField[] = [
    {
      name: "fornecedor_id",
      label: "Fornecedor",
      type: "select",
      options: fornecedores.map((item) => ({ label: item.nome, value: item.id })),
    },
    { name: "descricao_tratamento", label: "Descrição do tratamento", type: "textarea", required: true },
    { name: "dados_tratados", label: "Dados tratados", type: "textarea" },
    { name: "contrato_operador_url", label: "Contrato/DPA", type: "url" },
    { name: "status", label: "Status", defaultValue: "ativo" },
  ];

  return (
    <>
      <PageHeader
        title="Fornecedores operadores"
        description="Fornecedores que tratam dados pessoais, descrição do tratamento, dados tratados e contrato de operador."
        actions={<EntityFormDialog title="Novo operador" fields={fields} action={createLgpdFornecedorOperador} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Operadores" value={operadores.length} icon={ServerCog} tone="info" />
        <StatCard title="Ativos" value={ativos} icon={ShieldCheck} tone="success" />
        <StatCard title="Com contrato/DPA" value={comContrato} icon={FileCheck2} tone="warning" />
      </div>
      <DataTable
        data={operadores as unknown as Record<string, unknown>[]}
        columns={[
          { key: "fornecedor_nome", label: "Fornecedor" },
          { key: "descricao_tratamento", label: "Tratamento" },
          { key: "dados_tratados", label: "Dados tratados" },
          { key: "contrato_operador_url", label: "Contrato" },
          { key: "status", label: "Status", format: "status" },
        ]}
        deleteAction={deleteLgpdFornecedorOperador}
      />
    </>
  );
}
