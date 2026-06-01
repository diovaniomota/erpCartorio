import { z } from "zod";
import { money, optionalCpf, optionalText, requiredText } from "@/lib/validation";

export const funcionarioSchema = z.object({
  nome: requiredText("Informe o nome"),
  cpf: optionalCpf,
  email: z.string().email("E-mail inválido").or(z.literal("")).transform((value) => value || null).optional(),
  telefone: optionalText,
  cargo: requiredText("Informe o cargo"),
  setor: requiredText("Informe o setor"),
  data_admissao: requiredText("Informe a admissão"),
  tipo_contrato: requiredText("Informe o contrato"),
  salario: money.optional().nullable(),
  status: z.enum(["ativo", "afastado", "férias", "desligado", "licença"]).default("ativo"),
  observacoes: optionalText,
});

export const atestadoSchema = z.object({
  funcionario_id: requiredText("Informe o funcionário"),
  tipo: z.enum([
    "atestado médico",
    "licença",
    "falta justificada",
    "falta injustificada",
    "afastamento INSS",
    "licença maternidade",
    "licença paternidade",
  ]).default("atestado médico"),
  data_inicio: requiredText("Informe a data inicial"),
  data_fim: requiredText("Informe a data final"),
  quantidade_dias: z.coerce.number().min(1, "Informe a quantidade de dias"),
  cid: optionalText,
  status: z.enum(["pendente", "aprovado", "reprovado"]).default("pendente"),
  documento_url: optionalText,
  observacoes: optionalText,
});

export const pontoSchema = z.object({
  funcionario_id: requiredText("Informe o funcionário"),
  tipo: z.enum(["entrada", "saida_almoco", "retorno_almoco", "saida"]),
  registrado_em: requiredText("Informe a data e hora"),
  observacao: optionalText,
  ajuste_manual: z.coerce.boolean().default(false),
  justificativa_ajuste: optionalText,
});

export const feriasSchema = z.object({
  funcionario_id: requiredText("Informe o funcionário"),
  periodo_aquisitivo_inicio: requiredText("Informe o período"),
  periodo_aquisitivo_fim: requiredText("Informe o período"),
  data_inicio: requiredText("Informe o início"),
  data_fim: requiredText("Informe o fim"),
  status: z.enum(["pendente", "aprovada", "reprovada", "em andamento", "concluída", "cancelada"]).default("pendente"),
  observacoes: optionalText,
});

export const beneficioSchema = z.object({
  funcionario_id: requiredText("Informe o funcionário"),
  nome: requiredText("Informe o benefício"),
  valor: money.optional().nullable(),
  ativo: z.coerce.boolean().default(true),
});
