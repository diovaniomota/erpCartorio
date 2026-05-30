import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createLgpdIncidente, deleteLgpdIncidente } from "@/modules/lgpd/actions";
import { getLgpdIncidentes } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";

export default async function LgpdIncidentesPage() {
  const [incidentes, funcionarios] = await Promise.all([getLgpdIncidentes(), getFuncionarios()]);
  const fields: EntityField[] = [
    { name: "data_incidente", label: "Data do incidente", type: "date", required: true },
    { name: "tipo_dado_afetado", label: "Tipo de dado afetado", required: true },
    { name: "pessoas_afetadas", label: "Pessoas afetadas", type: "number" },
    { name: "risco", label: "Risco", type: "select", defaultValue: "médio", options: ["baixo", "médio", "alto", "crítico"].map((value) => ({ label: value, value })) },
    { name: "responsavel_id", label: "Responsável", type: "select", options: funcionarios.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "status", label: "Status", defaultValue: "em análise" },
    { name: "descricao", label: "Descrição", type: "textarea", required: true },
    { name: "medidas_tomadas", label: "Medidas tomadas", type: "textarea" },
  ];
  return (
    <>
      <PageHeader
        title="Incidentes LGPD"
        description="Registro de incidentes de segurança com risco, medidas tomadas e responsável."
        actions={<EntityFormDialog title="Novo incidente" fields={fields} action={createLgpdIncidente} />}
      />
      <DataTable data={incidentes as unknown as Record<string, unknown>[]} columns={[
        { key: "data_incidente", label: "Data", format: "date" },
        { key: "descricao", label: "Descrição" },
        { key: "risco", label: "Risco", format: "priority" },
        { key: "status", label: "Status", format: "status" },
      ]} deleteAction={deleteLgpdIncidente} />
    </>
  );
}
