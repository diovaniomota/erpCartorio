"use server";

import { createScopedRecord, restoreScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { documentoInternoSchema } from "@/modules/documentos/schemas";

export async function createDocumentoInterno(input: unknown) {
  return createScopedRecord(input, {
    table: "documentos_internos",
    schema: documentoInternoSchema,
    permission: "enviar_documentos",
    modulo: "documentos",
    path: "/documentos",
  });
}

export async function updateDocumentoInterno(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "documentos_internos",
    schema: documentoInternoSchema,
    permission: "enviar_documentos",
    modulo: "documentos",
    path: "/documentos",
  });
}

export async function deleteDocumentoInterno(id: string) {
  return softDeleteScopedRecord(id, {
    table: "documentos_internos",
    permission: "enviar_documentos",
    modulo: "documentos",
    path: "/documentos",
  });
}

export async function restoreDocumentoInterno(id: string) {
  return restoreScopedRecord(id, {
    table: "documentos_internos",
    permission: "enviar_documentos",
    modulo: "documentos",
    path: "/documentos",
  });
}
