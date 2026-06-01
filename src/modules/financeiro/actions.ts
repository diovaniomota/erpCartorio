"use server";

import { revalidatePath } from "next/cache";
import { createScopedRecord, restoreScopedRecord, softDeleteScopedRecord, updateScopedRecord } from "@/lib/server-actions";
import { requirePermission } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerAuditLog } from "@/lib/audit";
import { contaFinanceiraSchema, livroCaixaSchema, pagamentoSchema } from "@/modules/financeiro/schemas";
import type { ActionResult, Json } from "@/lib/types";

export async function createContaFinanceira(input: unknown) {
  return createScopedRecord(input, {
    table: "financeiro_contas",
    schema: contaFinanceiraSchema,
    permission: "gerenciar_financeiro",
    modulo: "financeiro",
    path: "/financeiro/contas",
  });
}

export async function updateContaFinanceira(id: string, input: unknown) {
  return updateScopedRecord(id, input, {
    table: "financeiro_contas",
    schema: contaFinanceiraSchema,
    permission: "gerenciar_financeiro",
    modulo: "financeiro",
    path: "/financeiro/contas",
  });
}

export async function deleteContaFinanceira(id: string) {
  return softDeleteScopedRecord(id, {
    table: "financeiro_contas",
    permission: "gerenciar_financeiro",
    modulo: "financeiro",
    path: "/financeiro/contas",
  });
}

export async function createLivroCaixa(input: unknown) {
  return createScopedRecord(input, {
    table: "livro_caixa",
    schema: livroCaixaSchema,
    permission: "gerenciar_financeiro",
    modulo: "financeiro",
    path: "/financeiro/livro-caixa",
  });
}

export async function registrarPagamento(input: unknown): Promise<ActionResult> {
  try {
    const context = await requirePermission("aprovar_pagamentos");
    const parsed = pagamentoSchema.parse(input);

    const supabase = await createSupabaseServerClient();
    const { data: conta, error: contaError } = await supabase
      .from("financeiro_contas")
      .select("*")
      .eq("cartorio_id", context.cartorioId)
      .eq("id", parsed.conta_id)
      .single();

    if (contaError) throw new Error(contaError.message);

    const { data: pagamento, error: pagamentoError } = await supabase
      .from("financeiro_pagamentos")
      .insert({
        ...parsed,
        cartorio_id: context.cartorioId,
        estornado: false,
      })
      .select("*")
      .single();

    if (pagamentoError) throw new Error(pagamentoError.message);

    await supabase
      .from("financeiro_contas")
      .update({
        status: "paga",
        data_pagamento: parsed.data_pagamento,
      })
      .eq("cartorio_id", context.cartorioId)
      .eq("id", parsed.conta_id);

    await supabase.from("livro_caixa").insert({
      cartorio_id: context.cartorioId,
      descricao: `Pagamento: ${conta.descricao}`,
      tipo: conta.tipo === "receber" ? "entrada" : "saída",
      valor: parsed.valor_pago,
      data_movimento: parsed.data_pagamento,
      forma_pagamento: parsed.forma_pagamento,
      conta_id: parsed.conta_id,
      pagamento_id: pagamento.id,
      observacoes: "Lançamento automático gerado pelo pagamento.",
    });

    await registerAuditLog({
      cartorioId: context.cartorioId,
      userId: context.userId,
      acao: "payment",
      modulo: "financeiro",
      tabela: "financeiro_contas",
      registroId: parsed.conta_id,
      dadosAnteriores: conta as Json,
      dadosNovos: pagamento as Json,
    });

    revalidatePath("/financeiro");
    revalidatePath("/financeiro/contas");
    revalidatePath("/financeiro/livro-caixa");

    return { ok: true, message: "Pagamento registrado e livro caixa atualizado.", data: pagamento };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível registrar o pagamento.",
    };
  }
}

export async function restoreContaFinanceira(id: string) {
  return restoreScopedRecord(id, {
    table: "financeiro_contas",
    permission: "gerenciar_financeiro",
    modulo: "financeiro",
    path: "/financeiro/contas",
  });
}
