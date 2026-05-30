import { listScopedRecords } from "@/lib/data";

export async function getContasFinanceiras() {
  const [contas, fornecedores, categorias] = await Promise.all([
    listScopedRecords("financeiro_contas", { orderBy: "data_vencimento", ascending: true }),
    listScopedRecords("fornecedores", { orderBy: "nome", ascending: true }),
    listScopedRecords("financeiro_categorias", { orderBy: "nome", ascending: true }),
  ]);
  const fornecedorPorId = new Map(fornecedores.map((item) => [item.id, item.nome]));
  const categoriaPorId = new Map(categorias.map((item) => [item.id, item.nome]));

  return contas.map((conta) => ({
    ...conta,
    fornecedor_nome: conta.fornecedor_nome ?? fornecedorPorId.get(conta.fornecedor_id ?? "") ?? null,
    categoria_nome: conta.categoria_nome ?? categoriaPorId.get(conta.categoria_id ?? "") ?? null,
  }));
}

export const getLivroCaixa = () => listScopedRecords("livro_caixa", { orderBy: "data_movimento", ascending: false });
export const getFinanceiroCategorias = () => listScopedRecords("financeiro_categorias", { orderBy: "nome", ascending: true });
