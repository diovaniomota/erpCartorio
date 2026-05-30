import { listScopedRecords, getScopedRecord } from "@/lib/data";

export const getAgendaEventos = () => listScopedRecords("agenda_eventos", { orderBy: "data_inicio", ascending: true });
export const getAgendaEvento = (id: string) => getScopedRecord("agenda_eventos", id);
