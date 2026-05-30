import { z } from "zod";
import { optionalText, requiredText } from "@/lib/validation";

export const chatConversaSchema = z.object({
  nome: requiredText("Informe o nome"),
  tipo: z.enum(["canal", "grupo", "individual"]).default("canal"),
  setor: optionalText,
});

export const chatMensagemSchema = z.object({
  conversa_id: requiredText("Informe a conversa"),
  mensagem: requiredText("Informe a mensagem"),
  fixada: z.coerce.boolean().default(false),
});
