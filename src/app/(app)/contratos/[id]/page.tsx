import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getContrato } from "@/modules/contratos/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ContratoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contrato = await getContrato(id);
  if (!contrato) notFound();

  return (
    <>
      <PageHeader title={contrato.nome} description="Detalhes do contrato administrativo." />
      <Card>
        <CardHeader>
          <CardTitle>Resumo do contrato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Fornecedor" value={contrato.fornecedor_nome} />
          <Info label="Número" value={contrato.numero} />
          <Info label="Valor" value={formatCurrency(contrato.valor)} />
          <Info label="Início" value={formatDate(contrato.data_inicio)} />
          <Info label="Vencimento" value={formatDate(contrato.data_vencimento)} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={contrato.status} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "-"}</p>
    </div>
  );
}
