import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { ModuleTabs } from "@/components/shared/module-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { OfficialFeed } from "@/components/shared/record-views";
import { createOfficialUpdate, deleteOfficialUpdate } from "@/modules/central-oficial/actions";
import { getOfficialSources, getOfficialUpdates } from "@/modules/central-oficial/queries";
import { Bell, FileText, Newspaper, RadioTower } from "lucide-react";

type CentralOficialScreenProps = {
  tipoFiltro?: string;
  title?: string;
  description?: string;
};

export async function CentralOficialScreen({ tipoFiltro, title, description }: CentralOficialScreenProps) {
  const [updates, sources] = await Promise.all([getOfficialUpdates(), getOfficialSources()]);
  const updatesFiltrados = tipoFiltro ? updates.filter((item) => item.tipo === tipoFiltro) : updates;
  const fields: EntityField[] = [
    { name: "titulo", label: "Título", required: true },
    { name: "source_id", label: "Fonte", type: "select", options: sources.map((item) => ({ label: item.nome, value: item.id })) },
    { name: "orgao", label: "Órgão", required: true },
    { name: "tipo", label: "Tipo", type: "select", defaultValue: tipoFiltro ?? "comunicado", options: ["notícia", "comunicado", "provimento", "publicação oficial", "alerta", "norma", "portaria"].map((value) => ({ label: value, value })) },
    { name: "relevancia", label: "Relevância", type: "select", defaultValue: "média", options: ["baixa", "média", "alta", "crítica"].map((value) => ({ label: value, value })) },
    { name: "status", label: "Status", type: "select", defaultValue: "nova", options: ["nova", "lida", "em análise", "gerou tarefa", "arquivada"].map((value) => ({ label: value, value })) },
    { name: "publicado_em", label: "Publicado em", type: "date" },
    { name: "url_original", label: "URL original" },
    { name: "anexo_url", label: "URL do PDF" },
    { name: "importante", label: "Importante", type: "checkbox" },
    { name: "resumo", label: "Resumo", type: "textarea" },
    { name: "conteudo", label: "Conteúdo", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title={title ?? "Central Oficial"}
        description={
          description ??
          "Cadastro manual de notícias, comunicados, provimentos e alertas oficiais por fonte, órgão, relevância e status."
        }
        actions={<EntityFormDialog title="Nova publicação oficial" fields={fields} action={createOfficialUpdate} />}
      />
      <ModuleTabs
        tabs={[
          { label: "Todas", href: "/central-oficial", active: !tipoFiltro, count: updates.length, icon: Bell },
          { label: "Notícias", href: "/central-oficial/noticias", active: tipoFiltro === "notícia", count: updates.filter((item) => item.tipo === "notícia").length, icon: Newspaper },
          { label: "Comunicados", href: "/central-oficial/comunicados", active: tipoFiltro === "comunicado", count: updates.filter((item) => item.tipo === "comunicado").length, icon: RadioTower },
          { label: "Provimentos", href: "/central-oficial/provimentos", active: tipoFiltro === "provimento", count: updates.filter((item) => item.tipo === "provimento").length, icon: FileText },
        ]}
      />
      <OfficialFeed updates={updatesFiltrados} deleteAction={deleteOfficialUpdate} />
    </>
  );
}
