import { z } from "zod";

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
