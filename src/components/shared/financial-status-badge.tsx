import { StatusBadge } from "@/components/shared/status-badge";

export function FinancialStatusBadge({ status }: { status?: string | null }) {
  return <StatusBadge status={status} />;
}
