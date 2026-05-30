import { z } from "zod";
import { optionalText, requiredText, uuidField } from "@/lib/validation";

export const lgpdInventarioDadoSchema = z.object({
  processo: requiredText("Informe o processo"),
  categoria_dado: requiredText("Informe a categoria de dado"),
  base_legal: requiredText("Informe a base legal"),
  finalidade: requiredText("Informe a finalidade"),
  retencao: optionalText,
  compartilhamento: optionalText,
  responsavel_id: uuidField,
});

export const lgpdSolicitacaoSchema = z.object({
  titular_nome: requiredText("Informe o titular"),
  titular_email: optionalText,
  tipo: z.enum([
    "acesso aos dados",
    "correção",
    "exclusão/bloqueio quando aplicável",
    "informação sobre compartilhamento",
    "revogação de consentimento quando aplicável",
  ]),
  prazo_resposta: requiredText("Informe o prazo"),
  status: z.string().default("aberta"),
  responsavel_id: uuidField,
  observacoes: optionalText,
});

export const lgpdIncidenteSchema = z.object({
  data_incidente: requiredText("Informe a data"),
  descricao: requiredText("Informe a descrição"),
  tipo_dado_afetado: requiredText("Informe o dado afetado"),
  pessoas_afetadas: z.coerce.number().optional().nullable(),
  risco: z.enum(["baixo", "médio", "alto", "crítico"]).default("médio"),
  medidas_tomadas: optionalText,
  responsavel_id: uuidField,
  status: z.string().default("em análise"),
});

export const lgpdPoliticaSchema = z.object({
  titulo: requiredText("Informe o título"),
  versao: optionalText,
  documento_url: optionalText,
  validade_em: optionalText,
  status: z.string().default("ativa"),
});

export const lgpdTreinamentoSchema = z.object({
  titulo: requiredText("Informe o título"),
  data_treinamento: requiredText("Informe a data"),
  responsavel_id: uuidField,
  participantes: optionalText.transform((value) =>
    typeof value === "string"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
  ),
  comprovante_url: optionalText,
});

export const lgpdFornecedorOperadorSchema = z.object({
  fornecedor_id: uuidField,
  descricao_tratamento: requiredText("Informe a descrição do tratamento"),
  dados_tratados: optionalText,
  contrato_operador_url: optionalText,
  status: z.string().default("ativo"),
});
