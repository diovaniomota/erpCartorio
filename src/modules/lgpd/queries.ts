import { listScopedRecords } from "@/lib/data";

async function profilesMap() {
  const profiles = await listScopedRecords("profiles", { orderBy: "nome", ascending: true });
  return new Map(profiles.map((item) => [item.id, item.nome]));
}

export async function getLgpdInventarioDados() {
  const [rows, nomes] = await Promise.all([
    listScopedRecords("lgpd_inventario_dados", { orderBy: "processo", ascending: true }),
    profilesMap(),
  ]);
  return rows.map((item) => ({ ...item, responsavel_nome: item.responsavel_nome ?? nomes.get(item.responsavel_id ?? "") ?? null }));
}

export async function getLgpdSolicitacoes() {
  const [rows, nomes] = await Promise.all([
    listScopedRecords("lgpd_solicitacoes", { orderBy: "prazo_resposta", ascending: true }),
    profilesMap(),
  ]);
  return rows.map((item) => ({ ...item, responsavel_nome: item.responsavel_nome ?? nomes.get(item.responsavel_id ?? "") ?? null }));
}

export async function getLgpdIncidentes() {
  const [rows, nomes] = await Promise.all([
    listScopedRecords("lgpd_incidentes", { orderBy: "data_incidente", ascending: false }),
    profilesMap(),
  ]);
  return rows.map((item) => ({ ...item, responsavel_nome: nomes.get(item.responsavel_id ?? "") ?? null }));
}

export const getLgpdPoliticas = () => listScopedRecords("lgpd_politicas", { orderBy: "validade_em", ascending: true });

export async function getLgpdTreinamentos() {
  const [rows, nomes] = await Promise.all([
    listScopedRecords("lgpd_treinamentos", { orderBy: "data_treinamento", ascending: false }),
    profilesMap(),
  ]);
  return rows.map((item) => ({ ...item, responsavel_nome: item.responsavel_nome ?? nomes.get(item.responsavel_id ?? "") ?? null }));
}

export async function getLgpdFornecedoresOperadores() {
  const [rows, fornecedores] = await Promise.all([
    listScopedRecords("lgpd_fornecedores_operadores", { orderBy: "created_at", ascending: false }),
    listScopedRecords("fornecedores", { orderBy: "nome", ascending: true }),
  ]);
  const fornecedorPorId = new Map(fornecedores.map((item) => [item.id, item.nome]));
  return rows.map((item) => ({
    ...item,
    fornecedor_nome: item.fornecedor_nome ?? fornecedorPorId.get(item.fornecedor_id ?? "") ?? null,
  }));
}
