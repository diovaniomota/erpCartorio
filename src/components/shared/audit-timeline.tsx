import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { AuditoriaLog } from "@/lib/types";

export function AuditTimeline({ logs }: { logs: AuditoriaLog[] }) {
  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="relative flex gap-3 before:absolute before:inset-y-0 before:left-4 before:-ml-px before:w-0.5 before:bg-slate-100 last:before:hidden">
          <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 ring-1 ring-blue-100/50">
            <Clock className="h-4 w-4 text-[#0066b3]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {log.acao} em {log.modulo}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(log.created_at)} · {log.tabela} · {log.usuario_nome ?? "usuário"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
