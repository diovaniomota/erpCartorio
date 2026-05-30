"use server";

import { createScopedRecord, softDeleteScopedRecord } from "@/lib/server-actions";
import { configuracaoSchema } from "@/modules/configuracoes/schemas";

export async function createConfiguracao(input: unknown) {
  return createScopedRecord(input, {
    table: "configuracoes",
    schema: configuracaoSchema,
    permission: "gerenciar_configuracoes",
    modulo: "configuracoes",
    path: "/configuracoes",
  });
}

export async function deleteConfiguracao(id: string) {
  return softDeleteScopedRecord(id, {
    table: "configuracoes",
    permission: "gerenciar_configuracoes",
    modulo: "configuracoes",
    path: "/configuracoes",
  });
}
