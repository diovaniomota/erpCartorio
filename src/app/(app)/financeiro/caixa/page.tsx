import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createLivroCaixa } from "@/modules/financeiro/actions";
import { getLivroCaixa } from "@/modules/financeiro/queries";

const fields: EntityField[] = [
  { name: "descricao", label: "Descrição", required: true },
  { name: "tipo", label: "Tipo", type: "select", defaultValue: "entrada", options: ["entrada", "saída", "transferência", "ajuste", "estorno"].map((value) => ({ label: value, value })) },
  { name: "valor", label: "Valor", type: "money", required: true },
  { name: "data_movimento", label: "Data", type: "date", required: true },
  { name: "forma_pagamento", label: "Forma de pagamento", type: "select", defaultValue: "dinheiro", options: ["dinheiro", "pix", "transferência", "cartão", "boleto", "cheque"].map((value) => ({ label: value, value })) },
  { name: "observacoes", label: "Observações", type: "textarea" },
];

export default async function CaixaPage() {
  const movimentos = await getLivroCaixa();
  const entradas = movimentos
    .filter((movimento) => ["entrada", "ajuste"].includes(movimento.tipo))
    .reduce((sum, movimento) => sum + Number(movimento.valor ?? 0), 0);
  const saidas = movimentos
    .filter((movimento) => ["saída", "estorno"].includes(movimento.tipo))
    .reduce((sum, movimento) => sum + Number(movimento.valor ?? 0), 0);
  const saldo = entradas - saidas;

  return (
    <>
      <PageHeader
        title="Caixa interno"
        description="Resumo operacional do caixa administrativo, com entradas, saídas e saldo disponível."
        actions={<EntityFormDialog title="Novo movimento de caixa" fields={fields} action={createLivroCaixa} />}
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Entradas" value={entradas} format="currency" icon={ArrowUpCircle} tone="success" />
        <StatCard title="Saídas" value={saidas} format="currency" icon={ArrowDownCircle} tone="danger" />
        <StatCard title="Saldo interno" value={saldo} format="currency" icon={Wallet} tone="info" />
      </div>
      <DataTable
        data={movimentos as unknown as Record<string, unknown>[]}
        columns={[
          { key: "descricao", label: "Movimento" },
          { key: "tipo", label: "Tipo", format: "status" },
          { key: "forma_pagamento", label: "Pagamento" },
          { key: "valor", label: "Valor", format: "currency" },
          { key: "data_movimento", label: "Data", format: "date" },
        ]}
      />
    </>
  );
}
