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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 lg:px-7">
      <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center gap-3">
      <Suspense fallback={null}>
        <MobileSidebar />
      </Suspense>
      <div className="hidden min-w-0 flex-1 lg:block">
        <div className="inline-flex max-w-full items-center gap-3 border-l-2 pl-3" style={{ borderColor: "#D4A427" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: "#D4A427" }} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-slate-950">{context.cartorio.nome}</p>
            <p className="truncate text-xs text-slate-500">Base administrativa conectada</p>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 lg:max-w-xl">
        <GlobalSearch />
      </div>
      <NotificationsMenu notifications={notificacoes} />
      <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
        <Avatar className="h-8 w-8 border border-slate-200 bg-slate-50">
          <AvatarFallback>{context.profile.nome.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-semibold leading-5 text-slate-950">{context.profile.nome}</p>
          <p className="truncate text-xs text-muted-foreground">{context.profile.email}</p>
        </div>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm">
          Sair
        </Button>
      </form>
      </div>
    </header>
  );
}
