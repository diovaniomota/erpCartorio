"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
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

const BRAND = {
  bg:        "#0f2d1e",
  bgHover:   "#1B4332",
  bgActive:  "#f5f5f0",
  border:    "#1d3d2a",
  gold:      "#D4A427",
  goldDim:   "#C59B28",
  textMuted: "#6b8f7a",
  textDim:   "#4a7a5e",
};

const navSections = [
  { label: "Principal",               items: navItems.slice(0, 3) },
  { label: "Operação administrativa", items: navItems.slice(3, 12) },
  { label: "Controle e governança",   items: navItems.slice(12) },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="lg:hidden" variant="ghost" size="icon" title="Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[86vw] max-w-sm overflow-y-auto p-0"
        style={{ background: BRAND.bg, color: "#e5e7eb" }}
      >
        <SheetHeader
          className="border-b px-5 py-5"
          style={{ borderColor: BRAND.border, background: BRAND.bg }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ background: "#1B4332" }}>
              <Image src="/images/logo-cartorio-brasil.svg" alt="Cartório Brasil" width={40} height={40} />
            </div>
            <div>
              <SheetTitle className="text-[15px] font-bold text-white">
                Cartório<span style={{ color: BRAND.gold }}>Brasil</span>
              </SheetTitle>
              <SheetDescription className="text-[11px]" style={{ color: BRAND.textMuted }}>
                Administração cartorial
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <nav className="space-y-4 p-3 pb-8">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <p
                className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.2em]"
                style={{ color: BRAND.textDim }}
              >
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = isItemActive(item, pathname);
                const Icon   = item.icon;
                return (
                  <div key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                      style={
                        active
                          ? { background: BRAND.bgActive, color: "#1a2e24" }
                          : { color: "#94a3b8" }
                      }
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-2 h-6 w-1 rounded-r"
                          style={{ background: BRAND.gold }}
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" style={{ color: active ? BRAND.goldDim : BRAND.textMuted }} />
                      {item.label}
                    </a>

                    {active && item.children?.length ? (
                      <div className="ml-7 mt-1 space-y-0.5 border-l pl-3" style={{ borderColor: BRAND.border }}>
                        {item.children.map((child) => {
                          const childActive = isChildActive(child.href, pathname, searchParams);
                          return (
                            <a
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className="block rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                              style={{
                                color:      childActive ? "#f5d87a" : BRAND.textMuted,
                                background: childActive ? BRAND.gold + "22" : undefined,
                              }}
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
