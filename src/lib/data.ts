import { unstable_noStore as noStore } from "next/cache";
import { getSessionContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TableMap, TableName } from "@/lib/types";

type QueryOptions = {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  includeDeleted?: boolean;
};

export async function listScopedRecords<T extends TableName>(
  table: T,
  options: QueryOptions = {},
): Promise<TableMap[T]> {
  noStore();

  const context = await getSessionContext();

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from(table)
    .select("*")
    .eq("cartorio_id", context.cartorioId);

  if (!options.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? false });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TableMap[T];
}

export async function getScopedRecord<T extends TableName>(
  table: T,
  id: string,
): Promise<TableMap[T][number] | null> {
  noStore();

  const context = await getSessionContext();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("cartorio_id", context.cartorioId)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as TableMap[T][number] | null;
}
