import { Clock3, FileCheck2, UserCheck } from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createPonto, deletePonto } from "@/modules/rh/actions";
import { getFuncionarios, getPonto } from "@/modules/rh/queries";

export default async function PontoPage() {
  const [ponto, funcionarios] = await Promise.all([getPonto(), getFuncionarios()]);
  const hoje = new Date().toISOString().slice(0, 10);
  const marcacoesHoje = ponto.filter((item) => item.registrado_em.startsWith(hoje));
  const ajustesPendentes = ponto.filter((item) => item.ajuste_manual && !item.aprovado_em);
  const funcionariosComPonto = new Set(marcacoesHoje.map((item) => item.funcionario_id)).size;

  const fields: EntityField[] = [
    {
      name: "funcionario_id",
      label: "Funcionário",
      type: "select",
      required: true,
      options: funcionarios.map((item) => ({ label: item.nome, value: item.id })),
    },
    {
      name: "tipo",
      label: "Marcação",
      type: "select",
      defaultValue: "entrada",
      options: [
        { label: "Entrada", value: "entrada" },
        { label: "Saída almoço", value: "saida_almoco" },
        { label: "Retorno almoço", value: "retorno_almoco" },
        { label: "Saída final", value: "saida" },
      ],
    },
    { name: "registrado_em", label: "Data e hora", type: "datetime-local", required: true },
    { name: "ajuste_manual", label: "Ajuste manual", type: "checkbox" },
    { name: "justificativa_ajuste", label: "Justificativa do ajuste", type: "textarea" },
    { name: "observacao", label: "Observação", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title="Controle de ponto"
        description="Marcações de entrada, almoço, retorno, saída final, ajustes manuais e aprovação administrativa."
        actions={<EntityFormDialog title="Nova marcação" fields={fields} action={createPonto} />}
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Marcações hoje" value={marcacoesHoje.length} icon={Clock3} tone="info" />
        <StatCard title="Funcionários com ponto" value={funcionariosComPonto} icon={UserCheck} tone="success" />
        <StatCard title="Ajustes pendentes" value={ajustesPendentes.length} icon={FileCheck2} tone="warning" />
      </div>
      <DataTable
        data={ponto as unknown as Record<string, unknown>[]}
        columns={[
          { key: "funcionario_nome", label: "Funcionário" },
          { key: "tipo", label: "Tipo", format: "status" },
          { key: "registrado_em", label: "Data", format: "date" },
          { key: "ajuste_manual", label: "Ajuste", format: "boolean" },
          { key: "justificativa_ajuste", label: "Justificativa" },
          { key: "observacao", label: "Observação" },
        ]}
        deleteAction={deletePonto}
      />
    </>
  );
}
