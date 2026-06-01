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

// Single-client, 2 round trips: getUser → (profiles+cartorios join || permissions)
export const getSessionContext = cache(async function getSessionContext(): Promise<SessionContext> {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, permissionsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, cartorios(*)")
      .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
      .maybeSingle(),
    supabase.rpc("user_permission_keys"),
  ]);

  if (profileResult.error || !profileResult.data) redirect("/login");

  const { cartorios, ...profileData } = profileResult.data as UserProfile & { cartorios: Cartorio };

  if (!cartorios) throw new Error("Cartório não encontrado.");

  return {
    cartorioId: profileData.cartorio_id,
    userId: profileData.id,
    profile: profileData,
    cartorio: cartorios,
    permissions: Array.isArray(permissionsResult.data) ? permissionsResult.data : [],
  };
});

export const getCurrentUserProfile = cache(async function getCurrentUserProfile(): Promise<UserProfile> {
  return (await getSessionContext()).profile;
});

export const getCurrentCartorio = cache(async function getCurrentCartorio(): Promise<Cartorio> {
  return (await getSessionContext()).cartorio;
});

export const getCurrentPermissions = cache(async function getCurrentPermissions(): Promise<string[]> {
  return (await getSessionContext()).permissions;
});

export async function requirePermission(permission: string) {
  const context = await getSessionContext();
  if (!context.permissions.includes(permission)) {
    throw new Error(`Permissão necessária: ${permission}`);
  }
  return context;
}
