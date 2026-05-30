import { listScopedRecords, getScopedRecord } from "@/lib/data";

export const getFornecedores = () => listScopedRecords("fornecedores", { orderBy: "nome", ascending: true });
export const getFornecedor = (id: string) => getScopedRecord("fornecedores", id);
