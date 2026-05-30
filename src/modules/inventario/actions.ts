"use server";

import { createScopedRecord, softDeleteScopedRecord } from "@/lib/server-actions";
import {
  inventarioItemSchema,
  inventarioManutencaoSchema,
  inventarioMovimentacaoSchema,
} from "@/modules/inventario/schemas";

export async function createInventarioItem(input: unknown) {
  return createScopedRecord(input, {
    table: "inventario_itens",
    schema: inventarioItemSchema,
    permission: "gerenciar_inventario",
    modulo: "inventario",
    path: "/inventario",
  });
}

export async function deleteInventarioItem(id: string) {
  return softDeleteScopedRecord(id, {
    table: "inventario_itens",
    permission: "gerenciar_inventario",
    modulo: "inventario",
    path: "/inventario",
  });
}

export async function createInventarioMovimentacao(input: unknown) {
  return createScopedRecord(input, {
    table: "inventario_movimentacoes",
    schema: inventarioMovimentacaoSchema,
    permission: "gerenciar_inventario",
    modulo: "inventario",
    path: "/inventario",
  });
}

export async function deleteInventarioMovimentacao(id: string) {
  return softDeleteScopedRecord(id, {
    table: "inventario_movimentacoes",
    permission: "gerenciar_inventario",
    modulo: "inventario",
    path: "/inventario",
  });
}

export async function createInventarioManutencao(input: unknown) {
  return createScopedRecord(input, {
    table: "inventario_manutencoes",
    schema: inventarioManutencaoSchema,
    permission: "gerenciar_inventario",
    modulo: "inventario",
    path: "/inventario/manutencoes",
  });
}

export async function deleteInventarioManutencao(id: string) {
  return softDeleteScopedRecord(id, {
    table: "inventario_manutencoes",
    permission: "gerenciar_inventario",
    modulo: "inventario",
    path: "/inventario/manutencoes",
  });
}
