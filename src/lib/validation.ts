import { z } from "zod";
import { isValidCPF, isValidCpfCnpj } from "@/lib/cpf-cnpj";

export const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

export const requiredText = (message = "Campo obrigatório") =>
  z.string().trim().min(1, message);

export const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

export const money = z.coerce.number().min(0, "Informe um valor válido");

export const uuidField = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : null))
  .nullable()
  .optional();

// CPF/CNPJ — same pattern as email: valid value OR empty string (→ null), both optional
export const optionalCpf = z
  .string()
  .refine((v) => isValidCPF(v), "CPF inválido")
  .or(z.literal(""))
  .transform((v) => (v === "" ? null : v))
  .optional();

export const optionalCpfCnpj = z
  .string()
  .refine((v) => isValidCpfCnpj(v), "Informe um CPF ou CNPJ válido")
  .or(z.literal(""))
  .transform((v) => (v === "" ? null : v))
  .optional();
