import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_CARTORIO_ID, DEMO_USER_ID, demoData } from "@/lib/demo-data";
import type { Cartorio, UserProfile } from "@/lib/types";

const DEMO_COOKIE = "cartoriohub_demo_session";

export type SessionContext = {
  cartorioId: string;
  userId: string;
  profile: UserProfile;
  cartorio: Cartorio;
  permissions: string[];
  isDemo: boolean;
};

export async function getCurrentUserProfile(): Promise<UserProfile> {
  if (!hasSupabaseConfig() || (await hasDemoSession())) {
    return demoData.profiles[0];
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    redirect("/login");
  }

  return data as UserProfile;
}

export async function getCurrentCartorio(): Promise<Cartorio> {
  const profile = await getCurrentUserProfile();

  if (!hasSupabaseConfig() || (await hasDemoSession())) {
    return demoData.cartorios[0];
  }

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
}

export async function getCurrentPermissions(): Promise<string[]> {
  if (!hasSupabaseConfig() || (await hasDemoSession())) {
    return demoData.permissoes.map((permission) => permission.chave);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("user_permission_keys");

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data as string[];
}

export async function getSessionContext(): Promise<SessionContext> {
  if (!hasSupabaseConfig() || (await hasDemoSession())) {
    return {
      cartorioId: DEMO_CARTORIO_ID,
      userId: DEMO_USER_ID,
      profile: demoData.profiles[0],
      cartorio: demoData.cartorios[0],
      permissions: demoData.permissoes.map((permission) => permission.chave),
      isDemo: true,
    };
  }

  const [profile, cartorio, permissions] = await Promise.all([
    getCurrentUserProfile(),
    getCurrentCartorio(),
    getCurrentPermissions(),
  ]);

  return {
    cartorioId: profile.cartorio_id,
    userId: profile.id,
    profile,
    cartorio,
    permissions,
    isDemo: false,
  };
}

export async function requirePermission(permission: string) {
  const context = await getSessionContext();

  if (!context.permissions.includes(permission)) {
    throw new Error(`Permissão necessária: ${permission}`);
  }

  return context;
}

export async function hasDemoSession() {
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE)?.value === "1";
}
