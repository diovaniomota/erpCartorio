"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationItem = {
  id: string;
  titulo: string;
  descricao?: string | null;
  lida?: boolean | null;
  vinculo_tipo?: string | null;
};

type NotificationsMenuProps = {
  notifications: NotificationItem[];
};

export function NotificationsMenu({ notifications }: NotificationsMenuProps) {
  const unread = notifications.filter((item) => !item.lida).length;
  const recent = notifications.slice(0, 6);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative" title="Notificações">
          <Bell className="h-4 w-4" />
          {unread ? (
            <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-red-600 px-1 text-[10px] text-white">
              {unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notificações
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {unread} não lidas
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recent.length ? (
          recent.map((notification) => (
            <DropdownMenuItem key={notification.id} asChild>
              <Link href={routeForNotification(notification)} prefetch={false} className="block rounded-md px-2 py-2">
                <span className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#0066b3]" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{notification.titulo}</span>
                    {notification.descricao ? (
                      <span className="line-clamp-2 text-xs text-muted-foreground">{notification.descricao}</span>
                    ) : null}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-3 text-sm text-muted-foreground">Nenhuma notificação pendente.</div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" prefetch={false} className="justify-center font-medium text-primary">
            Ver painel administrativo
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function routeForNotification(notification: NotificationItem) {
  switch (notification.vinculo_tipo) {
    case "financeiro_conta":
      return "/financeiro/contas";
    case "contrato":
      return "/contratos";
    case "task":
    case "tasks":
      return "/tarefas/kanban";
    case "lgpd_incidente":
      return "/lgpd/incidentes";
    case "funcionario_atestado":
      return "/rh/atestados";
    case "funcionario_ferias":
      return "/rh/ferias";
    case "official_update":
      return "/central-oficial";
    default:
      return "/dashboard";
  }
}
