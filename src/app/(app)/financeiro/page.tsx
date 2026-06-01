import { Banknote, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getContasFinanceiras, getLivroCaixa } from "@/modules/financeiro/queries";

export default async function FinanceiroPage() {
  const [contas, livroCaixa] = await Promise.all([getContasFinanceiras(), getLivroCaixa()]);
  const despesas = contas.filter((conta) => conta.tipo === "pagar").reduce((sum, conta) => sum + conta.valor, 0);
  const receitas = contas.filter((conta) => conta.tipo === "receber").reduce((sum, conta) => sum + conta.valor, 0);
  const boletos = contas.filter((conta) => conta.codigo_barras && conta.status !== "paga").length;
  const saldo = livroCaixa.reduce((sum, mov) => sum + mov.valor * (mov.tipo === "entrada" ? 1 : -1), 0);

  return (
    <>
      <PageHeader title="Financeiro administrativo" description="Contas, boletos, pagamentos e caixa interno sem apagar histórico financeiro." />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Despesas abertas" value={despesas} format="currency" icon={TrendingDown} tone="warning" />
        <StatCard title="Receitas programadas" value={receitas} format="currency" icon={TrendingUp} tone="success" />
        <StatCard title="Boletos em aberto" value={boletos} icon={Receipt} tone="info" />
        <StatCard title="Saldo do caixa" value={saldo} format="currency" icon={Banknote} tone="success" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Últimas contas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={contas as unknown as Record<string, unknown>[]}
            columns={[
              { key: "descricao", label: "Descrição" },
              { key: "tipo", label: "Tipo" },
              { key: "valor", label: "Valor", format: "currency" },
              { key: "data_vencimento", label: "Vencimento", format: "date" },
              { key: "status", label: "Status", format: "status" },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
