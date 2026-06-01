import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types";

type AuditInput = {
  cartorioId: string;
  userId?: string | null;
  acao: string;
  modulo: string;
  tabela: string;
  registroId?: string | null;
  dadosAnteriores?: Json | null;
  dadosNovos?: Json | null;
};

export async function registerAuditLog(input: AuditInput) {
  const headerStore = await headers();
  const supabase = await createSupabaseServerClient();

  await supabase.from("auditoria_logs").insert({
    cartorio_id: input.cartorioId,
    usuario_id: input.userId,
    acao: input.acao,
    modulo: input.modulo,
    tabela: input.tabela,
    registro_id: input.registroId,
    dados_anteriores: input.dadosAnteriores,
    dados_novos: input.dadosNovos,
    ip: headerStore.get("x-forwarded-for"),
    user_agent: headerStore.get("user-agent"),
  });
}
