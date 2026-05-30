import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getFuncionario } from "@/modules/rh/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function FuncionarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const funcionario = await getFuncionario(id);
  if (!funcionario) notFound();

  return (
    <>
      <PageHeader title={funcionario.nome} description="Ficha administrativa do funcionário." />
      <Card>
        <CardHeader>
          <CardTitle>Dados funcionais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Cargo" value={funcionario.cargo} />
          <Info label="Setor" value={funcionario.setor} />
          <Info label="Admissão" value={formatDate(funcionario.data_admissao)} />
          <Info label="Tipo de contrato" value={funcionario.tipo_contrato} />
          <Info label="Salário" value={funcionario.salario ? formatCurrency(funcionario.salario) : "Restrito"} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={funcionario.status} />
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
