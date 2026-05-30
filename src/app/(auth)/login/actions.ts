"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEMO_EMAIL = "admin@cartoriohub.local";
const DEMO_PASSWORD = "CartorioHub@123";
const DEMO_COOKIE = "cartoriohub_demo_session";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!hasSupabaseConfig()) {
    await setDemoSession(email, password);
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      await setDemoSession(email, password);
      redirect("/dashboard");
    }

    redirect("/login?error=credenciais");
  }

  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);

  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}

async function setDemoSession(email: string, password: string) {
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    redirect("/login?error=credenciais");
  }

  const cookieStore = await cookies();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const isLocalAppUrl =
    appUrl.startsWith("http://localhost") || appUrl.startsWith("http://127.0.0.1");

  cookieStore.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !isLocalAppUrl,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
