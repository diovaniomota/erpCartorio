import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { KanbanBoard } from "@/components/shared/kanban-board";
import { PageHeader } from "@/components/shared/page-header";
import { createTask, moveTask } from "@/modules/tarefas/actions";
import { getTaskBoards, getTaskColumns, getTasks } from "@/modules/tarefas/queries";
import { getFuncionarios } from "@/modules/rh/queries";

export default async function KanbanPage() {
  const [boards, columns, tasks, funcionarios] = await Promise.all([
    getTaskBoards(),
    getTaskColumns(),
    getTasks(),
    getFuncionarios(),
  ]);
  const board = boards[0];
  const firstColumn = columns[0];
  const fields: EntityField[] = [
    { name: "board_id", label: "Quadro", type: "select", required: true, defaultValue: board?.id, options: boards.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "column_id", label: "Coluna", type: "select", required: true, defaultValue: firstColumn?.id, options: columns.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "titulo", label: "Título", required: true },
    { name: "categoria", label: "Categoria", required: true, defaultValue: "administrativo" },
    { name: "prioridade", label: "Prioridade", type: "select", defaultValue: "média", options: ["baixa", "média", "alta", "urgente"].map((value) => ({ label: value, value })) },
    { name: "status", label: "Status", type: "select", defaultValue: "aberta", options: ["aberta", "em andamento", "aguardando terceiro", "em revisão", "concluída", "cancelada", "atrasada"].map((value) => ({ label: value, value })) },
    { name: "responsavel_id", label: "Responsável", type: "select", options: funcionarios.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "data_inicio", label: "Início", type: "date" },
    { name: "data_prazo", label: "Prazo", type: "date" },
    { name: "vinculo_tipo", label: "Vínculo tipo" },
    { name: "vinculo_id", label: "Vínculo ID" },
    { name: "ordem", label: "Ordem", type: "number", defaultValue: 1 },
    { name: "descricao", label: "Descrição", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Tarefas · Quadro Kanban"
        description="Quadros, colunas e cartões administrativos com prioridade, responsável, prazo, vínculos, checklist, comentários e histórico."
        actions={<EntityFormDialog title="Nova tarefa" fields={fields} action={createTask} />}
      />
      <KanbanBoard columns={columns} tasks={tasks} moveAction={moveTask} />
    </>
  );
}
