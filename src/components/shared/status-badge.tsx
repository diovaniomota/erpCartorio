import { Badge } from "@/components/ui/badge";

const labelMap: Record<string, string> = {
  // ponto
  entrada:        "Entrada",
  saida:          "Saída Final",
  saida_almoco:   "Saída Almoço",
  retorno_almoco: "Retorno Almoço",
  // tarefas / geral
  em_andamento:       "Em andamento",
  aguardando_terceiro:"Aguardando terceiro",
  em_revisao:         "Em revisão",
  // misc
  a_fazer: "A fazer",
};

export function StatusBadge({ status }: { status?: string | null }) {
  const raw        = status ?? "sem status";
  const value      = labelMap[raw] ?? raw;
  const normalized = raw.toLowerCase();
  const variant =
    ["ativo", "vigente", "paga", "concluída", "concluído", "aprovado"].includes(normalized)
      ? "success"
      : ["vencida", "vencido", "atrasada", "crítica", "reprovado"].includes(normalized)
        ? "destructive"
        : ["agendada", "a vencer", "em análise", "pendente", "em andamento"].includes(normalized)
          ? "warning"
          : "secondary";

  return <Badge variant={variant} className="capitalize">{value}</Badge>;
}
