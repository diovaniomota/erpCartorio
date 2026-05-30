import { unstable_noStore as noStore } from "next/cache";
import { hasSupabaseConfig } from "@/lib/env";
import { getSessionContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDemoTable } from "@/lib/demo-data";
import type { DemoTableMap, DemoTableName } from "@/lib/types";

type QueryOptions = {
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  includeDeleted?: boolean;
};

export async function listScopedRecords<T extends DemoTableName>(
  table: T,
  options: QueryOptions = {},
): Promise<DemoTableMap[T]> {
  noStore();

  const context = await getSessionContext();

  if (!hasSupabaseConfig() || context.isDemo) {
    const rows = getDemoTable(table);
    return rows.filter((row) => {
      if (!("deleted_at" in row)) return true;
      return options.includeDeleted || !row.deleted_at;
    }) as DemoTableMap[T];
  }

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

  return (data ?? []) as DemoTableMap[T];
}

export async function getScopedRecord<T extends DemoTableName>(
  table: T,
  id: string,
): Promise<DemoTableMap[T][number] | null> {
  noStore();

  const context = await getSessionContext();

  if (!hasSupabaseConfig() || context.isDemo) {
    return (getDemoTable(table) as DemoTableMap[T]).find((row) => row.id === id) ?? null;
  }

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

  return data as DemoTableMap[T][number] | null;
}
