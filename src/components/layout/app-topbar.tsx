import { Suspense } from "react";
import { logoutAction } from "@/app/(auth)/login/actions";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSessionContext } from "@/lib/auth";
import { listScopedRecords } from "@/lib/data";

export async function AppTopbar() {
  const context = await getSessionContext();
  const notificacoes = await listScopedRecords("notificacoes", { orderBy: "created_at", ascending: false });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/82 px-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl lg:px-6">
      <Suspense fallback={null}>
        <MobileSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950">{context.cartorio.nome}</p>
        <p className="text-xs text-slate-500">
          {context.isDemo ? "Sessão de demonstração operacional" : "Ambiente conectado ao Supabase"}
        </p>
      </div>
      <GlobalSearch />
      <NotificationsMenu notifications={notificacoes} />
      <div className="flex items-center gap-3">
        <Avatar className="border border-slate-200/50 bg-slate-50 shadow-sm transition-transform hover:scale-105">
          <AvatarFallback>{context.profile.nome.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-medium">{context.profile.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{context.profile.email}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Sair
        </Button>
      </form>
    </header>
  );
}
