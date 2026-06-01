import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const STORAGE_BUCKETS = {
  documentos: "documentos-internos",
  financeiro: "financeiro-anexos",
  rh: "rh-documentos",
  tarefas: "task-attachments",
} as const;

export async function uploadPrivateFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
  file: File,
) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(path, file, { upsert: false });

  if (error) {
    throw error;
  }

  return { path: data.path, url: null };
}
