import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getInventarioItem, getInventarioManutencoes, getInventarioMovimentacoes } from "@/modules/inventario/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InventarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, manutencoes, movimentacoes] = await Promise.all([
    getInventarioItem(id),
    getInventarioManutencoes(),
    getInventarioMovimentacoes(),
  ]);

  if (!item) notFound();

  const itemManutencoes = manutencoes.filter((manutencao) => manutencao.item_id === id);
  const itemMovimentacoes = movimentacoes.filter((movimentacao) => movimentacao.item_id === id);

  return (
    <>
      <PageHeader title={item.nome} description="Ficha patrimonial com garantia, responsável, movimentações e manutenções." />
      <Card>
        <CardHeader>
          <CardTitle>Dados patrimoniais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Info label="Código" value={item.codigo_patrimonio} />
          <Info label="Categoria" value={item.categoria} />
          <Info label="Número de série" value={item.numero_serie} />
          <Info label="Valor de compra" value={formatCurrency(item.valor_compra)} />
          <Info label="Data da compra" value={formatDate(item.data_compra)} />
          <Info label="Garantia até" value={formatDate(item.garantia_ate)} />
          <Info label="Localização" value={item.localizacao} />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <StatusBadge status={item.status} />
          </div>
          <Info label="Descrição" value={item.descricao} className="xl:col-span-3" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Manutenções</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={itemManutencoes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "descricao", label: "Descrição" },
              { key: "fornecedor_nome", label: "Fornecedor" },
              { key: "data_inicio", label: "Início", format: "date" },
              { key: "data_fim", label: "Fim", format: "date" },
              { key: "custo", label: "Custo", format: "currency" },
              { key: "status", label: "Status", format: "status" },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={itemMovimentacoes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "created_at", label: "Data", format: "date" },
              { key: "tipo", label: "Tipo", format: "status" },
              { key: "localizacao_anterior", label: "Origem" },
              { key: "localizacao_nova", label: "Destino" },
              { key: "descricao", label: "Descrição" },
            ]}
          />
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
