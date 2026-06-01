"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { isChildActive, isItemActive, navItems } from "@/components/layout/navigation";

const navSections = [
  { label: "Principal", items: navItems.slice(0, 3) },
  { label: "Operação administrativa", items: navItems.slice(3, 12) },
  { label: "Controle e governança", items: navItems.slice(12) },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] overflow-y-auto border-r border-slate-800 bg-[#111820] text-slate-100 lg:block">
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-[#111820] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-[#b89343] p-2.5 text-[#111820]">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold leading-none">CartórioHub</p>
            <p className="mt-1 text-xs text-slate-400">Administração cartorial</p>
          </div>
        </div>
        <div className="mt-5 border-l-2 border-[#b89343] bg-slate-900/60 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Ambiente</p>
          <p className="mt-1 text-sm font-medium text-slate-100">Operação interna</p>
        </div>
      </div>
      <nav className="space-y-5 p-3 pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1.5">
            <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isItemActive(item, pathname);
              const Icon = item.icon;
              return (
                <div key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-50",
                      active && "bg-slate-50 text-[#111820] hover:bg-slate-50 hover:text-[#111820] before:absolute before:left-0 before:top-2 before:h-6 before:w-1 before:rounded-r before:bg-[#b89343]",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 transition-colors", active ? "text-[#8a6422]" : "text-slate-500")} />
                    <span className="truncate">{item.label}</span>
                  </a>
                  {active && item.children?.length ? (
                    <div className="ml-7 mt-1.5 space-y-1 border-l border-slate-700 pl-3">
                      {item.children.map((child) => {
                        const childActive = isChildActive(child.href, pathname, searchParams);
                        return (
                          <a
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-100",
                              childActive && "bg-[#b89343]/15 text-[#f5d58b]",
                            )}
                          >
                            {child.label}
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
