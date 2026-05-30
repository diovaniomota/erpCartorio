import { CentralOficialScreen } from "@/modules/central-oficial/components/central-oficial-screen";

export default function ComunicadosOficiaisPage() {
  return (
    <CentralOficialScreen
      tipoFiltro="comunicado"
      title="Comunicados oficiais"
      description="Comunicados administrativos e publicações relevantes para acompanhamento interno da serventia."
    />
  );
}
