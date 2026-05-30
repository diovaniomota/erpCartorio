import { CentralOficialScreen } from "@/modules/central-oficial/components/central-oficial-screen";

export default function ProvimentosOficiaisPage() {
  return (
    <CentralOficialScreen
      tipoFiltro="provimento"
      title="Provimentos"
      description="Provimentos e normas acompanhados pela administração para gerar tarefas, eventos e comentários internos."
    />
  );
}
