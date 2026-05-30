import { CalendarCheck2, Plane, TimerReset } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createFerias, deleteFerias } from "@/modules/rh/actions";
import { getFerias, getFuncionarios } from "@/modules/rh/queries";

export default async function FeriasPage() {
  const [ferias, funcionarios] = await Promise.all([getFerias(), getFuncionarios()]);
  const emAndamento = ferias.filter((item) => item.status === "em andamento").length;
  const aprovadas = ferias.filter((item) => item.status === "aprovada").length;
  const pendentes = ferias.filter((item) => item.status === "pendente").length;

  const fields: EntityField[] = [
    {
      name: "funcionario_id",
      label: "Funcionário",
      type: "select",
      required: true,
      options: funcionarios.map((item) => ({ label: item.nome, value: item.id })),
    },
    { name: "periodo_aquisitivo_inicio", label: "Período aquisitivo início", type: "date", required: true },
    { name: "periodo_aquisitivo_fim", label: "Período aquisitivo fim", type: "date", required: true },
    { name: "data_inicio", label: "Início das férias", type: "date", required: true },
    { name: "data_fim", label: "Fim das férias", type: "date", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "pendente",
      options: ["pendente", "aprovada", "reprovada", "em andamento", "concluída", "cancelada"].map((value) => ({
        label: value,
        value,
      })),
    },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Férias"
        description="Controle de período aquisitivo, solicitações, aprovação, calendário e histórico administrativo."
        actions={<EntityFormDialog title="Nova solicitação de férias" fields={fields} action={createFerias} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Em andamento" value={emAndamento} icon={Plane} tone="info" />
        <StatCard title="Aprovadas" value={aprovadas} icon={CalendarCheck2} tone="success" />
        <StatCard title="Pendentes" value={pendentes} icon={TimerReset} tone="warning" />
      </div>
      <DataTable
        data={ferias as unknown as Record<string, unknown>[]}
        columns={[
          { key: "funcionario_nome", label: "Funcionário" },
          { key: "periodo_aquisitivo_inicio", label: "Aquisitivo início", format: "date" },
          { key: "periodo_aquisitivo_fim", label: "Aquisitivo fim", format: "date" },
          { key: "data_inicio", label: "Início", format: "date" },
          { key: "data_fim", label: "Fim", format: "date" },
          { key: "status", label: "Status", format: "status" },
        ]}
        deleteAction={deleteFerias}
      />
    </>
  );
}
