import { DataTable } from "@/components/shared/data-table";
import { ModuleTabs } from "@/components/shared/module-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { getTasks } from "@/modules/tarefas/queries";
import { AlarmClock, ClipboardList, UserRound, UsersRound } from "lucide-react";
import { isBefore, parseISO } from "date-fns";

export default async function TarefasEquipePage() {
  const tasks = await getTasks();

  return (
    <>
      <PageHeader title="Tarefas da equipe" description="Visão operacional dos responsáveis, prazos e prioridades." />
      <ModuleTabs
        tabs={[
          { label: "Kanban", href: "/tarefas/kanban", count: tasks.length, icon: ClipboardList },
          { label: "Minhas", href: "/tarefas/minhas", count: tasks.length, icon: UserRound },
          { label: "Equipe", href: "/tarefas/equipe", active: true, count: tasks.length, icon: UsersRound },
          { label: "Atrasadas", href: "/tarefas/atrasadas", count: tasks.filter((task) => task.data_prazo && isBefore(parseISO(task.data_prazo), new Date()) && task.status !== "concluída").length, icon: AlarmClock },
        ]}
      />
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
