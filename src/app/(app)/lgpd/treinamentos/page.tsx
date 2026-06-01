import { GraduationCap, Paperclip, UsersRound } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createLgpdTreinamento, deleteLgpdTreinamento } from "@/modules/lgpd/actions";
import { getLgpdTreinamentos } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";

export default async function LgpdTreinamentosPage() {
  const [treinamentos, funcionarios] = await Promise.all([getLgpdTreinamentos(), getFuncionarios()]);
  const participantes = treinamentos.reduce((sum, item) => sum + (Array.isArray(item.participantes) ? item.participantes.length : 0), 0);
  const comComprovante = treinamentos.filter((item) => item.comprovante_url).length;

  const fields: EntityField[] = [
    { name: "titulo", label: "Título", required: true },
    { name: "data_treinamento", label: "Data", type: "date", required: true },
    {
      name: "responsavel_id",
      label: "Responsável",
      type: "select",
      options: funcionarios.map((item) => ({ label: item.nome, value: item.id })),
    },
    { name: "participantes", label: "Participantes separados por vírgula", type: "textarea" },
    { name: "comprovante_url", label: "URL do comprovante", type: "url" },
  ];

  return (
    <>
      <PageHeader
        title="Treinamentos LGPD"
        description="Treinamentos realizados, responsáveis, participantes e comprovantes."
        actions={<EntityFormDialog title="Novo treinamento" fields={fields} action={createLgpdTreinamento} />}
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Treinamentos" value={treinamentos.length} icon={GraduationCap} tone="info" />
        <StatCard title="Participações" value={participantes} icon={UsersRound} tone="success" />
        <StatCard title="Com comprovante" value={comComprovante} icon={Paperclip} tone="warning" />
      </div>
      <DataTable
        data={treinamentos as unknown as Record<string, unknown>[]}
        columns={[
          { key: "titulo", label: "Treinamento" },
          { key: "data_treinamento", label: "Data", format: "date" },
          { key: "responsavel_nome", label: "Responsável" },
          { key: "comprovante_url", label: "Comprovante" },
        ]}
        deleteAction={deleteLgpdTreinamento}
      />
    </>
  );
}
