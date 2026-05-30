import {
  AlertTriangle,
  Banknote,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  Landmark,
  PackageSearch,
  Receipt,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getDashboardData } from "@/modules/dashboard/queries";
import { formatDate } from "@/lib/utils";

const icons = [
  CalendarClock,
  FileWarning,
  Receipt,
  Banknote,
  TrendingDown,
  TrendingUp,
  BriefcaseBusiness,
  Users,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  ClipboardList,
  BellRing,
  ShieldAlert,
  PackageSearch,
];

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard administrativo"
        description="Visão operacional do cartório, com financeiro, RH, contratos, tarefas, comunicados oficiais e compliance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {data.stats.map((stat, index) => (
          <StatCard key={stat.title} icon={icons[index] ?? Landmark} {...stat} />
        ))}
      </div>
      <DashboardCharts {...data.charts} />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Comunicados importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.comunicadosImportantes.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium">{item.titulo}</p>
                  <Badge variant={item.relevancia === "crítica" ? "destructive" : "warning"}>{item.relevancia}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.resumo}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tarefas atrasadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tarefasAtrasadas.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{task.titulo}</p>
                  <p className="text-xs text-muted-foreground">Prazo {formatDate(task.data_prazo)}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Agenda próxima</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.agenda.slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-md border p-3">
                <p className="truncate text-sm font-medium">{event.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(event.data_inicio)} · {event.tipo}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
