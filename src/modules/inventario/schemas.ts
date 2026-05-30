import { z } from "zod";
import { money, optionalText, requiredText, uuidField } from "@/lib/validation";

export const inventarioItemSchema = z.object({
  codigo_patrimonio: requiredText("Informe o código"),
  nome: requiredText("Informe o nome"),
  categoria: requiredText("Informe a categoria"),
  descricao: optionalText,
  numero_serie: optionalText,
  fornecedor_id: uuidField,
  valor_compra: money.optional().nullable(),
  data_compra: optionalText,
  garantia_ate: optionalText,
  localizacao: requiredText("Informe a localização"),
  responsavel_id: uuidField,
  status: z.enum(["em uso", "em manutenção", "reservado", "baixado", "perdido", "danificado", "vendido"]).default("em uso"),
  foto_url: optionalText,
  nota_fiscal_url: optionalText,
});

export const inventarioMovimentacaoSchema = z.object({
  item_id: requiredText("Informe o patrimônio"),
  tipo: requiredText("Informe o tipo"),
  descricao: optionalText,
  localizacao_anterior: optionalText,
  localizacao_nova: optionalText,
  responsavel_anterior: uuidField,
  responsavel_novo: uuidField,
});

export const inventarioManutencaoSchema = z.object({
  item_id: requiredText("Informe o patrimônio"),
  fornecedor_id: uuidField,
  descricao: requiredText("Informe a descrição"),
  data_inicio: requiredText("Informe o início"),
  data_fim: optionalText,
  custo: money.optional().nullable(),
  status: z.enum(["aberta", "em andamento", "concluída", "cancelada"]).default("aberta"),
});
