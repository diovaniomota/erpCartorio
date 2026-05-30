import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { listScopedRecords } from "@/lib/data";

export default async function UsuariosPage() {
  const profiles = await listScopedRecords("profiles", { orderBy: "nome", ascending: true });
  return (
    <>
      <PageHeader title="Usuários" description="Usuários do cartório, vinculados ao Supabase Auth e isolados por cartorio_id." />
      <DataTable data={profiles as unknown as Record<string, unknown>[]} columns={[
        { key: "nome", label: "Nome" },
        { key: "email", label: "E-mail" },
        { key: "cargo", label: "Cargo" },
        { key: "setor", label: "Setor" },
        { key: "ativo", label: "Ativo", format: "boolean" },
      ]} />
    </>
  );
}
