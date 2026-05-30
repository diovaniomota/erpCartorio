import { z } from "zod";
import { money, optionalDate, optionalText, requiredText, uuidField } from "@/lib/validation";

export const contaFinanceiraSchema = z.object({
  descricao: requiredText("Informe a descrição"),
  tipo: z.enum(["pagar", "receber"]).default("pagar"),
  valor: money,
  data_vencimento: requiredText("Informe o vencimento"),
  data_pagamento: optionalDate,
  status: z.enum(["aberta", "agendada", "paga", "vencida", "cancelada", "estornada"]).default("aberta"),
  fornecedor_id: uuidField,
  contrato_id: uuidField,
  categoria_id: uuidField,
  centro_custo: optionalText,
  codigo_barras: optionalText,
  recorrente: z.coerce.boolean().default(false),
  observacoes: optionalText,
});

export const boletoSchema = contaFinanceiraSchema.extend({
  codigo_barras: requiredText("Informe o código de barras"),
});

export const livroCaixaSchema = z.object({
  descricao: requiredText("Informe a descrição"),
  tipo: z.enum(["entrada", "saída", "transferência", "ajuste", "estorno"]).default("entrada"),
  valor: money,
  data_movimento: requiredText("Informe a data"),
  forma_pagamento: z.enum(["dinheiro", "pix", "transferência", "cartão", "boleto", "cheque"]).default("pix"),
  conta_id: uuidField,
  pagamento_id: uuidField,
  observacoes: optionalText,
});

export const pagamentoSchema = z.object({
  conta_id: requiredText("Informe a conta"),
  valor_pago: money,
  data_pagamento: requiredText("Informe a data do pagamento"),
  forma_pagamento: z.enum(["dinheiro", "pix", "transferência", "cartão", "boleto", "cheque"]).default("pix"),
  comprovante_url: optionalText,
});

export type ContaFinanceiraInput = z.infer<typeof contaFinanceiraSchema>;
