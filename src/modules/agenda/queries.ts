import { listScopedRecords, getScopedRecord } from "@/lib/data";
import { DEFAULT_AGENDA_TIPOS, normalizeAgendaTipos } from "@/modules/agenda/constants";

export const getAgendaEventos = () => listScopedRecords("agenda_eventos", { orderBy: "data_inicio", ascending: true });
export const getAgendaEvento = (id: string) => getScopedRecord("agenda_eventos", id);

export async function getAgendaTipos() {
  const configuracoes = await listScopedRecords("configuracoes", { orderBy: "chave", ascending: true });
  const config = configuracoes.find((item) => item.chave === "agenda_tipos");
  const tipos = normalizeAgendaTipos(config?.valor);

  return tipos.length ? tipos : DEFAULT_AGENDA_TIPOS;
}
