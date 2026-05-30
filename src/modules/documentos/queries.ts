import { listScopedRecords, getScopedRecord } from "@/lib/data";

export const getDocumentosInternos = () => listScopedRecords("documentos_internos", { orderBy: "created_at", ascending: false });
export const getDocumentoInterno = (id: string) => getScopedRecord("documentos_internos", id);
