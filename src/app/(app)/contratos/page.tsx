import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ContractPipeline } from "@/components/shared/record-views";
import { createContrato, deleteContrato, restoreContrato } from "@/modules/contratos/actions";
import { getContratos } from "@/modules/contratos/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";

export default async function ContratosPage() {
  const [contratos, fornecedores] = await Promise.all([getContratos({ includeDeleted: true }), getFornecedores()]);
  const fields: EntityField[] = [
    { name: "nome", label: "Nome", required: true },
    { name: "numero", label: "Número" },
    { name: "fornecedor_id", label: "Fornecedor", type: "select", options: fornecedores.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "valor", label: "Valor", type: "money", required: true },
    { name: "data_inicio", label: "Início", type: "date", required: true },
    { name: "data_vencimento", label: "Vencimento", type: "date", required: true },
    { name: "data_reajuste", label: "Reajuste", type: "date" },
    { name: "indice_reajuste", label: "Índice" },
    { name: "status", label: "Status", type: "select", defaultValue: "vigente", options: ["vigente", "a vencer", "vencido", "cancelado", "renovado", "suspenso"].map((value) => ({ label: value, value })) },
    { name: "arquivo_url", label: "URL do contrato" },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Contratos"
        description="Gestão de contratos administrativos, vencimentos, reajustes e arquivos vinculados."
        actions={<EntityFormDialog title="Novo contrato" fields={fields} action={createContrato} />}
      />
      <ContractPipeline contratos={contratos} deleteAction={deleteContrato} restoreAction={restoreContrato} />
    </>
  );
}
