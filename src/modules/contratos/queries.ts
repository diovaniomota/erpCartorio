import { listScopedRecords, getScopedRecord } from "@/lib/data";

export async function getContratos(opts?: { includeDeleted?: boolean }) {
  const [contratos, fornecedores] = await Promise.all([
    listScopedRecords("contratos", { orderBy: "data_vencimento", ascending: true, ...opts }),
    listScopedRecords("fornecedores", { orderBy: "nome", ascending: true }),
  ]);
  const fornecedorPorId = new Map(fornecedores.map((item) => [item.id, item.nome]));
  return contratos.map((contrato) => ({
    ...contrato,
    fornecedor_nome: contrato.fornecedor_nome ?? fornecedorPorId.get(contrato.fornecedor_id ?? "") ?? null,
  }));
}

export async function getContrato(id: string) {
  const contrato = await getScopedRecord("contratos", id);
  if (!contrato) return null;
  const fornecedores = await listScopedRecords("fornecedores", { orderBy: "nome", ascending: true });
  const fornecedor = fornecedores.find((item) => item.id === contrato.fornecedor_id);
  return { ...contrato, fornecedor_nome: contrato.fornecedor_nome ?? fornecedor?.nome ?? null };
}
