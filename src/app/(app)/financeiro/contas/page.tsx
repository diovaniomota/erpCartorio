import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { FinancialLedger } from "@/components/shared/record-views";
import { createContaFinanceira, deleteContaFinanceira } from "@/modules/financeiro/actions";
import { getFinanceiroCategorias, getContasFinanceiras } from "@/modules/financeiro/queries";
import { getContratos } from "@/modules/contratos/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";

type ContasPageProps = {
  searchParams?: Promise<{ tipo?: string }>;
};

export default async function ContasPage({ searchParams }: ContasPageProps) {
  const params = await searchParams;
  const [contas, fornecedores, contratos, categorias] = await Promise.all([
    getContasFinanceiras(),
    getFornecedores(),
    getContratos(),
    getFinanceiroCategorias(),
  ]);
  const tipoFiltro = params?.tipo === "pagar" || params?.tipo === "receber" ? params.tipo : undefined;
  const contasFiltradas = tipoFiltro ? contas.filter((conta) => conta.tipo === tipoFiltro) : contas;
  const fields: EntityField[] = [
    { name: "descricao", label: "Descrição", required: true },
    { name: "tipo", label: "Tipo", type: "select", defaultValue: "pagar", options: [{ label: "Pagar", value: "pagar" }, { label: "Receber", value: "receber" }] },
    { name: "valor", label: "Valor", type: "money", required: true },
    { name: "data_vencimento", label: "Vencimento", type: "date", required: true },
    { name: "status", label: "Status", type: "select", defaultValue: "aberta", options: ["aberta", "agendada", "paga", "vencida", "cancelada", "estornada"].map((value) => ({ label: value, value })) },
    { name: "fornecedor_id", label: "Fornecedor", type: "select", options: fornecedores.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "contrato_id", label: "Contrato", type: "select", options: contratos.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "categoria_id", label: "Categoria", type: "select", options: categorias.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "centro_custo", label: "Centro de custo" },
    { name: "codigo_barras", label: "Código de barras" },
    { name: "recorrente", label: "Recorrente", type: "checkbox" },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title={tipoFiltro === "pagar" ? "Contas a pagar" : tipoFiltro === "receber" ? "Contas a receber" : "Contas e boletos"}
        description={
          tipoFiltro
            ? `Controle filtrado de contas a ${tipoFiltro === "pagar" ? "pagar" : "receber"}, vencimentos e status financeiro.`
            : "Controle de contas a pagar/receber, boletos, vencimentos e status financeiro."
        }
        actions={<EntityFormDialog title="Nova conta" fields={fields} action={createContaFinanceira} />}
      />
      <FinancialLedger contas={contasFiltradas} deleteAction={deleteContaFinanceira} />
    </>
  );
}
