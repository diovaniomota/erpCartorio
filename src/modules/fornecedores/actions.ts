"use server";

import { createScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { fornecedorSchema } from "@/modules/fornecedores/schemas";

export async function createFornecedor(input: unknown) {
  return createScopedRecord(input, {
    table: "fornecedores",
    schema: fornecedorSchema,
    permission: "gerenciar_fornecedores",
    modulo: "fornecedores",
    path: "/fornecedores",
  });
}

export async function updateFornecedor(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "fornecedores",
    schema: fornecedorSchema,
    permission: "gerenciar_fornecedores",
    modulo: "fornecedores",
    path: "/fornecedores",
  });
}

export async function deleteFornecedor(id: string) {
  return softDeleteScopedRecord(id, {
    table: "fornecedores",
    permission: "gerenciar_fornecedores",
    modulo: "fornecedores",
    path: "/fornecedores",
  });
}
