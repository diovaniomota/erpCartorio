"use server";

import { createScopedRecord, restoreScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { atestadoSchema, beneficioSchema, feriasSchema, funcionarioSchema, pontoSchema } from "@/modules/rh/schemas";

export async function createFuncionario(input: unknown) {
  return createScopedRecord(input, {
    table: "funcionarios",
    schema: funcionarioSchema,
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/funcionarios",
  });
}

export async function updateFuncionario(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "funcionarios",
    schema: funcionarioSchema,
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/funcionarios",
  });
}

export async function deleteFuncionario(id: string) {
  return softDeleteScopedRecord(id, {
    table: "funcionarios",
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/funcionarios",
  });
}

export async function createAtestado(input: unknown) {
  return createScopedRecord(input, {
    table: "funcionario_atestados",
    schema: atestadoSchema,
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/atestados",
  });
}

export async function deleteAtestado(id: string) {
  return softDeleteScopedRecord(id, {
    table: "funcionario_atestados",
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/atestados",
  });
}

export async function createPonto(input: unknown) {
  return createScopedRecord(input, {
    table: "funcionario_ponto",
    schema: pontoSchema,
    permission: "gerenciar_ponto",
    modulo: "rh",
    path: "/rh/ponto",
  });
}

export async function deletePonto(id: string) {
  return softDeleteScopedRecord(id, {
    table: "funcionario_ponto",
    permission: "gerenciar_ponto",
    modulo: "rh",
    path: "/rh/ponto",
  });
}

export async function createFerias(input: unknown) {
  return createScopedRecord(input, {
    table: "funcionario_ferias",
    schema: feriasSchema,
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/ferias",
  });
}

export async function deleteFerias(id: string) {
  return softDeleteScopedRecord(id, {
    table: "funcionario_ferias",
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/ferias",
  });
}

export async function createBeneficio(input: unknown) {
  return createScopedRecord(input, {
    table: "funcionario_beneficios",
    schema: beneficioSchema,
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/beneficios",
  });
}

export async function deleteBeneficio(id: string) {
  return softDeleteScopedRecord(id, {
    table: "funcionario_beneficios",
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/beneficios",
  });
}

export async function restoreFuncionario(id: string) {
  return restoreScopedRecord(id, {
    table: "funcionarios",
    permission: "gerenciar_funcionarios",
    modulo: "rh",
    path: "/rh/funcionarios",
  });
}
