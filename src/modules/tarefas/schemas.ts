import { z } from "zod";
import { optionalText, requiredText, uuidField } from "@/lib/validation";

export const taskBoardSchema = z.object({
  nome: requiredText("Informe o nome do quadro"),
  descricao: optionalText,
  ativo: z.coerce.boolean().default(true),
});

export const taskSchema = z.object({
  board_id: requiredText("Informe o quadro"),
  column_id: requiredText("Informe a coluna"),
  titulo: requiredText("Informe o título"),
  descricao: optionalText,
  categoria: requiredText("Informe a categoria"),
  prioridade: z.enum(["baixa", "média", "alta", "urgente"]).default("média"),
  status: z.enum(["aberta", "em andamento", "aguardando terceiro", "em revisão", "concluída", "cancelada", "atrasada"]).default("aberta"),
  responsavel_id: uuidField,
  data_inicio: optionalText,
  data_prazo: optionalText,
  vinculo_tipo: optionalText,
  vinculo_id: uuidField,
  ordem: z.coerce.number().default(1),
});

export const moveTaskSchema = z.object({
  taskId: requiredText("Informe a tarefa"),
  columnId: requiredText("Informe a coluna"),
  oldColumnId: optionalText,
  order: z.coerce.number().default(1),
  status: optionalText,
});
