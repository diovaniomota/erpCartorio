import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { listScopedRecords } from "@/lib/data";

export default async function UsuariosPage() {
  await requirePermission("gerenciar_usuarios");
  const profiles = await listScopedRecords("profiles", { orderBy: "nome", ascending: true });
  return (
    <>
      <PageHeader title="Usuários" description="Equipe com acesso ao sistema. Cada usuário é vinculado a um perfil de permissões." />
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
