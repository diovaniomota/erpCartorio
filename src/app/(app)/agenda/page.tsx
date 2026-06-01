import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { CalendarView } from "@/components/shared/calendar-view";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createAgendaEvento, deleteAgendaEvento, updateAgendaTipos } from "@/modules/agenda/actions";
import { getAgendaEventos, getAgendaTipos } from "@/modules/agenda/queries";

type AgendaPageProps = {
  searchParams?: Promise<{ tipo?: string }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const [events, agendaTipos] = await Promise.all([getAgendaEventos(), getAgendaTipos()]);
  const filtro = params?.tipo;
  const visibleEvents = filterEventsByTipo(events, filtro);
  const label = getFilterLabel(filtro);
  const fields = buildFields(agendaTipos);

  return (
    <>
      <PageHeader
        title={label ? `Agenda: ${label}` : "Agenda administrativa"}
        description={
          label
            ? `Visualização filtrada para ${label.toLowerCase()} administrativos.`
            : "Calendário mensal, semanal e diário para reuniões, vencimentos, férias, LGPD, tarefas e comunicados."
        }
        actions={<EntityFormDialog title="Novo evento" fields={fields} action={createAgendaEvento} />}
      />
      <CalendarView events={visibleEvents} />
      <DataTable
        data={visibleEvents as unknown as Record<string, unknown>[]}
        columns={[
          { key: "titulo", label: "Evento", hrefBase: "/agenda" },
          { key: "tipo", label: "Tipo", format: "status" },
          { key: "data_inicio", label: "Início", format: "date" },
          { key: "prioridade", label: "Prioridade", format: "priority" },
          { key: "status", label: "Status", format: "status" },
        ]}
        deleteAction={deleteAgendaEvento}
      />
    </>
  );
}

function buildFields(agendaTipos: string[]): EntityField[] {
  const tipoDefault = agendaTipos.includes("manual") ? "manual" : agendaTipos[0];

  return [
    { name: "titulo", label: "Título", required: true },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      defaultValue: tipoDefault,
      options: agendaTipos.map((value) => ({ label: value, value })),
      managedOptions: { action: updateAgendaTipos, minOptions: 1 },
    },
    { name: "data_inicio", label: "Início", type: "datetime-local", required: true },
    { name: "data_fim", label: "Fim", type: "datetime-local", required: true },
    { name: "dia_todo", label: "Dia todo", type: "checkbox" },
    { name: "prioridade", label: "Prioridade", type: "select", defaultValue: "média", options: ["baixa", "média", "alta", "urgente"].map((value) => ({ label: value, value })) },
    { name: "status", label: "Status", type: "select", defaultValue: "agendado", options: ["agendado", "concluído", "cancelado"].map((value) => ({ label: value, value })) },
    { name: "local", label: "Local" },
    { name: "link_reuniao", label: "Link da reunião" },
    { name: "lembrete_minutos", label: "Lembrete em minutos", type: "number" },
    { name: "descricao", label: "Descrição", type: "textarea" },
  ];
}

function filterEventsByTipo<T extends { tipo?: string | null }>(events: T[], filtro?: string) {
  if (!filtro) {
    return events;
  }

  if (filtro === "reuniao") {
    return events.filter((event) => event.tipo === "reunião");
  }

  if (filtro === "prazo") {
    return events.filter((event) => ["tarefa", "tribunal", "LGPD", "treinamento"].includes(String(event.tipo)));
  }

  if (filtro === "vencimento") {
    return events.filter((event) => ["boleto", "contrato"].includes(String(event.tipo)));
  }

  return events.filter((event) => event.tipo === filtro);
}

function getFilterLabel(filtro?: string) {
  if (filtro === "reuniao") {
    return "Reuniões";
  }
  if (filtro === "prazo") {
    return "Prazos";
  }
  if (filtro === "vencimento") {
    return "Vencimentos";
  }
  return filtro;
}
