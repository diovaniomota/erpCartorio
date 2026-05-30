import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StaffDirectory } from "@/components/shared/record-views";
import { createFuncionario, deleteFuncionario } from "@/modules/rh/actions";
import { getFuncionarios } from "@/modules/rh/queries";

const fields: EntityField[] = [
  { name: "nome", label: "Nome", required: true },
  { name: "cpf", label: "CPF" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "telefone", label: "Telefone" },
  { name: "cargo", label: "Cargo", required: true },
  { name: "setor", label: "Setor", required: true },
  { name: "data_admissao", label: "Admissão", type: "date", required: true },
  { name: "tipo_contrato", label: "Tipo de contrato", required: true, defaultValue: "CLT" },
  { name: "salario", label: "Salário", type: "money" },
  { name: "status", label: "Status", type: "select", defaultValue: "ativo", options: ["ativo", "afastado", "férias", "desligado", "licença"].map((value) => ({ label: value, value })) },
  { name: "observacoes", label: "Observações", type: "textarea" },
];

export default async function FuncionariosPage() {
  const funcionarios = await getFuncionarios();

  return (
    <>
      <PageHeader
        title="Funcionários"
        description="Cadastro funcional com dados contratuais e status administrativo."
        actions={<EntityFormDialog title="Novo funcionário" fields={fields} action={createFuncionario} />}
      />
      <StaffDirectory funcionarios={funcionarios} deleteAction={deleteFuncionario} />
    </>
  );
}
