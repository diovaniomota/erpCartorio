import { listScopedRecords, getScopedRecord } from "@/lib/data";

export const getDocumentosInternos = (opts?: { includeDeleted?: boolean }) =>
  listScopedRecords("documentos_internos", { orderBy: "created_at", ascending: false, ...opts });
export const getDocumentoInterno = (id: string) => getScopedRecord("documentos_internos", id);
