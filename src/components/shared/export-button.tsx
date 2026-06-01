"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportColumn } from "@/lib/export/csv";

type ExportButtonProps = {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
};

export function ExportButton({ data, columns, filename, title }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const baseName = `${filename}-${todayStr}`;

  async function handleCSV() {
    setLoading(true);
    try {
      const { downloadCSV } = await import("@/lib/export/csv");
      downloadCSV(data, columns, `${baseName}.csv`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePDF() {
    setLoading(true);
    try {
      const { downloadPDF } = await import("@/lib/export/pdf");
      await downloadPDF(data, columns, `${baseName}.pdf`, title ?? filename);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} aria-label="Exportar dados">
          <Download className="h-4 w-4" aria-hidden="true" />
          {loading ? "Gerando…" : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSV} aria-label="Exportar como CSV">
          Planilha (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDF} aria-label="Exportar como PDF">
          PDF (.pdf)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
