import type { ReactNode } from "react";
import { getSessionContext } from "@/lib/auth";

export async function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const context = await getSessionContext();

  if (!context.permissions.includes(permission)) {
    return fallback;
  }

  return children;
}
