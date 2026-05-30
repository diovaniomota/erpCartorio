"use server";

import { createScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { officialSourceSchema, officialUpdateSchema } from "@/modules/central-oficial/schemas";

export async function createOfficialSource(input: unknown) {
  return createScopedRecord(input, {
    table: "official_sources",
    schema: officialSourceSchema,
    permission: "gerenciar_central_oficial",
    modulo: "central-oficial",
    path: "/central-oficial/fontes",
  });
}

export async function createOfficialUpdate(input: unknown) {
  return createScopedRecord(input, {
    table: "official_updates",
    schema: officialUpdateSchema,
    permission: "gerenciar_central_oficial",
    modulo: "central-oficial",
    path: "/central-oficial",
  });
}

export async function updateOfficialUpdate(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "official_updates",
    schema: officialUpdateSchema,
    permission: "gerenciar_central_oficial",
    modulo: "central-oficial",
    path: "/central-oficial",
  });
}

export async function deleteOfficialUpdate(id: string) {
  return softDeleteScopedRecord(id, {
    table: "official_updates",
    permission: "gerenciar_central_oficial",
    modulo: "central-oficial",
    path: "/central-oficial",
  });
}
