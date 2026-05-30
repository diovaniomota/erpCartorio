import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { getContasFinanceiras } from "@/modules/financeiro/queries";

export default async function BoletosPage() {
  const contas = (await getContasFinanceiras()).filter((conta) => conta.codigo_barras);

  return (
    <>
      <PageHeader title="Boletos" description="Boletos administrativos com código de barras, vencimento, status e vínculos financeiros." />
      <DataTable
        data={contas as unknown as Record<string, unknown>[]}
        columns={[
          { key: "descricao", label: "Boleto" },
          { key: "codigo_barras", label: "Código de barras" },
          { key: "valor", label: "Valor", format: "currency" },
          { key: "data_vencimento", label: "Vencimento", format: "date" },
          { key: "status", label: "Status", format: "status" },
        ]}
      />
    </>
  );
}
