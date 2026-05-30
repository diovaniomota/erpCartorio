"use server";

import { createScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { contratoSchema } from "@/modules/contratos/schemas";

export async function createContrato(input: unknown) {
  return createScopedRecord(input, {
    table: "contratos",
    schema: contratoSchema,
    permission: "gerenciar_contratos",
    modulo: "contratos",
    path: "/contratos",
  });
}

export async function updateContrato(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "contratos",
    schema: contratoSchema,
    permission: "gerenciar_contratos",
    modulo: "contratos",
    path: "/contratos",
  });
}

export async function deleteContrato(id: string) {
  return softDeleteScopedRecord(id, {
    table: "contratos",
    permission: "gerenciar_contratos",
    modulo: "contratos",
    path: "/contratos",
  });
}
