import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status?: string | null }) {
  const value = status ?? "sem status";
  const normalized = value.toLowerCase();
  const variant =
    ["ativo", "vigente", "paga", "concluída", "concluído", "aprovado"].includes(normalized)
      ? "success"
      : ["vencida", "vencido", "atrasada", "crítica", "reprovado"].includes(normalized)
        ? "destructive"
        : ["agendada", "a vencer", "em análise", "pendente", "em andamento"].includes(normalized)
          ? "warning"
          : "secondary";

  return <Badge variant={variant}>{value}</Badge>;
}
