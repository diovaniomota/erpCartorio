import { z } from "zod";
import { money, optionalDate, optionalText, requiredText, uuidField } from "@/lib/validation";

export const contratoSchema = z.object({
  fornecedor_id: uuidField,
  nome: requiredText("Informe o nome do contrato"),
  numero: optionalText,
  valor: money,
  data_inicio: requiredText("Informe a data inicial"),
  data_vencimento: requiredText("Informe a data de vencimento"),
  data_reajuste: optionalDate,
  indice_reajuste: optionalText,
  status: z.enum(["vigente", "a vencer", "vencido", "cancelado", "renovado", "suspenso"]).default("vigente"),
  arquivo_url: optionalText,
  observacoes: optionalText,
});

export type ContratoInput = z.infer<typeof contratoSchema>;
