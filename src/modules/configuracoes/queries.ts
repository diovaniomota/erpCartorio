import { listScopedRecords } from "@/lib/data";

export const getConfiguracoes = () => listScopedRecords("configuracoes", { orderBy: "chave", ascending: true });
