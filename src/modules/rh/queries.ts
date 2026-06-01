import { listScopedRecords, getScopedRecord } from "@/lib/data";

export const getFuncionarios = (opts?: { includeDeleted?: boolean }) =>
  listScopedRecords("funcionarios", { orderBy: "nome", ascending: true, ...opts });
export const getFuncionario = (id: string) => getScopedRecord("funcionarios", id);

async function funcionariosMap() {
  const funcionarios = await getFuncionarios();
  return new Map(funcionarios.map((item) => [item.id, item.nome]));
}

export async function getAtestados() {
  const [atestados, nomes] = await Promise.all([
    listScopedRecords("funcionario_atestados", { orderBy: "data_inicio", ascending: false }),
    funcionariosMap(),
  ]);
  return atestados.map((item) => ({ ...item, funcionario_nome: item.funcionario_nome ?? nomes.get(item.funcionario_id) ?? null }));
}

export async function getPonto() {
  const [ponto, nomes] = await Promise.all([
    listScopedRecords("funcionario_ponto", { orderBy: "registrado_em", ascending: false }),
    funcionariosMap(),
  ]);
  return ponto.map((item) => ({ ...item, funcionario_nome: item.funcionario_nome ?? nomes.get(item.funcionario_id) ?? null }));
}

export async function getFerias() {
  const [ferias, nomes] = await Promise.all([
    listScopedRecords("funcionario_ferias", { orderBy: "data_inicio", ascending: true }),
    funcionariosMap(),
  ]);
  return ferias.map((item) => ({ ...item, funcionario_nome: item.funcionario_nome ?? nomes.get(item.funcionario_id) ?? null }));
}

export async function getBeneficios() {
  const [beneficios, nomes] = await Promise.all([
    listScopedRecords("funcionario_beneficios", { orderBy: "nome", ascending: true }),
    funcionariosMap(),
  ]);
  return beneficios.map((item) => ({ ...item, funcionario_nome: item.funcionario_nome ?? nomes.get(item.funcionario_id) ?? null }));
}
