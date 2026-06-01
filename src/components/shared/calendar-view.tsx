"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type { AgendaEvento } from "@/lib/types";

const eventColors: Record<string, string> = {
  reunião: "#2563eb",
  boleto: "#d97706",
  contrato: "#7c3aed",
  férias: "#059669",
  atestado: "#dc2626",
  LGPD: "#0f766e",
  tarefa: "#475569",
  tribunal: "#9333ea",
  manutenção: "#ea580c",
  treinamento: "#0891b2",
  manual: "#64748b",
};

export function CalendarView({ events }: { events: AgendaEvento[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={ptBrLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Hoje",
          month: "Mês",
          week: "Semana",
          day: "Dia",
        }}
        allDayText="Dia todo"
        height="auto"
        events={events.map((event) => ({
          id: event.id,
          title: event.titulo,
          start: event.data_inicio,
          end: event.data_fim,
          allDay: event.dia_todo,
          backgroundColor: eventColors[event.tipo] ?? "#64748b",
          borderColor: eventColors[event.tipo] ?? "#64748b",
          extendedProps: event,
        }))}
      />
    </div>
  );
}
