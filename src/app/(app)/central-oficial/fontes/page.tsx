import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createOfficialSource } from "@/modules/central-oficial/actions";
import { getOfficialSources } from "@/modules/central-oficial/queries";

const fields: EntityField[] = [
  { name: "nome", label: "Nome", required: true },
  { name: "orgao", label: "Órgão", required: true },
  { name: "tipo", label: "Tipo", type: "select", defaultValue: "manual", options: ["API", "RSS", "scraping", "manual"].map((value) => ({ label: value, value })) },
  { name: "url", label: "URL" },
  { name: "ativa", label: "Ativa", type: "checkbox", defaultValue: true },
];

export default async function FontesPage() {
  const sources = await getOfficialSources();

  return (
    <>
      <PageHeader
        title="Fontes monitoradas"
        description="Fontes oficiais configuráveis para cadastro manual e integrações futuras."
        actions={<EntityFormDialog title="Nova fonte" fields={fields} action={createOfficialSource} />}
      />
      <DataTable
        data={sources as unknown as Record<string, unknown>[]}
        columns={[
          { key: "nome", label: "Fonte" },
          { key: "orgao", label: "Órgão" },
          { key: "tipo", label: "Tipo", format: "status" },
          { key: "url", label: "URL" },
          { key: "ativa", label: "Ativa", format: "boolean" },
        ]}
      />
    </>
  );
}
