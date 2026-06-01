import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Cartorio, UserProfile } from "@/lib/types";

export type SessionContext = {
  cartorioId: string;
  userId: string;
  profile: UserProfile;
  cartorio: Cartorio;
  permissions: string[];
};

export const getCurrentUserProfile = cache(async function getCurrentUserProfile(): Promise<UserProfile> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
    .maybeSingle();

  if (error || !data) {
    redirect("/login");
  }

  return data as UserProfile;
});

export const getCurrentCartorio = cache(async function getCurrentCartorio(): Promise<Cartorio> {
  const profile = await getCurrentUserProfile();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cartorios")
    .select("*")
    .eq("id", profile.cartorio_id)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Cartório não encontrado para o usuário atual.");
  }

  return data as Cartorio;
});

export const getCurrentPermissions = cache(async function getCurrentPermissions(): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("user_permission_keys");

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data as string[];
});

export const getSessionContext = cache(async function getSessionContext(): Promise<SessionContext> {
  const profile = await getCurrentUserProfile();
  const [cartorio, permissions] = await Promise.all([getCurrentCartorio(), getCurrentPermissions()]);

  return {
    cartorioId: profile.cartorio_id,
    userId: profile.id,
    profile,
    cartorio,
    permissions,
  };
});

export async function requirePermission(permission: string) {
  const context = await getSessionContext();

  if (!context.permissions.includes(permission)) {
    throw new Error(`Permissão necessária: ${permission}`);
  }

  return context;
}
