"use server";

import { createScopedRecord, softDeleteScopedRecord } from "@/lib/server-actions";
import {
  lgpdFornecedorOperadorSchema,
  lgpdIncidenteSchema,
  lgpdInventarioDadoSchema,
  lgpdPoliticaSchema,
  lgpdSolicitacaoSchema,
  lgpdTreinamentoSchema,
} from "@/modules/lgpd/schemas";

export async function createLgpdInventarioDado(input: unknown) {
  return createScopedRecord(input, {
    table: "lgpd_inventario_dados",
    schema: lgpdInventarioDadoSchema,
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/inventario-dados",
  });
}

export async function deleteLgpdInventarioDado(id: string) {
  return softDeleteScopedRecord(id, {
    table: "lgpd_inventario_dados",
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/inventario-dados",
  });
}

export async function createLgpdSolicitacao(input: unknown) {
  return createScopedRecord(input, {
    table: "lgpd_solicitacoes",
    schema: lgpdSolicitacaoSchema,
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/solicitacoes",
  });
}

export async function deleteLgpdSolicitacao(id: string) {
  return softDeleteScopedRecord(id, {
    table: "lgpd_solicitacoes",
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/solicitacoes",
  });
}

export async function createLgpdIncidente(input: unknown) {
  return createScopedRecord(input, {
    table: "lgpd_incidentes",
    schema: lgpdIncidenteSchema,
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/incidentes",
  });
}

export async function deleteLgpdIncidente(id: string) {
  return softDeleteScopedRecord(id, {
    table: "lgpd_incidentes",
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/incidentes",
  });
}

export async function createLgpdPolitica(input: unknown) {
  return createScopedRecord(input, {
    table: "lgpd_politicas",
    schema: lgpdPoliticaSchema,
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/politicas",
  });
}

export async function deleteLgpdPolitica(id: string) {
  return softDeleteScopedRecord(id, {
    table: "lgpd_politicas",
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/politicas",
  });
}

export async function createLgpdTreinamento(input: unknown) {
  return createScopedRecord(input, {
    table: "lgpd_treinamentos",
    schema: lgpdTreinamentoSchema,
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/treinamentos",
  });
}

export async function deleteLgpdTreinamento(id: string) {
  return softDeleteScopedRecord(id, {
    table: "lgpd_treinamentos",
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/treinamentos",
  });
}

export async function createLgpdFornecedorOperador(input: unknown) {
  return createScopedRecord(input, {
    table: "lgpd_fornecedores_operadores",
    schema: lgpdFornecedorOperadorSchema,
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/fornecedores-operadores",
  });
}

export async function deleteLgpdFornecedorOperador(id: string) {
  return softDeleteScopedRecord(id, {
    table: "lgpd_fornecedores_operadores",
    permission: "gerenciar_lgpd",
    modulo: "lgpd",
    path: "/lgpd/fornecedores-operadores",
  });
}
