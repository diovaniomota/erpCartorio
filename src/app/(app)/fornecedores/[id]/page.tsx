import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getFornecedor } from "@/modules/fornecedores/queries";

export default async function FornecedorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fornecedor = await getFornecedor(id);
  if (!fornecedor) notFound();

  return (
    <>
      <PageHeader title={fornecedor.nome} description="Detalhes cadastrais do fornecedor." />
      <Card>
        <CardHeader>
          <CardTitle>Dados do fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Categoria" value={fornecedor.categoria} />
          <Info label="Documento" value={fornecedor.documento} />
          <Info label="Telefone" value={fornecedor.telefone} />
          <Info label="E-mail" value={fornecedor.email} />
          <Info label="Contato" value={fornecedor.contato_responsavel} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={fornecedor.status} />
          </div>
          <Info label="Endereço" value={fornecedor.endereco} className="sm:col-span-2" />
          <Info label="Observações" value={fornecedor.observacoes} className="sm:col-span-2" />
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "-"}</p>
    </div>
  );
}
