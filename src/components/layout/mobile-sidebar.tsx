"use client";

import Link from "next/link";
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
      <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto bg-[#0e1d42] p-0 text-slate-100">
        <SheetHeader className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#c8a850] p-2 text-[#0e1d42]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base text-white">CartórioHub</SheetTitle>
              <SheetDescription className="text-xs text-slate-300">ERP administrativo</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const active = isItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.08] hover:text-white",
                    active && "bg-white/10 text-white",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "text-[#c8a850]" : "text-slate-400")} />
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
                          onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
