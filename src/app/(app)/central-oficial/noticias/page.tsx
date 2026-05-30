import { CentralOficialScreen } from "@/modules/central-oficial/components/central-oficial-screen";

export default function NoticiasOficiaisPage() {
  return (
    <CentralOficialScreen
      tipoFiltro="notícia"
      title="Notícias oficiais"
      description="Notícias cadastradas manualmente por fonte oficial, órgão, relevância e status de leitura."
    />
  );
}
