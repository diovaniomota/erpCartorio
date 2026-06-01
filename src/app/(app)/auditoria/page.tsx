import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditTimeline } from "@/components/shared/audit-timeline";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { listScopedRecords } from "@/lib/data";

const TABLE_LABELS: Record<string, string> = {
  chat_mensagens: "Mensagens do chat",
  financeiro_contas: "Contas financeiras",
  tasks: "Tarefas",
  tarefas: "Tarefas",
  profiles: "Usuários",
  funcionarios: "Funcionários",
  contratos: "Contratos",
  fornecedores: "Fornecedores",
  documentos: "Documentos",
  inventario_itens: "Inventário",
  auditoria_logs: "Logs de auditoria",
  cartorios: "Cartórios",
  lgpd_incidentes: "Incidentes LGPD",
  lgpd_solicitacoes: "Solicitações LGPD",
};

export default async function AuditoriaPage() {
  await requirePermission("ver_auditoria");
  const logs = await listScopedRecords("auditoria_logs", { orderBy: "created_at", ascending: false, includeDeleted: true });
  const logsFormatados = logs.map((log) => ({
    ...log,
    tabela: TABLE_LABELS[String(log.tabela)] ?? String(log.tabela ?? "—"),
  }));
  return (
    <>
      <PageHeader title="Auditoria" description="Logs de operações sensíveis: financeiro, contratos, RH, documentos, LGPD, permissões e tarefas." />
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditTimeline logs={logs} />
          </CardContent>
        </Card>
        <DataTable
          data={logsFormatados as unknown as Record<string, unknown>[]}
          columns={[
            { key: "created_at", label: "Data", format: "date" },
            { key: "acao", label: "Ação", format: "status" },
            { key: "modulo", label: "Módulo" },
            { key: "tabela", label: "Tabela" },
            { key: "usuario_nome", label: "Usuário" },
          ]}
          exportable
          exportFilename="auditoria"
          exportTitle="Logs de auditoria"
        />
      </div>
    </>
  );
}
