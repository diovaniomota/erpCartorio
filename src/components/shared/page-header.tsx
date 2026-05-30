import type { ReactNode } from "react";
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
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
  tone?: ModuleTone;
};

type ModuleTone =
  | "dashboard"
  | "central"
  | "agenda"
  | "financeiro"
  | "fornecedores"
  | "contratos"
  | "inventario"
  | "rh"
  | "lgpd"
  | "documentos"
  | "tarefas"
  | "chat"
  | "relatorios"
  | "usuarios"
  | "auditoria"
  | "configuracoes";

type HeaderTheme = {
  label: string;
  icon: LucideIcon;
  accent: string;
  iconClass: string;
  panelClass: string;
};

const themes: Record<ModuleTone, HeaderTheme> = {
  dashboard: {
    label: "Painel administrativo",
    icon: ChartNoAxesCombined,
    accent: "from-[#0e1d42] to-[#0066b3]",
    iconClass: "bg-blue-50 text-[#0066b3] ring-blue-100",
    panelClass: "border-blue-100",
  },
  central: {
    label: "Central oficial",
    icon: Bell,
    accent: "from-amber-600 to-yellow-500",
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClass: "border-amber-100",
  },
  agenda: {
    label: "Agenda administrativa",
    icon: CalendarDays,
    accent: "from-[#0066b3] to-[#00aeef]",
    iconClass: "bg-sky-50 text-[#0066b3] ring-sky-100",
    panelClass: "border-sky-100",
  },
  financeiro: {
    label: "Financeiro",
    icon: WalletCards,
    accent: "from-blue-700 to-sky-600",
    iconClass: "bg-blue-50 text-blue-700 ring-blue-100",
    panelClass: "border-blue-100",
  },
  fornecedores: {
    label: "Fornecedores",
    icon: Building2,
    accent: "from-cyan-700 to-sky-600",
    iconClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    panelClass: "border-cyan-100",
  },
  contratos: {
    label: "Contratos",
    icon: FileText,
    accent: "from-indigo-700 to-blue-600",
    iconClass: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    panelClass: "border-indigo-100",
  },
  inventario: {
    label: "Inventário",
    icon: Package,
    accent: "from-orange-700 to-amber-600",
    iconClass: "bg-orange-50 text-orange-700 ring-orange-100",
    panelClass: "border-orange-100",
  },
  rh: {
    label: "Recursos humanos",
    icon: Users,
    accent: "from-rose-700 to-pink-600",
    iconClass: "bg-rose-50 text-rose-700 ring-rose-100",
    panelClass: "border-rose-100",
  },
  lgpd: {
    label: "LGPD e compliance",
    icon: ShieldCheck,
    accent: "from-violet-700 to-purple-600",
    iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
    panelClass: "border-violet-100",
  },
  documentos: {
    label: "Documentos internos",
    icon: BookOpen,
    accent: "from-slate-700 to-slate-600",
    iconClass: "bg-slate-100 text-slate-700 ring-slate-200",
    panelClass: "border-slate-200",
  },
  tarefas: {
    label: "Tarefas",
    icon: ClipboardList,
    accent: "from-blue-700 to-sky-600",
    iconClass: "bg-blue-50 text-blue-700 ring-blue-100",
    panelClass: "border-blue-100",
  },
  chat: {
    label: "Chat interno",
    icon: MessageSquare,
    accent: "from-teal-700 to-emerald-600",
    iconClass: "bg-teal-50 text-teal-700 ring-teal-100",
    panelClass: "border-teal-100",
  },
  relatorios: {
    label: "Relatórios",
    icon: ChartNoAxesCombined,
    accent: "from-slate-800 to-slate-600",
    iconClass: "bg-slate-100 text-slate-700 ring-slate-200",
    panelClass: "border-slate-200",
  },
  usuarios: {
    label: "Usuários e permissões",
    icon: Landmark,
    accent: "from-zinc-800 to-slate-600",
    iconClass: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    panelClass: "border-zinc-200",
  },
  auditoria: {
    label: "Auditoria",
    icon: Archive,
    accent: "from-red-800 to-rose-700",
    iconClass: "bg-red-50 text-red-700 ring-red-100",
    panelClass: "border-red-100",
  },
  configuracoes: {
    label: "Configurações",
    icon: Settings,
    accent: "from-slate-700 to-zinc-600",
    iconClass: "bg-slate-100 text-slate-700 ring-slate-200",
    panelClass: "border-slate-200",
  },
};

export function PageHeader({ title, description, actions, eyebrow, tone }: PageHeaderProps) {
  const theme = themes[tone ?? inferTone(title)];
  const Icon = theme.icon;

  return (
    <div className={cn("relative overflow-hidden rounded-lg border bg-white shadow-panel", theme.panelClass)}>
      <div className={cn("h-1.5 bg-gradient-to-r", theme.accent)} />
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-44 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_64%)]" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 gap-4 px-5 py-5">
          <div className={cn("mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1", theme.iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {eyebrow ?? theme.label}
            </p>
            <h1 className="text-xl font-semibold tracking-normal text-slate-950 md:text-2xl">{title}</h1>
            {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2 px-5 pb-5 md:pb-0 md:pr-5">{actions}</div> : null}
      </div>
    </div>
  );
}

function inferTone(title: string): ModuleTone {
  const value = title.toLowerCase();

  if (["dashboard", "painel"].some((word) => value.includes(word))) return "dashboard";
  if (["central", "notícia", "comunicado", "provimento", "fontes"].some((word) => value.includes(word))) return "central";
  if (["agenda", "evento", "reuniões", "prazos", "vencimentos"].some((word) => value.includes(word))) return "agenda";
  if (["financeiro", "contas", "boletos", "caixa", "pagamento"].some((word) => value.includes(word))) return "financeiro";
  if (value.includes("fornecedor")) return "fornecedores";
  if (value.includes("contrato")) return "contratos";
  if (["inventário", "patrimônio", "manutenção", "baixas"].some((word) => value.includes(word))) return "inventario";
  if (["rh", "funcionário", "funcionários", "ponto", "atestado", "férias", "benefício"].some((word) => value.includes(word))) return "rh";
  if (["lgpd", "incidente", "política", "treinamento", "titular"].some((word) => value.includes(word))) return "lgpd";
  if (value.includes("documento")) return "documentos";
  if (["tarefa", "kanban"].some((word) => value.includes(word))) return "tarefas";
  if (value.includes("chat")) return "chat";
  if (value.includes("relatório")) return "relatorios";
  if (["usuário", "permiss"].some((word) => value.includes(word))) return "usuarios";
  if (value.includes("auditoria")) return "auditoria";
  if (value.includes("configura")) return "configuracoes";

  return "dashboard";
}
