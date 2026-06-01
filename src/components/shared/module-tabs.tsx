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
    <nav className="overflow-x-auto border-b border-slate-200">
      <div className="flex min-w-max gap-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center gap-2 border-b-2 border-transparent px-1 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950",
                tab.active && "border-slate-950 text-slate-950 hover:border-slate-950",
              )}
            >
              {Icon ? <Icon className={cn("h-4 w-4", tab.active ? "text-slate-950" : "text-slate-400")} /> : null}
              {tab.label}
              {typeof tab.count === "number" ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    tab.active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
