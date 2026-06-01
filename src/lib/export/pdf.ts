import { formatCurrency, formatDate } from "@/lib/utils";
import type { ExportColumn } from "./csv";

function formatValue(value: unknown, format?: ExportColumn["format"]): string {
  if (value === null || value === undefined) return "";
  if (format === "date") return formatDate(String(value));
  if (format === "currency") return formatCurrency(Number(value));
  if (format === "boolean") return value ? "Sim" : "Não";
  return String(value);
}

export async function downloadPDF(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
  title: string,
): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" });
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Gerado em: ${today}  ·  ${data.length} registro${data.length !== 1 ? "s" : ""}`, 14, 23);
  doc.setTextColor(0);

  autoTable(doc, {
    head: [columns.map((col) => col.label)],
    body: data.map((row) => columns.map((col) => formatValue(row[col.key], col.format))),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: ({ pageNumber }) => {
      const totalPages = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Página ${pageNumber} de ${totalPages}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 8,
        { align: "right" },
      );
      doc.setTextColor(0);
    },
  });

  doc.save(filename);
}
