import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentLibrary } from "@/components/shared/record-views";
import { createDocumentoInterno, deleteDocumentoInterno, restoreDocumentoInterno } from "@/modules/documentos/actions";
import { getDocumentosInternos } from "@/modules/documentos/queries";

const fields: EntityField[] = [
  { name: "titulo", label: "Título", required: true },
  { name: "categoria", label: "Categoria", type: "select", defaultValue: "outros", options: ["contratos", "políticas internas", "manuais", "comprovantes", "documentos de funcionários", "documentos de fornecedores", "documentos LGPD", "documentos financeiros", "atas de reunião", "treinamentos", "outros"].map((value) => ({ label: value, value })) },
  { name: "pasta", label: "Pasta" },
  { name: "arquivo_url", label: "URL do arquivo" },
  { name: "validade_em", label: "Validade", type: "date" },
  { name: "status", label: "Status", type: "select", defaultValue: "ativo", options: ["ativo", "vencido", "arquivado"].map((value) => ({ label: value, value })) },
  { name: "acesso", label: "Acesso", type: "select", defaultValue: "restrito", options: ["todos", "restrito", "gestores"].map((value) => ({ label: value, value })) },
  { name: "vinculo_tipo", label: "Vínculo tipo" },
  { name: "vinculo_id", label: "Vínculo ID" },
];

export default async function DocumentosPage() {
  const docs = await getDocumentosInternos({ includeDeleted: true });

  return (
    <>
      <PageHeader
        title="Documentos internos"
        description="Documentos administrativos com categoria, validade, controle de acesso, vínculo e arquivo."
        actions={<EntityFormDialog title="Novo documento" fields={fields} action={createDocumentoInterno} />}
      />
      <DocumentLibrary docs={docs} deleteAction={deleteDocumentoInterno} restoreAction={restoreDocumentoInterno} />
    </>
  );
}
