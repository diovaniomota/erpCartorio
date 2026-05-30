import { FileText, Inbox, ServerCog, ShieldAlert } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  getLgpdFornecedoresOperadores,
  getLgpdIncidentes,
  getLgpdInventarioDados,
  getLgpdSolicitacoes,
} from "@/modules/lgpd/queries";

export default async function LgpdPage() {
  const [incidentes, solicitacoes, inventario, operadores] = await Promise.all([
    getLgpdIncidentes(),
    getLgpdSolicitacoes(),
    getLgpdInventarioDados(),
    getLgpdFornecedoresOperadores(),
  ]);
  return (
    <>
      <PageHeader title="LGPD e compliance" description="Painel básico de incidentes, solicitações, políticas, treinamentos e operadores." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Processos mapeados" value={inventario.length} icon={FileText} tone="info" />
        <StatCard title="Solicitações abertas" value={solicitacoes.filter((item) => item.status !== "concluída").length} icon={Inbox} tone="warning" />
        <StatCard title="Incidentes registrados" value={incidentes.length} icon={ShieldAlert} tone="danger" />
        <StatCard title="Operadores ativos" value={operadores.filter((item) => item.status === "ativo").length} icon={ServerCog} tone="success" />
      </div>
      <DataTable data={incidentes as unknown as Record<string, unknown>[]} columns={[
        { key: "data_incidente", label: "Data", format: "date" },
        { key: "descricao", label: "Descrição" },
        { key: "tipo_dado_afetado", label: "Dado afetado" },
        { key: "responsavel_nome", label: "Responsável" },
        { key: "risco", label: "Risco", format: "priority" },
        { key: "status", label: "Status", format: "status" },
      ]} />
    </>
  );
}
