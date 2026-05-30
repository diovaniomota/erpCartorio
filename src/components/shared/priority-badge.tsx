import { Badge } from "@/components/ui/badge";

export function PriorityBadge({ priority }: { priority?: string | null }) {
  const value = priority ?? "média";
  const normalized = value.toLowerCase();
  const variant =
    normalized === "urgente"
      ? "destructive"
      : normalized === "alta"
        ? "warning"
        : normalized === "média"
          ? "info"
          : "secondary";

  return <Badge variant={variant}>{value}</Badge>;
}
