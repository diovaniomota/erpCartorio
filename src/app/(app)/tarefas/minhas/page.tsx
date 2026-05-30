import { DataTable } from "@/components/shared/data-table";
import { ModuleTabs } from "@/components/shared/module-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { getSessionContext } from "@/lib/auth";
import { getTasks } from "@/modules/tarefas/queries";
import { AlarmClock, ClipboardList, UserRound, UsersRound } from "lucide-react";
import { isBefore, parseISO } from "date-fns";

export default async function MinhasTarefasPage() {
  const [context, tasks] = await Promise.all([getSessionContext(), getTasks()]);
  const minhasTasks = tasks.filter((task) => task.responsavel_id === context.profile.id);
  return (
    <>
      <PageHeader title="Minhas tarefas" description="Tarefas atribuídas ao usuário atual." />
      <ModuleTabs
        tabs={[
          { label: "Kanban", href: "/tarefas/kanban", count: tasks.length, icon: ClipboardList },
          { label: "Minhas", href: "/tarefas/minhas", active: true, count: minhasTasks.length, icon: UserRound },
          { label: "Equipe", href: "/tarefas/equipe", count: tasks.length, icon: UsersRound },
          { label: "Atrasadas", href: "/tarefas/atrasadas", count: tasks.filter((task) => task.data_prazo && isBefore(parseISO(task.data_prazo), new Date()) && task.status !== "concluída").length, icon: AlarmClock },
        ]}
      />
      <DataTable data={minhasTasks as unknown as Record<string, unknown>[]} columns={[
        { key: "titulo", label: "Tarefa", hrefBase: "/tarefas" },
        { key: "categoria", label: "Categoria" },
        { key: "prioridade", label: "Prioridade", format: "priority" },
        { key: "data_prazo", label: "Prazo", format: "date" },
        { key: "status", label: "Status", format: "status" },
      ]} />
    </>
  );
}
