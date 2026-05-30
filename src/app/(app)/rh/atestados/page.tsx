import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createAtestado, deleteAtestado } from "@/modules/rh/actions";
import { getAtestados, getFuncionarios } from "@/modules/rh/queries";

export default async function AtestadosPage() {
  const [atestados, funcionarios] = await Promise.all([getAtestados(), getFuncionarios()]);
  const fields: EntityField[] = [
    { name: "funcionario_id", label: "Funcionário", type: "select", required: true, options: funcionarios.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "tipo", label: "Tipo", type: "select", defaultValue: "atestado médico", options: ["atestado médico", "licença", "falta justificada", "falta injustificada", "afastamento INSS", "licença maternidade", "licença paternidade"].map((value) => ({ label: value, value })) },
    { name: "data_inicio", label: "Início", type: "date", required: true },
    { name: "data_fim", label: "Fim", type: "date", required: true },
    { name: "quantidade_dias", label: "Dias", type: "number", required: true },
    { name: "cid", label: "CID opcional" },
    { name: "status", label: "Status", type: "select", defaultValue: "pendente", options: ["pendente", "aprovado", "reprovado"].map((value) => ({ label: value, value })) },
    { name: "documento_url", label: "URL do documento" },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Atestados e afastamentos"
        description="Registro, aprovação e reflexo administrativo de afastamentos."
        actions={<EntityFormDialog title="Novo atestado" fields={fields} action={createAtestado} />}
      />
      <DataTable
        data={atestados as unknown as Record<string, unknown>[]}
        columns={[
          { key: "funcionario_nome", label: "Funcionário" },
          { key: "tipo", label: "Tipo" },
          { key: "data_inicio", label: "Início", format: "date" },
          { key: "data_fim", label: "Fim", format: "date" },
          { key: "quantidade_dias", label: "Dias" },
          { key: "status", label: "Status", format: "status" },
        ]}
        deleteAction={deleteAtestado}
      />
    </>
  );
}
