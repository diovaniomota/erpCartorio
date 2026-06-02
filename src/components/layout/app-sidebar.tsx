"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { isChildActive, isItemActive, navItems } from "@/components/layout/navigation";

/* ── Brand tokens (keep in sync with globals.css) ── */
const BRAND = {
  bg:        "#0f2d1e",   // sidebar bg — slightly darker than logo green
  bgHover:   "#1B4332",   // hover bg
  bgActive:  "#f5f5f0",   // active item bg (light)
  border:    "#1d3d2a",   // border-r
  gold:      "#D4A427",   // accent / active indicator
  goldDim:   "#C59B28",   // icon on active
  textMuted: "#6b8f7a",   // muted nav text
  textDim:   "#4a7a5e",   // section labels
  strip:     "#172e20",   // env strip bg
};

const navSections = [
  { label: "Principal",               items: navItems.slice(0, 3) },
  { label: "Operação administrativa", items: navItems.slice(3, 12) },
  { label: "Controle e governança",   items: navItems.slice(12) },
];

export function AppSidebar() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[272px] overflow-y-auto border-r lg:block"
      style={{ background: BRAND.bg, borderColor: BRAND.border }}
    >
      {/* ── Logo header ── */}
      <div
        className="sticky top-0 z-10 border-b px-5 py-5"
        style={{ background: BRAND.bg, borderColor: BRAND.border }}
      >
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg ring-1"
            style={{ background: "#1B4332" }}
          >
            <Image
              src="/images/logo-cartorio-brasil.svg"
              alt="Cartório Brasil"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>
          {/* Brand name */}
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-tight text-white">
              Cartório<span style={{ color: BRAND.gold }}>Brasil</span>
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: BRAND.textMuted }}>
              Administração cartorial
            </p>
          </div>
        </div>

        {/* Environment strip */}
        <div
          className="mt-4 rounded-lg border-l-2 px-3 py-2"
          style={{
            background: BRAND.strip,
            borderColor: BRAND.gold,
          }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: BRAND.textMuted }}>
            Ambiente
          </p>
          <p className="mt-0.5 text-[13px] font-semibold text-slate-100">Operação interna</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="space-y-5 p-3 pb-8">
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
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "text-slate-900"
                        : "text-slate-400 hover:text-slate-100",
                    )}
                    style={
                      active
                        ? {
                            background: BRAND.bgActive,
                            color: "#1a2e24",
                          }
                        : undefined
                    }
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLAnchorElement).style.background = BRAND.bgHover + "60";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "";
                    }}
                  >
                    {/* Active gold indicator */}
                    {active && (
                      <span
                        className="absolute left-0 top-2 h-6 w-1 rounded-r"
                        style={{ background: BRAND.gold }}
                      />
                    )}
                    <Icon
                      className="h-4 w-4 shrink-0 transition-colors"
                      style={{ color: active ? BRAND.goldDim : BRAND.textMuted }}
                    />
                    <span className="truncate">{item.label}</span>
                  </a>

                  {/* Children */}
                  {active && item.children?.length ? (
                    <div
                      className="ml-7 mt-1 space-y-0.5 border-l pl-3"
                      style={{ borderColor: BRAND.border }}
                    >
                      {item.children.map((child) => {
                        const childActive = isChildActive(child.href, pathname, searchParams);
                        return (
                          <a
                            key={child.href}
                            href={child.href}
                            className="block rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{
                              color: childActive ? "#f5d87a" : BRAND.textMuted,
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

      {/* ── Footer brand strip ── */}
      <div
        className="absolute bottom-0 left-0 right-0 border-t px-5 py-3"
        style={{ background: BRAND.strip, borderColor: BRAND.border }}
      >
        <p className="text-center text-[9px] font-semibold uppercase tracking-widest" style={{ color: BRAND.textDim }}>
          CartórioBrasil · Sistema de gestão
        </p>
      </div>
    </aside>
  );
}
