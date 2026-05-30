import { isBefore, parseISO } from "date-fns";
import { DataTable } from "@/components/shared/data-table";
import { ModuleTabs } from "@/components/shared/module-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { getTasks } from "@/modules/tarefas/queries";
import { AlarmClock, ClipboardList, UserRound, UsersRound } from "lucide-react";

export default async function TarefasAtrasadasPage() {
  const allTasks = await getTasks();
  const tasks = allTasks.filter((task) => task.data_prazo && isBefore(parseISO(task.data_prazo), new Date()) && task.status !== "concluída");
  return (
    <>
      <PageHeader title="Tarefas atrasadas" description="Cartões com prazo vencido e ainda não concluídos." />
      <ModuleTabs
        tabs={[
          { label: "Kanban", href: "/tarefas/kanban", count: allTasks.length, icon: ClipboardList },
          { label: "Minhas", href: "/tarefas/minhas", count: allTasks.length, icon: UserRound },
          { label: "Equipe", href: "/tarefas/equipe", count: allTasks.length, icon: UsersRound },
          { label: "Atrasadas", href: "/tarefas/atrasadas", active: true, count: tasks.length, icon: AlarmClock },
        ]}
      />
      <DataTable data={tasks as unknown as Record<string, unknown>[]} columns={[
        { key: "titulo", label: "Tarefa", hrefBase: "/tarefas" },
        { key: "responsavel_nome", label: "Responsável" },
        { key: "prioridade", label: "Prioridade", format: "priority" },
        { key: "data_prazo", label: "Prazo", format: "date" },
        { key: "status", label: "Status", format: "status" },
      ]} />
    </>
  );
}
