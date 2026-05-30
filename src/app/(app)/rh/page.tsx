import { Users, UserX, CalendarDays, FileHeart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { getAtestados, getBeneficios, getFerias, getFuncionarios, getPonto } from "@/modules/rh/queries";

export default async function RhPage() {
  const [funcionarios, atestados, ponto, ferias, beneficios] = await Promise.all([
    getFuncionarios(),
    getAtestados(),
    getPonto(),
    getFerias(),
    getBeneficios(),
  ]);

  return (
    <>
      <PageHeader title="RH administrativo" description="Funcionários, atestados, afastamentos, ponto, férias e benefícios." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Funcionários ativos" value={funcionarios.filter((item) => item.status === "ativo").length} icon={Users} tone="success" />
        <StatCard title="Ausentes" value={funcionarios.filter((item) => ["afastado", "férias", "licença"].includes(item.status)).length} icon={UserX} tone="warning" />
        <StatCard title="Atestados recentes" value={atestados.length} icon={FileHeart} tone="info" />
        <StatCard title="Férias programadas" value={ferias.length} icon={CalendarDays} tone="neutral" />
      </div>
      <DataTable
        data={funcionarios.map((funcionario) => ({
          ...funcionario,
          ponto_count: ponto.filter((item) => item.funcionario_id === funcionario.id).length,
          beneficios_count: beneficios.filter((item) => item.funcionario_id === funcionario.id && item.ativo).length,
        })) as unknown as Record<string, unknown>[]}
        columns={[
          { key: "nome", label: "Funcionário", hrefBase: "/rh/funcionarios" },
          { key: "cargo", label: "Cargo" },
          { key: "setor", label: "Setor" },
          { key: "ponto_count", label: "Marcações" },
          { key: "beneficios_count", label: "Benefícios" },
          { key: "status", label: "Status", format: "status" },
        ]}
      />
    </>
  );
}
