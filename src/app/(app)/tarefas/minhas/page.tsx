import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { getSessionContext } from "@/lib/auth";
import { getTasks } from "@/modules/tarefas/queries";

export default async function MinhasTarefasPage() {
  const [context, tasks] = await Promise.all([getSessionContext(), getTasks()]);
  const minhasTasks = tasks.filter((task) => task.responsavel_id === context.profile.id);

  return (
    <>
      <PageHeader title="Minhas tarefas" description="Tarefas atribuídas ao usuário atual." />
      <DataTable
        data={minhasTasks as unknown as Record<string, unknown>[]}
        columns={[
          { key: "titulo", label: "Tarefa", hrefBase: "/tarefas" },
          { key: "categoria", label: "Categoria" },
          { key: "prioridade", label: "Prioridade", format: "priority" },
          { key: "data_prazo", label: "Prazo", format: "date" },
          { key: "status", label: "Status", format: "status" },
        ]}
      />
    </>
  );
}
