import { AlertTriangle, Inbox, Timer } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createLgpdSolicitacao, deleteLgpdSolicitacao } from "@/modules/lgpd/actions";
import { getLgpdSolicitacoes } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";

export default async function LgpdSolicitacoesPage() {
  const [solicitacoes, funcionarios] = await Promise.all([getLgpdSolicitacoes(), getFuncionarios()]);
  const hoje = new Date();
  const vencendo = solicitacoes.filter((item) => {
    const prazo = new Date(item.prazo_resposta);
    const diff = prazo.getTime() - hoje.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000 && item.status !== "concluída";
  }).length;
  const atrasadas = solicitacoes.filter((item) => new Date(item.prazo_resposta) < hoje && item.status !== "concluída").length;

  const fields: EntityField[] = [
    { name: "titular_nome", label: "Titular", required: true },
    { name: "titular_email", label: "E-mail", type: "email" },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      defaultValue: "acesso aos dados",
      options: [
        "acesso aos dados",
        "correção",
        "exclusão/bloqueio quando aplicável",
        "informação sobre compartilhamento",
        "revogação de consentimento quando aplicável",
      ].map((value) => ({ label: value, value })),
    },
    { name: "prazo_resposta", label: "Prazo de resposta", type: "date", required: true },
    { name: "status", label: "Status", defaultValue: "aberta" },
    {
      name: "responsavel_id",
      label: "Responsável",
      type: "select",
      options: funcionarios.map((item) => ({ label: item.nome, value: item.id })),
    },
    { name: "observacoes", label: "Observações", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Solicitações de titulares"
        description="Controle de pedidos LGPD, prazos de resposta, responsável e situação de atendimento."
        actions={<EntityFormDialog title="Nova solicitação" fields={fields} action={createLgpdSolicitacao} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Solicitações abertas" value={solicitacoes.filter((item) => item.status !== "concluída").length} icon={Inbox} tone="info" />
        <StatCard title="Vencendo em 7 dias" value={vencendo} icon={Timer} tone="warning" />
        <StatCard title="Atrasadas" value={atrasadas} icon={AlertTriangle} tone="danger" />
      </div>
      <DataTable
        data={solicitacoes as unknown as Record<string, unknown>[]}
        columns={[
          { key: "titular_nome", label: "Titular" },
          { key: "tipo", label: "Tipo" },
          { key: "prazo_resposta", label: "Prazo", format: "date" },
          { key: "responsavel_nome", label: "Responsável" },
          { key: "status", label: "Status", format: "status" },
        ]}
        deleteAction={deleteLgpdSolicitacao}
      />
    </>
  );
}
