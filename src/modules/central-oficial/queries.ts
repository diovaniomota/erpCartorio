import { listScopedRecords } from "@/lib/data";

export const getOfficialSources = () => listScopedRecords("official_sources", { orderBy: "nome", ascending: true });
export async function getOfficialUpdates() {
  const [updates, sources] = await Promise.all([
    listScopedRecords("official_updates", { orderBy: "publicado_em", ascending: false }),
    getOfficialSources(),
  ]);
  const fontePorId = new Map(sources.map((item) => [item.id, item.nome]));
  return updates.map((item) => ({ ...item, fonte_nome: item.fonte_nome ?? fontePorId.get(item.source_id ?? "") ?? null }));
}
