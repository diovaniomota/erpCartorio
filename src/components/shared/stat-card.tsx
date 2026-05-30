import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-blue-50 text-[#0066b3] ring-blue-100",
  warning: "bg-amber-50 text-amber-700 ring-amber-100",
  danger: "bg-red-50 text-red-700 ring-red-100",
  info: "bg-sky-50 text-sky-700 ring-sky-100",
};

const accentClass: Record<Tone, string> = {
  neutral: "bg-slate-400",
  success: "bg-[#0066b3]",
  warning: "bg-amber-500",
  danger: "bg-red-600",
  info: "bg-sky-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "neutral",
  format,
}: {
  title: string;
  value: number;
  icon?: LucideIcon;
  tone?: Tone;
  format?: "currency";
}) {
  return (
    <Card className="group relative overflow-hidden border-slate-200 bg-white/95 shadow-panel transition-transform duration-200 hover:-translate-y-0.5">
      <span className={cn("absolute inset-x-0 top-0 h-1", accentClass[tone])} />
      <CardContent className="flex min-h-28 items-center justify-between gap-4 p-4 pt-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            {format === "currency" ? formatCurrency(value) : value}
          </p>
        </div>
        {Icon ? (
          <div className={cn("rounded-lg p-2 ring-1 transition-transform duration-200 group-hover:scale-105", toneClass[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
