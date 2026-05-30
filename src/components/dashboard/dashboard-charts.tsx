"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const colors = ["#0066b3", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#64748b"];

type ChartDatum = { name: string; value: number };

export function DashboardCharts({
  despesasPorCategoria,
  contasPorStatus,
  tarefasPorPrioridade,
  funcionariosPorStatus,
  contratosPorStatus,
}: {
  despesasPorCategoria: ChartDatum[];
  contasPorStatus: ChartDatum[];
  tarefasPorPrioridade: ChartDatum[];
  funcionariosPorStatus: ChartDatum[];
  contratosPorStatus: ChartDatum[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <ChartCard className="xl:col-span-2" title="Despesas por categoria">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={despesasPorCategoria}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0066b3" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Contas por status">
        <PieBlock data={contasPorStatus} />
      </ChartCard>
      <ChartCard title="Tarefas por prioridade">
        <PieBlock data={tarefasPorPrioridade} />
      </ChartCard>
      <ChartCard title="Equipe e contratos">
        <div className="space-y-5">
          <MiniBars title="Funcionários" data={funcionariosPorStatus} />
          <MiniBars title="Contratos" data={contratosPorStatus} />
        </div>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PieBlock({ data }: { data: ChartDatum[] }) {
  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
              {item.name}
            </span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBars({ title, data }: { title: string; data: ChartDatum[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="grid grid-cols-[90px_1fr_24px] items-center gap-2 text-xs">
            <span className="truncate">{item.name}</span>
            <span className="h-2 rounded-full bg-muted">
              <span
                className="block h-2 rounded-full"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  background: colors[index % colors.length],
                }}
              />
            </span>
            <span className="text-right font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
