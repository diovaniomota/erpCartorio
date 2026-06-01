import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { getTasks } from "@/modules/tarefas/queries";

export default async function TarefasEquipePage() {
  const tasks = await getTasks();

  return (
    <>
      <PageHeader title="Tarefas da equipe" description="Visão operacional dos responsáveis, prazos e prioridades." />
      <DataTable
        data={tasks as unknown as Record<string, unknown>[]}
        columns={[
          { key: "titulo", label: "Tarefa", hrefBase: "/tarefas" },
          { key: "responsavel_nome", label: "Responsável" },
          { key: "categoria", label: "Categoria" },
          { key: "prioridade", label: "Prioridade", format: "priority" },
          { key: "data_prazo", label: "Prazo", format: "date" },
          { key: "status", label: "Status", format: "status" },
        ]}
      />
    </>
  );
}
