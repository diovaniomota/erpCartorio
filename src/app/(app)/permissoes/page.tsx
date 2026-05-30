import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { listScopedRecords } from "@/lib/data";

export default async function PermissoesPage() {
  const permissions = await listScopedRecords("permissoes", { orderBy: "modulo", ascending: true });
  return (
    <>
      <PageHeader title="Permissões" description="RBAC básico com perfis e permissões por cartório." />
      <DataTable data={permissions as unknown as Record<string, unknown>[]} columns={[
        { key: "chave", label: "Permissão" },
        { key: "modulo", label: "Módulo" },
        { key: "descricao", label: "Descrição" },
      ]} />
    </>
  );
}
