import { z } from "zod";
import { optionalCpfCnpj, optionalText, requiredText } from "@/lib/validation";

export const fornecedorSchema = z.object({
  nome: requiredText("Informe o nome do fornecedor"),
  categoria: requiredText("Informe a categoria"),
  documento: optionalCpfCnpj,
  telefone: optionalText,
  email: z.string().email("E-mail inválido").or(z.literal("")).transform((value) => value || null).optional(),
  endereco: optionalText,
  contato_responsavel: optionalText,
  dados_bancarios: optionalText,
  observacoes: optionalText,
  status: z.enum(["ativo", "inativo"]).default("ativo"),
});

export type FornecedorInput = z.infer<typeof fornecedorSchema>;
