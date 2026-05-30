import { z } from "zod";
import { optionalText, requiredText, uuidField } from "@/lib/validation";

export const officialSourceSchema = z.object({
  nome: requiredText("Informe a fonte"),
  orgao: requiredText("Informe o órgão"),
  tipo: z.enum(["API", "RSS", "scraping", "manual"]).default("manual"),
  url: optionalText,
  ativa: z.coerce.boolean().default(true),
});

export const officialUpdateSchema = z.object({
  source_id: uuidField,
  titulo: requiredText("Informe o título"),
  resumo: optionalText,
  conteudo: optionalText,
  url_original: optionalText,
  orgao: requiredText("Informe o órgão"),
  tipo: z.enum(["notícia", "comunicado", "provimento", "publicação oficial", "alerta", "norma", "portaria"]).default("comunicado"),
  relevancia: z.enum(["baixa", "média", "alta", "crítica"]).default("média"),
  status: z.enum(["nova", "lida", "em análise", "gerou tarefa", "arquivada"]).default("nova"),
  importante: z.coerce.boolean().default(false),
  publicado_em: optionalText,
  anexo_url: optionalText,
});
