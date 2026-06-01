import { Database, Scale, Share2 } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createLgpdInventarioDado, deleteLgpdInventarioDado } from "@/modules/lgpd/actions";
import { getLgpdInventarioDados } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";

export default async function LgpdInventarioDadosPage() {
  const [inventario, funcionarios] = await Promise.all([getLgpdInventarioDados(), getFuncionarios()]);
  const basesLegais = new Set(inventario.map((item) => item.base_legal)).size;
  const compartilhados = inventario.filter((item) => item.compartilhamento).length;

  const fields: EntityField[] = [
    { name: "processo", label: "Processo", required: true },
    { name: "categoria_dado", label: "Categoria de dado", required: true },
    { name: "base_legal", label: "Base legal", required: true },
    { name: "finalidade", label: "Finalidade", type: "textarea", required: true },
    { name: "retencao", label: "Retenção" },
    { name: "compartilhamento", label: "Compartilhamento", type: "textarea" },
    {
      name: "responsavel_id",
      label: "Responsável",
      type: "select",
      options: funcionarios.map((item) => ({ label: item.nome, value: item.id })),
    },
  ];

  return (
    <>
      <PageHeader
        tone="lgpd"
        title="Inventário de dados LGPD"
        description="Mapeamento de processos, categorias de dados, bases legais, finalidade, retenção e compartilhamentos."
        actions={<EntityFormDialog title="Novo item de inventário" fields={fields} action={createLgpdInventarioDado} />}
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Processos mapeados" value={inventario.length} icon={Database} tone="info" />
        <StatCard title="Bases legais" value={basesLegais} icon={Scale} tone="success" />
        <StatCard title="Com compartilhamento" value={compartilhados} icon={Share2} tone="warning" />
      </div>
      <DataTable
        data={inventario as unknown as Record<string, unknown>[]}
        columns={[
          { key: "processo", label: "Processo" },
          { key: "categoria_dado", label: "Categoria" },
          { key: "base_legal", label: "Base legal" },
          { key: "finalidade", label: "Finalidade" },
          { key: "responsavel_nome", label: "Responsável" },
        ]}
        deleteAction={deleteLgpdInventarioDado}
      />
    </>
  );
}
