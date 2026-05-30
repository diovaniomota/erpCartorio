"use server";

import { createScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { agendaEventoSchema } from "@/modules/agenda/schemas";

export async function createAgendaEvento(input: unknown) {
  return createScopedRecord(input, {
    table: "agenda_eventos",
    schema: agendaEventoSchema,
    permission: "ver_dashboard",
    modulo: "agenda",
    path: "/agenda",
  });
}

export async function updateAgendaEvento(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "agenda_eventos",
    schema: agendaEventoSchema,
    permission: "ver_dashboard",
    modulo: "agenda",
    path: "/agenda",
  });
}

export async function deleteAgendaEvento(id: string) {
  return softDeleteScopedRecord(id, {
    table: "agenda_eventos",
    permission: "ver_dashboard",
    modulo: "agenda",
    path: "/agenda",
  });
}
