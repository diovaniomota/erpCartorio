import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ModuleTab = {
  label: string;
  href: string;
  active?: boolean;
  count?: number;
  icon?: LucideIcon;
};

export function ModuleTabs({ tabs }: { tabs: ModuleTab[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white/90 p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                tab.active && "bg-[#0e1d42] text-white shadow-sm hover:bg-[#0e1d42] hover:text-white",
              )}
            >
              {Icon ? <Icon className={cn("h-4 w-4", tab.active ? "text-[#c8a850]" : "text-slate-400")} /> : null}
              {tab.label}
              {typeof tab.count === "number" ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    tab.active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
