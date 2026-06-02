import { z } from "zod";
import { optionalText, requiredText } from "@/lib/validation";

export const chatConversaSchema = z
  .object({
    nome: optionalText,
    tipo: z.enum(["canal", "individual"]).default("canal"),
    setor: optionalText,
    participante_id: optionalText,
  })
  .superRefine((value, ctx) => {
    if (value.tipo === "canal" && !value.nome) {
      ctx.addIssue({
        code: "custom",
        path: ["nome"],
        message: "Informe o nome do canal",
      });
    }

    if (value.tipo === "individual" && !value.participante_id) {
      ctx.addIssue({
        code: "custom",
        path: ["participante_id"],
        message: "Selecione o usuário da conversa",
      });
    }
  });

export const chatMensagemSchema = z.object({
  conversa_id: requiredText("Informe a conversa"),
  mensagem: requiredText("Informe a mensagem"),
  fixada: z.coerce.boolean().default(false),
});
