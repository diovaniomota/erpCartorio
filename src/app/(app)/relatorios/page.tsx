import { BarChart3, BriefcaseBusiness, ClipboardList, Package, ShieldAlert, UsersRound, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getContratos } from "@/modules/contratos/queries";
import { getContasFinanceiras } from "@/modules/financeiro/queries";
import { getInventarioItens } from "@/modules/inventario/queries";
import { getLgpdIncidentes, getLgpdSolicitacoes } from "@/modules/lgpd/queries";
import { getAtestados, getFerias, getFuncionarios } from "@/modules/rh/queries";
import { getTasks } from "@/modules/tarefas/queries";

export default async function RelatoriosPage() {
  const [contas, funcionarios, atestados, ferias, contratos, inventario, incidentes, solicitacoes, tasks] = await Promise.all([
    getContasFinanceiras(),
    getFuncionarios(),
    getAtestados(),
    getFerias(),
    getContratos(),
    getInventarioItens(),
    getLgpdIncidentes(),
    getLgpdSolicitacoes(),
    getTasks(),
  ]);

  const relatorios = [
    { id: "financeiro", modulo: "Financeiro", indicador: "Contas cadastradas", valor: contas.length },
    { id: "rh", modulo: "RH", indicador: "Funcionários ativos", valor: funcionarios.filter((item) => item.status === "ativo").length },
    { id: "atestados", modulo: "RH", indicador: "Atestados registrados", valor: atestados.length },
    { id: "ferias", modulo: "RH", indicador: "Férias em andamento/aprovadas", valor: ferias.filter((item) => ["em andamento", "aprovada"].includes(item.status)).length },
    { id: "contratos", modulo: "Contratos", indicador: "Contratos vigentes", valor: contratos.filter((item) => item.status === "vigente" || item.status === "a vencer").length },
    { id: "inventario", modulo: "Inventário", indicador: "Bens em manutenção", valor: inventario.filter((item) => item.status === "em manutenção").length },
    { id: "lgpd", modulo: "LGPD", indicador: "Incidentes abertos", valor: incidentes.filter((item) => item.status !== "concluído").length },
    { id: "solicitacoes", modulo: "LGPD", indicador: "Solicitações abertas", valor: solicitacoes.filter((item) => item.status !== "concluída").length },
    { id: "tarefas", modulo: "Tarefas", indicador: "Tarefas em aberto", valor: tasks.filter((item) => item.status !== "concluída").length },
  ];

  return (
    <>
      <PageHeader
        title="Relatórios administrativos"
        description="Resumo consolidado dos principais controles operacionais por módulo."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Financeiro" value={contas.length} icon={WalletCards} tone="info" />
        <StatCard title="Funcionários" value={funcionarios.length} icon={UsersRound} tone="success" />
        <StatCard title="Contratos" value={contratos.length} icon={BriefcaseBusiness} tone="warning" />
        <StatCard title="Patrimônio" value={inventario.length} icon={Package} tone="neutral" />
        <StatCard title="Pendências LGPD" value={incidentes.length + solicitacoes.length} icon={ShieldAlert} tone="danger" />
        <StatCard title="Tarefas" value={tasks.length} icon={ClipboardList} tone="info" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Relatórios disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={relatorios}
            columns={[
              { key: "modulo", label: "Módulo" },
              { key: "indicador", label: "Indicador" },
              { key: "valor", label: "Total" },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
