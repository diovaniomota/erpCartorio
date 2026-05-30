import { z } from "zod";
import { requiredText } from "@/lib/validation";

export const configuracaoSchema = z.object({
  chave: requiredText("Informe a chave"),
  valor: z
    .string()
    .trim()
    .default("{}")
    .transform((value, ctx) => {
      try {
        return JSON.parse(value || "{}");
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "JSON inválido" });
        return z.NEVER;
      }
    }),
});
