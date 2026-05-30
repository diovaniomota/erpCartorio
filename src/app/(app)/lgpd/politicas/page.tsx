import { FileText, ShieldCheck, Timer } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createLgpdPolitica, deleteLgpdPolitica } from "@/modules/lgpd/actions";
import { getLgpdPoliticas } from "@/modules/lgpd/queries";

export default async function LgpdPoliticasPage() {
  const politicas = await getLgpdPoliticas();
  const ativas = politicas.filter((item) => item.status === "ativa").length;
  const vencendo = politicas.filter((item) => {
    if (!item.validade_em) return false;
    const diff = new Date(item.validade_em).getTime() - Date.now();
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  const fields: EntityField[] = [
    { name: "titulo", label: "Título", required: true },
    { name: "versao", label: "Versão" },
    { name: "documento_url", label: "URL do documento", type: "url" },
    { name: "validade_em", label: "Validade", type: "date" },
    { name: "status", label: "Status", defaultValue: "ativa" },
  ];

  return (
    <>
      <PageHeader
        title="Políticas LGPD"
        description="Políticas internas, versões, validade, anexos e situação de vigência."
        actions={<EntityFormDialog title="Nova política" fields={fields} action={createLgpdPolitica} />}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Políticas cadastradas" value={politicas.length} icon={FileText} tone="info" />
        <StatCard title="Ativas" value={ativas} icon={ShieldCheck} tone="success" />
        <StatCard title="Vencendo em 30 dias" value={vencendo} icon={Timer} tone="warning" />
      </div>
      <DataTable
        data={politicas as unknown as Record<string, unknown>[]}
        columns={[
          { key: "titulo", label: "Política" },
          { key: "versao", label: "Versão" },
          { key: "validade_em", label: "Validade", format: "date" },
          { key: "status", label: "Status", format: "status" },
          { key: "documento_url", label: "Documento" },
        ]}
        deleteAction={deleteLgpdPolitica}
      />
    </>
  );
}
