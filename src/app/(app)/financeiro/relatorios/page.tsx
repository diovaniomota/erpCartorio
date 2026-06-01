import { BarChart3, Landmark, ReceiptText, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getContasFinanceiras, getLivroCaixa } from "@/modules/financeiro/queries";

export default async function FinanceiroRelatoriosPage() {
  const [contas, caixa] = await Promise.all([getContasFinanceiras(), getLivroCaixa()]);
  const despesas = contas.filter((conta) => conta.tipo === "pagar");
  const receitas = contas.filter((conta) => conta.tipo === "receber");
  const pagas = contas.filter((conta) => conta.status === "paga");
  const vencidas = contas.filter((conta) => conta.status === "vencida");
  const saldoCaixa = caixa.reduce((sum, mov) => sum + mov.valor * (["entrada", "ajuste"].includes(mov.tipo) ? 1 : -1), 0);

  const porCategoria = Object.entries(
    despesas.reduce<Record<string, number>>((acc, conta) => {
      const categoria = conta.categoria_nome ?? "sem categoria";
      acc[categoria] = (acc[categoria] ?? 0) + conta.valor;
      return acc;
    }, {}),
  ).map(([categoria, valor]) => ({ id: categoria, categoria, valor }));

  const porFornecedor = Object.entries(
    despesas.reduce<Record<string, number>>((acc, conta) => {
      const fornecedor = conta.fornecedor_nome ?? "sem fornecedor";
      acc[fornecedor] = (acc[fornecedor] ?? 0) + conta.valor;
      return acc;
    }, {}),
  ).map(([fornecedor, valor]) => ({ id: fornecedor, fornecedor, valor }));

  return (
    <>
      <PageHeader
        title="Relatórios financeiros"
        description="Leitura administrativa de despesas, receitas, vencidos, fluxo de caixa e fornecedores mais pagos."
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Despesas" value={despesas.reduce((sum, item) => sum + item.valor, 0)} format="currency" icon={TrendingDown} tone="warning" />
        <StatCard title="Receitas" value={receitas.reduce((sum, item) => sum + item.valor, 0)} format="currency" icon={TrendingUp} tone="success" />
        <StatCard title="Contas pagas" value={pagas.length} icon={ReceiptText} tone="success" />
        <StatCard title="Contas vencidas" value={vencidas.length} icon={BarChart3} tone="danger" />
        <StatCard title="Saldo caixa" value={saldoCaixa} format="currency" icon={Landmark} tone="info" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={porCategoria}
              columns={[
                { key: "categoria", label: "Categoria" },
                { key: "valor", label: "Valor", format: "currency" },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fornecedores mais pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={porFornecedor}
              columns={[
                { key: "fornecedor", label: "Fornecedor" },
                { key: "valor", label: "Valor", format: "currency" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={caixa as unknown as Record<string, unknown>[]}
            columns={[
              { key: "data_movimento", label: "Data", format: "date" },
              { key: "descricao", label: "Descrição" },
              { key: "tipo", label: "Tipo", format: "status" },
              { key: "forma_pagamento", label: "Pagamento" },
              { key: "valor", label: "Valor", format: "currency" },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
