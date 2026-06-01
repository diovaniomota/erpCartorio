"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { flattenNavItems } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

const entries = flattenNavItems();

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return entries.slice(0, 6);
    }

    return entries
      .filter((entry) => {
        const haystack = `${entry.group} ${entry.label} ${entry.href}`.toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 8);
  }, [query]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = results[0]?.href;
    if (destination) {
      setFocused(false);
      router.push(destination);
    }
  }

  return (
    <form className="relative hidden w-full max-w-md md:block" onSubmit={onSubmit}>
      <div className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" />
        <Input
          className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0"
          placeholder="Buscar telas, módulos e relatórios"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        />
      </div>
      {focused ? (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg shadow-slate-200">
          {results.length ? (
            results.map((entry) => (
              <Link
                key={`${entry.group}-${entry.href}-${entry.label}`}
                href={entry.href}
                prefetch={false}
                className={cn(
                  "flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-sm transition-colors duration-150 last:border-b-0 hover:bg-slate-50",
                  query && "text-slate-950",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{entry.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{entry.group}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-muted-foreground">Nenhuma tela encontrada.</div>
          )}
        </div>
      ) : null}
    </form>
  );
}
