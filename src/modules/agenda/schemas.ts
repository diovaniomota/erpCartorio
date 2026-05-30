import { z } from "zod";
import { optionalText, requiredText, uuidField } from "@/lib/validation";

export const agendaEventoSchema = z.object({
  titulo: requiredText("Informe o título"),
  descricao: optionalText,
  tipo: z.enum(["reunião", "boleto", "contrato", "férias", "atestado", "LGPD", "tarefa", "tribunal", "manutenção", "treinamento", "manual"]).default("manual"),
  data_inicio: requiredText("Informe o início"),
  data_fim: requiredText("Informe o fim"),
  dia_todo: z.coerce.boolean().default(false),
  local: optionalText,
  link_reuniao: optionalText,
  prioridade: z.enum(["baixa", "média", "alta", "urgente"]).default("média"),
  status: z.enum(["agendado", "concluído", "cancelado"]).default("agendado"),
  responsavel_id: uuidField,
  vinculo_tipo: optionalText,
  vinculo_id: uuidField,
  lembrete_minutos: z.coerce.number().optional().nullable(),
});

export type AgendaEventoInput = z.infer<typeof agendaEventoSchema>;
