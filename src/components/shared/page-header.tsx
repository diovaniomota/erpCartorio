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
  iconClass: string;
  panelClass: string;
};

const themes: Record<ModuleTone, HeaderTheme> = {
  dashboard: {
    label: "Painel administrativo",
    icon: ChartNoAxesCombined,
    iconClass: "bg-blue-50 text-[#0066b3] ring-blue-100",
    panelClass: "border-blue-100",
  },
  central: {
    label: "Central oficial",
    icon: Bell,
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
    panelClass: "border-amber-100",
  },
  agenda: {
    label: "Agenda administrativa",
    icon: CalendarDays,
    iconClass: "bg-sky-50 text-[#0066b3] ring-sky-100",
    panelClass: "border-sky-100",
  },
  financeiro: {
    label: "Financeiro",
    icon: WalletCards,
    iconClass: "bg-blue-50 text-blue-700 ring-blue-100",
    panelClass: "border-blue-100",
  },
  fornecedores: {
    label: "Fornecedores",
    icon: Building2,
    iconClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    panelClass: "border-cyan-100",
  },
  contratos: {
    label: "Contratos",
    icon: FileText,
    iconClass: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    panelClass: "border-indigo-100",
  },
  inventario: {
    label: "Inventário",
    icon: Package,
    iconClass: "bg-orange-50 text-orange-700 ring-orange-100",
    panelClass: "border-orange-100",
  },
  rh: {
    label: "Recursos humanos",
    icon: Users,
    iconClass: "bg-rose-50 text-rose-700 ring-rose-100",
    panelClass: "border-rose-100",
  },
  lgpd: {
    label: "LGPD e compliance",
    icon: ShieldCheck,
    iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
    panelClass: "border-violet-100",
  },
  documentos: {
    label: "Documentos internos",
    icon: BookOpen,
    iconClass: "bg-slate-100 text-slate-700 ring-slate-200",
    panelClass: "border-slate-200",
  },
  tarefas: {
    label: "Tarefas",
    icon: ClipboardList,
    iconClass: "bg-blue-50 text-blue-700 ring-blue-100",
    panelClass: "border-blue-100",
  },
  chat: {
    label: "Chat interno",
    icon: MessageSquare,
    iconClass: "bg-teal-50 text-teal-700 ring-teal-100",
    panelClass: "border-teal-100",
  },
  relatorios: {
    label: "Relatórios",
    icon: ChartNoAxesCombined,
    iconClass: "bg-slate-100 text-slate-700 ring-slate-200",
    panelClass: "border-slate-200",
  },
  usuarios: {
    label: "Usuários e permissões",
    icon: Landmark,
    iconClass: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    panelClass: "border-zinc-200",
  },
  auditoria: {
    label: "Auditoria",
    icon: Archive,
    iconClass: "bg-red-50 text-red-700 ring-red-100",
    panelClass: "border-red-100",
  },
  configuracoes: {
    label: "Configurações",
    icon: Settings,
    iconClass: "bg-slate-100 text-slate-700 ring-slate-200",
    panelClass: "border-slate-200",
  },
};

export function PageHeader({ title, description, actions, eyebrow, tone }: PageHeaderProps) {
  const theme = themes[tone ?? inferTone(title)];
  const Icon = theme.icon;

  return (
    <section className={cn("border-l-2 bg-transparent py-2 pl-5 pr-0", theme.panelClass)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1", theme.iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {eyebrow ?? theme.label}
            </p>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
            {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
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
