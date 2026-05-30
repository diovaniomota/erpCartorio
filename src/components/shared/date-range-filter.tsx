"use client";

import { Input } from "@/components/ui/input";

export function DateRangeFilter() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Input type="date" aria-label="Data inicial" />
      <Input type="date" aria-label="Data final" />
    </div>
  );
}
