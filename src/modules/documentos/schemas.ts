import { z } from "zod";
import { optionalText, requiredText, uuidField } from "@/lib/validation";

export const documentoInternoSchema = z.object({
  titulo: requiredText("Informe o título"),
  categoria: z.enum([
    "contratos",
    "políticas internas",
    "manuais",
    "comprovantes",
    "documentos de funcionários",
    "documentos de fornecedores",
    "documentos LGPD",
    "documentos financeiros",
    "atas de reunião",
    "treinamentos",
    "outros",
  ]).default("outros"),
  pasta: optionalText,
  arquivo_url: optionalText,
  validade_em: optionalText,
  status: z.enum(["ativo", "vencido", "arquivado"]).default("ativo"),
  acesso: z.enum(["todos", "restrito", "gestores"]).default("restrito"),
  vinculo_tipo: optionalText,
  vinculo_id: uuidField,
});
