"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { isChildActive, isItemActive, navItems } from "@/components/layout/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-[#0e1d42] bg-[#0e1d42] text-slate-100 shadow-2xl shadow-slate-950/20 lg:block">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0e1d42]/96 px-5 py-5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#c8a850] p-2 text-[#0e1d42] shadow-sm ring-1 ring-white/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold leading-none">CartórioHub</p>
            <p className="mt-1 text-xs text-slate-300">ERP administrativo</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 shadow-inner">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Operação</p>
          <p className="mt-1 text-sm font-medium text-slate-100">Gestão interna</p>
        </div>
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const active = isItemActive(item, pathname);
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.08] hover:text-white",
                  active && "bg-white/10 text-white shadow-inner shadow-white/5 before:absolute before:left-0 before:top-2 before:h-5 before:w-1 before:rounded-full before:bg-[#c8a850]",
                )}
              >
                <Icon className={cn("h-4 w-4 transition-colors", active ? "text-[#c8a850]" : "text-slate-400")} />
                {item.label}
              </Link>
              {item.children && active ? (
                <div className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {item.children.map((child) => {
                    const childActive = isChildActive(child.href, pathname, searchParams);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-xs text-slate-400 transition-all duration-150 hover:bg-white/[0.08] hover:text-slate-100",
                          childActive && "bg-white/10 text-slate-100",
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
