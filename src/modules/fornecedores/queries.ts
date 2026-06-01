import { listScopedRecords, getScopedRecord } from "@/lib/data";

export const getFornecedores = (opts?: { includeDeleted?: boolean }) =>
  listScopedRecords("fornecedores", { orderBy: "nome", ascending: true, ...opts });
export const getFornecedor = (id: string) => getScopedRecord("fornecedores", id);
