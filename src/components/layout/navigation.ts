import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  FileText,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavChild[];
};

export type SearchParamReader = {
  get(name: string): string | null;
  toString(): string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Central Oficial",
    href: "/central-oficial",
    icon: Bell,
    children: [
      { label: "Notícias", href: "/central-oficial/noticias" },
      { label: "Comunicados", href: "/central-oficial/comunicados" },
      { label: "Provimentos", href: "/central-oficial/provimentos" },
      { label: "Fontes monitoradas", href: "/central-oficial/fontes" },
    ],
  },
  {
    label: "Agenda",
    href: "/agenda",
    icon: CalendarDays,
    children: [
      { label: "Calendário geral", href: "/agenda" },
      { label: "Reuniões", href: "/agenda?tipo=reuniao" },
      { label: "Prazos", href: "/agenda?tipo=prazo" },
      { label: "Vencimentos", href: "/agenda?tipo=vencimento" },
    ],
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: WalletCards,
    children: [
      { label: "Visão geral", href: "/financeiro" },
      { label: "Contas a pagar", href: "/financeiro/contas?tipo=pagar" },
      { label: "Contas a receber", href: "/financeiro/contas?tipo=receber" },
      { label: "Boletos", href: "/financeiro/boletos" },
      { label: "Livro caixa", href: "/financeiro/livro-caixa" },
      { label: "Caixa", href: "/financeiro/caixa" },
      { label: "Relatórios", href: "/financeiro/relatorios" },
    ],
  },
  { label: "Fornecedores", href: "/fornecedores", icon: Building2 },
  { label: "Contratos", href: "/contratos", icon: FileText },
  {
    label: "Inventário",
    href: "/inventario",
    icon: Package,
    children: [
      { label: "Patrimônio", href: "/inventario" },
      { label: "Manutenções", href: "/inventario/manutencoes" },
      { label: "Baixas", href: "/inventario?status=baixado" },
    ],
  },
  {
    label: "RH",
    href: "/rh",
    icon: Users,
    children: [
      { label: "Funcionários", href: "/rh/funcionarios" },
      { label: "Ponto", href: "/rh/ponto" },
      { label: "Atestados", href: "/rh/atestados" },
      { label: "Férias", href: "/rh/ferias" },
      { label: "Benefícios", href: "/rh/beneficios" },
    ],
  },
  {
    label: "LGPD",
    href: "/lgpd",
    icon: ShieldCheck,
    children: [
      { label: "Painel LGPD", href: "/lgpd" },
      { label: "Inventário de dados", href: "/lgpd/inventario-dados" },
      { label: "Solicitações", href: "/lgpd/solicitacoes" },
      { label: "Incidentes", href: "/lgpd/incidentes" },
      { label: "Políticas", href: "/lgpd/politicas" },
      { label: "Treinamentos", href: "/lgpd/treinamentos" },
      { label: "Fornecedores operadores", href: "/lgpd/fornecedores-operadores" },
    ],
  },
  { label: "Documentos internos", href: "/documentos", icon: BookOpen },
  {
    label: "Tarefas",
    href: "/tarefas/kanban",
    icon: ClipboardList,
    children: [
      { label: "Quadro Kanban", href: "/tarefas/kanban" },
      { label: "Minhas tarefas", href: "/tarefas/minhas" },
      { label: "Equipe", href: "/tarefas/equipe" },
      { label: "Atrasadas", href: "/tarefas/atrasadas" },
    ],
  },
  { label: "Chat interno", href: "/chat", icon: MessageSquare },
  { label: "Relatórios", href: "/relatorios", icon: ChartNoAxesCombined },
  {
    label: "Usuários e permissões",
    href: "/usuarios",
    icon: Landmark,
    children: [
      { label: "Usuários", href: "/usuarios" },
      { label: "Perfis e permissões", href: "/permissoes" },
    ],
  },
  { label: "Auditoria", href: "/auditoria", icon: Archive },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function hrefPath(href: string) {
  return href.split("?")[0] || "/";
}

export function isItemActive(item: NavItem, pathname: string) {
  const itemPath = hrefPath(item.href);
  const itemMatches = pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  const childMatches = item.children?.some((child) => {
    const childPath = hrefPath(child.href);
    return pathname === childPath || pathname.startsWith(`${childPath}/`);
  });

  return itemMatches || Boolean(childMatches);
}

export function isChildActive(href: string, pathname: string, searchParams: SearchParamReader) {
  const [path, query] = href.split("?");
  if (pathname !== path) {
    return false;
  }

  if (!query) {
    return searchParams.toString() === "";
  }

  const expected = new URLSearchParams(query);
  return Array.from(expected.entries()).every(([key, value]) => searchParams.get(key) === value);
}

export function flattenNavItems() {
  return navItems.flatMap((item) => [
    { label: item.label, href: item.href, group: item.label },
    ...(item.children ?? []).map((child) => ({ label: child.label, href: child.href, group: item.label })),
  ]);
}
