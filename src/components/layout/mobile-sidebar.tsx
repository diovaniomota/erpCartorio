"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Menu, Scale } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { isChildActive, isItemActive, navItems } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

const navSections = [
  { label: "Principal", items: navItems.slice(0, 3) },
  { label: "Operação administrativa", items: navItems.slice(3, 12) },
  { label: "Controle e governança", items: navItems.slice(12) },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="lg:hidden" variant="ghost" size="icon" title="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto bg-[#111820] p-0 text-slate-100">
        <SheetHeader className="border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-[#b89343] p-2 text-[#111820]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base text-white">CartórioHub</SheetTitle>
              <SheetDescription className="text-xs text-slate-400">Administração cartorial</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <nav className="space-y-5 p-3">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = isItemActive(item, pathname);
                const Icon = item.icon;
                return (
                  <div key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white",
                        active && "bg-slate-50 text-[#111820] hover:bg-slate-50 hover:text-[#111820]",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-[#8a6422]" : "text-slate-500")} />
                      {item.label}
                    </a>
                    {active && item.children?.length ? (
                      <div className="ml-7 mt-1.5 space-y-1 border-l border-slate-700 pl-3">
                        {item.children.map((child) => {
                          const childActive = isChildActive(child.href, pathname, searchParams);
                          return (
                            <a
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "block rounded-md px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-800 hover:text-white",
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
      </SheetContent>
    </Sheet>
  );
}
