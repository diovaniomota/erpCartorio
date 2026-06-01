import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SupplierDirectory } from "@/components/shared/record-views";
import { createFornecedor, deleteFornecedor, restoreFornecedor } from "@/modules/fornecedores/actions";
import { getFornecedores } from "@/modules/fornecedores/queries";

const fields: EntityField[] = [
  { name: "nome", label: "Nome", required: true },
  { name: "categoria", label: "Categoria", required: true },
  { name: "documento", label: "CPF/CNPJ", type: "cpf-cnpj" },
  { name: "telefone", label: "Telefone" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "contato_responsavel", label: "Contato responsável" },
  { name: "endereco", label: "Endereço", type: "textarea" },
  { name: "dados_bancarios", label: "Dados bancários", type: "textarea" },
  { name: "observacoes", label: "Observações", type: "textarea" },
  { name: "status", label: "Status", type: "select", defaultValue: "ativo", options: [{ label: "Ativo", value: "ativo" }, { label: "Inativo", value: "inativo" }] },
];

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedores({ includeDeleted: true });

  return (
    <>
      <PageHeader
        title="Fornecedores"
        description="Cadastro administrativo de fornecedores, contatos, dados bancários e vínculos com contratos e contas."
        actions={<EntityFormDialog title="Novo fornecedor" fields={fields} action={createFornecedor} />}
      />
      <SupplierDirectory fornecedores={fornecedores} deleteAction={deleteFornecedor} restoreAction={restoreFornecedor} />
    </>
  );
}
