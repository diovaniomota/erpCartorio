import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createLivroCaixa } from "@/modules/financeiro/actions";
import { getLivroCaixa } from "@/modules/financeiro/queries";

const fields: EntityField[] = [
  { name: "descricao", label: "Descrição", required: true },
  { name: "tipo", label: "Tipo", type: "select", defaultValue: "entrada", options: ["entrada", "saída", "transferência", "ajuste", "estorno"].map((value) => ({ label: value, value })) },
  { name: "valor", label: "Valor", type: "money", required: true },
  { name: "data_movimento", label: "Data", type: "date", required: true },
  { name: "forma_pagamento", label: "Forma de pagamento", type: "select", defaultValue: "pix", options: ["dinheiro", "pix", "transferência", "cartão", "boleto", "cheque"].map((value) => ({ label: value, value })) },
  { name: "observacoes", label: "Observações", type: "textarea" },
];

export default async function LivroCaixaPage() {
  const movimentos = await getLivroCaixa();

  return (
    <>
      <PageHeader
        title="Livro caixa"
        description="Entradas, saídas, transferências, ajustes e estornos do caixa administrativo."
        actions={<EntityFormDialog title="Novo lançamento" fields={fields} action={createLivroCaixa} />}
      />
      <DataTable
        data={movimentos as unknown as Record<string, unknown>[]}
        columns={[
          { key: "descricao", label: "Descrição" },
          { key: "tipo", label: "Tipo", format: "status" },
          { key: "valor", label: "Valor", format: "currency" },
          { key: "data_movimento", label: "Data", format: "date" },
          { key: "forma_pagamento", label: "Pagamento" },
        ]}
      />
    </>
  );
}
