import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAgendaEvento } from "@/modules/agenda/queries";
import { formatDate } from "@/lib/utils";

export default async function AgendaEventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getAgendaEvento(id);
  if (!event) notFound();

  return (
    <>
      <PageHeader title={event.titulo} description="Detalhes do evento administrativo." />
      <Card>
        <CardHeader>
          <CardTitle>Evento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Tipo" value={event.tipo} />
          <Info label="Início" value={formatDate(event.data_inicio)} />
          <Info label="Fim" value={formatDate(event.data_fim)} />
          <div>
            <p className="text-sm text-muted-foreground">Prioridade</p>
            <PriorityBadge priority={event.prioridade} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={event.status} />
          </div>
          <Info label="Local" value={event.local} />
          <Info label="Descrição" value={event.descricao} />
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
