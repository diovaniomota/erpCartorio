import type { LucideIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "text-slate-500",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-red-700",
  info: "text-blue-700",
};

const accentClass: Record<Tone, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-600",
  warning: "bg-amber-600",
  danger: "bg-red-600",
  info: "bg-blue-600",
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
    <section className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", accentClass[tone])} />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</p>
          <p className={cn("mt-1 text-xl font-semibold leading-none tracking-normal", toneClass[tone])}>
            {format === "currency" ? formatCurrency(value) : value}
          </p>
        </div>
      </div>
      {Icon ? <Icon className="h-4 w-4 shrink-0 text-slate-400" /> : null}
    </section>
  );
}
