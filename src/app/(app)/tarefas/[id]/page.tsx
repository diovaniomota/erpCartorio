import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { getTask } from "@/modules/tarefas/queries";
import { formatDate } from "@/lib/utils";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();

  return (
    <>
      <PageHeader title={task.titulo} description={task.descricao ?? "Detalhes da tarefa administrativa."} />
      <Card>
        <CardHeader>
          <CardTitle>Controle da tarefa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Categoria" value={task.categoria} />
          <Info label="Responsável" value={task.responsavel_nome} />
          <Info label="Prazo" value={formatDate(task.data_prazo)} />
          <Info label="Vínculo" value={task.vinculo_tipo} />
          <div>
            <p className="text-sm text-muted-foreground">Prioridade</p>
            <PriorityBadge priority={task.prioridade} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={task.status} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "-"}</p>
    </div>
  );
}
