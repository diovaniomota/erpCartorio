import { getScopedRecord, listScopedRecords } from "@/lib/data";

export const getInventarioItens = () => listScopedRecords("inventario_itens", { orderBy: "nome", ascending: true });
export const getInventarioItem = (id: string) => getScopedRecord("inventario_itens", id);

export async function getInventarioMovimentacoes() {
  const [movimentacoes, itens] = await Promise.all([
    listScopedRecords("inventario_movimentacoes", { orderBy: "created_at", ascending: false }),
    getInventarioItens(),
  ]);
  const itemPorId = new Map(itens.map((item) => [item.id, item.nome]));
  return movimentacoes.map((movimentacao) => ({
    ...movimentacao,
    item_nome: movimentacao.item_nome ?? itemPorId.get(movimentacao.item_id) ?? null,
  }));
}

export async function getInventarioManutencoes() {
  const [manutencoes, itens, fornecedores] = await Promise.all([
    listScopedRecords("inventario_manutencoes", { orderBy: "data_inicio", ascending: false }),
    getInventarioItens(),
    listScopedRecords("fornecedores", { orderBy: "nome", ascending: true }),
  ]);
  const itemPorId = new Map(itens.map((item) => [item.id, item.nome]));
  const fornecedorPorId = new Map(fornecedores.map((item) => [item.id, item.nome]));
  return manutencoes.map((manutencao) => ({
    ...manutencao,
    item_nome: manutencao.item_nome ?? itemPorId.get(manutencao.item_id) ?? null,
    fornecedor_nome: manutencao.fornecedor_nome ?? fornecedorPorId.get(manutencao.fornecedor_id ?? "") ?? null,
  }));
}
