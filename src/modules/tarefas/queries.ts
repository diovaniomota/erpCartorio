import { listScopedRecords, getScopedRecord } from "@/lib/data";

export const getTaskBoards = () => listScopedRecords("task_boards", { orderBy: "created_at", ascending: true });
export const getTaskColumns = () => listScopedRecords("task_columns", { orderBy: "ordem", ascending: true });
export async function getTasks() {
  const [tasks, profiles] = await Promise.all([
    listScopedRecords("tasks", { orderBy: "ordem", ascending: true }),
    listScopedRecords("profiles", { orderBy: "nome", ascending: true }),
  ]);
  const profilePorId = new Map(profiles.map((item) => [item.id, item.nome]));
  return tasks.map((task) => ({
    ...task,
    responsavel_nome: task.responsavel_nome ?? profilePorId.get(task.responsavel_id ?? "") ?? null,
  }));
}

export const getTaskLabels = () => listScopedRecords("task_labels", { orderBy: "nome", ascending: true });
export async function getTask(id: string) {
  const task = await getScopedRecord("tasks", id);
  if (!task) return null;
  const profiles = await listScopedRecords("profiles", { orderBy: "nome", ascending: true });
  const profile = profiles.find((item) => item.id === task.responsavel_id);
  return { ...task, responsavel_nome: task.responsavel_nome ?? profile?.nome ?? null };
}
