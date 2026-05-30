import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDocumentoInterno } from "@/modules/documentos/queries";
import { formatDate } from "@/lib/utils";

export default async function DocumentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocumentoInterno(id);
  if (!doc) notFound();

  return (
    <>
      <PageHeader title={doc.titulo} description="Documento interno administrativo." />
      <Card>
        <CardHeader>
          <CardTitle>Metadados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Categoria" value={doc.categoria} />
          <Info label="Pasta" value={doc.pasta} />
          <Info label="Validade" value={formatDate(doc.validade_em)} />
          <Info label="Acesso" value={doc.acesso} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={doc.status} />
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
