import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditTimeline } from "@/components/shared/audit-timeline";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { listScopedRecords } from "@/lib/data";

export default async function AuditoriaPage() {
  const logs = await listScopedRecords("auditoria_logs", { orderBy: "created_at", ascending: false, includeDeleted: true });
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
        <DataTable data={logs as unknown as Record<string, unknown>[]} columns={[
          { key: "created_at", label: "Data", format: "date" },
          { key: "acao", label: "Ação", format: "status" },
          { key: "modulo", label: "Módulo" },
          { key: "tabela", label: "Tabela" },
          { key: "usuario_nome", label: "Usuário" },
        ]} />
      </div>
    </>
  );
}
