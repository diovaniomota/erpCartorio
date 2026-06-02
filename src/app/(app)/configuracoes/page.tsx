import {
  Bell,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Database,
  Lock,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { getConfiguracoes } from "@/modules/configuracoes/queries";
import { deleteConfiguracao } from "@/modules/configuracoes/actions";
import { DataTable } from "@/components/shared/data-table";
import { ConfigModuleDialog } from "@/components/shared/config-module-dialog";
import { cn } from "@/lib/utils";

// ── Module catalog ─────────────────────────────────────────────────────────────
type FieldDef = { key: string; label: string; type: "boolean" | "number" | "string" | "time" };

type ModuleDef = {
  chave: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  description: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

const MODULES: ModuleDef[] = [
  {
    chave: "notificacoes",
    label: "Notificações",
    icon: Bell,
    accent: "#3b82f6",
    description: "Canais de alerta e preferências de envio para eventos do sistema.",
    fields: [
      { key: "interno",  label: "Notificação interna (sino)",    type: "boolean" },
      { key: "email",    label: "Envio por e-mail",              type: "boolean" },
      { key: "whatsapp", label: "WhatsApp (integração futura)",  type: "boolean" },
    ],
    defaults: { interno: true, email: false, whatsapp: false },
  },
  {
    chave: "tarefas",
    label: "Tarefas",
    icon: ClipboardList,
    accent: "#6366f1",
    description: "Regras de conclusão, reabertura automática e alertas de prazo.",
    fields: [
      { key: "alerta_vencimento_horas",        label: "Alertar antes do prazo (horas)",    type: "number" },
      { key: "preservar_conclusao_ao_reabrir", label: "Preservar conclusão ao reabrir",    type: "boolean" },
      { key: "auto_fechar_concluidas_dias",    label: "Auto-arquivar concluídas após (dias)", type: "number" },
    ],
    defaults: { alerta_vencimento_horas: 24, preservar_conclusao_ao_reabrir: false, auto_fechar_concluidas_dias: 30 },
  },
  {
    chave: "financeiro",
    label: "Financeiro",
    icon: CircleDollarSign,
    accent: "#10b981",
    description: "Lembretes de vencimento, régua de cobrança e moeda padrão.",
    fields: [
      { key: "dias_alerta_vencimento", label: "Alertar antes do vencimento (dias)", type: "number" },
      { key: "dias_atraso_critico",    label: "Dias em atraso para status crítico", type: "number" },
      { key: "moeda",                  label: "Moeda padrão",                       type: "string" },
    ],
    defaults: { dias_alerta_vencimento: 7, dias_atraso_critico: 30, moeda: "BRL" },
  },
  {
    chave: "lgpd",
    label: "LGPD",
    icon: ShieldCheck,
    accent: "#0d9488",
    description: "Prazos de resposta a titulares, dados do DPO e políticas de retenção.",
    fields: [
      { key: "prazo_resposta_titular_dias", label: "Prazo padrão de resposta (dias)", type: "number" },
      { key: "encarregado_nome",           label: "Nome do encarregado (DPO)",       type: "string" },
      { key: "encarregado_email",          label: "E-mail do DPO",                   type: "string" },
      { key: "retencao_dados_anos",        label: "Retenção de dados (anos)",        type: "number" },
    ],
    defaults: { prazo_resposta_titular_dias: 15, encarregado_nome: "", encarregado_email: "", retencao_dados_anos: 5 },
  },
  {
    chave: "agenda",
    label: "Agenda",
    icon: Calendar,
    accent: "#ec4899",
    description: "Horário de expediente, duração padrão e comportamento de lembretes.",
    fields: [
      { key: "hora_inicio",            label: "Início do expediente",      type: "time" },
      { key: "hora_fim",               label: "Fim do expediente",         type: "time" },
      { key: "duracao_padrao_min",     label: "Duração padrão (minutos)",  type: "number" },
      { key: "lembrete_padrao_min",    label: "Lembrete padrão (minutos)", type: "number" },
    ],
    defaults: { hora_inicio: "08:00", hora_fim: "18:00", duracao_padrao_min: 30, lembrete_padrao_min: 15 },
  },
  {
    chave: "storage",
    label: "Armazenamento",
    icon: Database,
    accent: "#f97316",
    description: "Política de arquivos, tamanho máximo e tipos de documento permitidos.",
    fields: [
      { key: "tamanho_maximo_mb",  label: "Tamanho máximo por arquivo (MB)", type: "number" },
      { key: "tipos_permitidos",   label: "Extensões permitidas (ex: pdf,jpg)", type: "string" },
    ],
    defaults: { tamanho_maximo_mb: 10, tipos_permitidos: "pdf,jpg,png,docx,xlsx" },
  },
  {
    chave: "seguranca",
    label: "Segurança",
    icon: Lock,
    accent: "#ef4444",
    description: "Sessão, 2FA, política de senhas e auditoria de acessos.",
    fields: [
      { key: "sessao_duracao_horas",     label: "Duração da sessão (horas)",        type: "number" },
      { key: "auditoria_ativa",          label: "Auditoria de ações ativa",         type: "boolean" },
      { key: "bloquear_apos_tentativas", label: "Bloquear após X tentativas falhas", type: "number" },
    ],
    defaults: { sessao_duracao_horas: 8, auditoria_ativa: true, bloquear_apos_tentativas: 5 },
  },
  {
    chave: "cartorio_geral",
    label: "Cartório geral",
    icon: Settings,
    accent: "#8b5cf6",
    description: "Dados de contato públicos, horários de atendimento e identificação.",
    fields: [
      { key: "nome_publico",     label: "Nome público do cartório",  type: "string" },
      { key: "telefone",        label: "Telefone de contato",        type: "string" },
      { key: "email_contato",   label: "E-mail de contato",          type: "string" },
      { key: "atendimento",     label: "Horário de atendimento",     type: "string" },
    ],
    defaults: { nome_publico: "", telefone: "", email_contato: "", atendimento: "Seg–Sex 8h–18h" },
  },
];

// ── Value formatting ──────────────────────────────────────────────────────────
function fmtValue(val: unknown, type: FieldDef["type"]): string {
  if (val === null || val === undefined || val === "") return "—";
  if (type === "boolean") return val ? "Sim" : "Não";
  return String(val);
}

export default async function ConfiguracoesPage() {
  await requirePermission("gerenciar_configuracoes");
  const configuracoes = await getConfiguracoes();

  const byChave: Record<string, Record<string, unknown>> = {};
  for (const c of configuracoes) {
    if (c.valor && typeof c.valor === "object" && !Array.isArray(c.valor)) {
      byChave[c.chave] = c.valor as Record<string, unknown>;
    }
  }

  const configuredCount = MODULES.filter((m) => byChave[m.chave]).length;

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Parâmetros operacionais do cartório por módulo — isolados por empresa, versionados e auditados."
      />

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-violet-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Módulos configurados</p>
          <p className="mt-3 text-2xl font-bold tabular-nums text-violet-700">{configuredCount} / {MODULES.length}</p>
          <p className="mt-1 text-xs text-slate-400">{MODULES.length - configuredCount} usando padrões</p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-emerald-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Registros ativos</p>
          <p className="mt-3 text-2xl font-bold tabular-nums text-emerald-700">{configuracoes.length}</p>
          <p className="mt-1 text-xs text-slate-400">Chaves na base</p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-slate-400 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Escopo</p>
          <p className="mt-3 text-2xl font-bold tabular-nums text-slate-700">Cartório</p>
          <p className="mt-1 text-xs text-slate-400">Isolado por empresa</p>
        </div>
      </div>

      {/* Module grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {MODULES.map((mod) => {
          const stored   = byChave[mod.chave];
          const values   = stored ?? mod.defaults;
          const isSet    = Boolean(stored);
          const Icon     = mod.icon;

          return (
            <section
              key={mod.chave}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between gap-3 px-5 py-4"
                style={{ borderTop: `3px solid ${mod.accent}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${mod.accent}18` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: mod.accent }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{mod.label}</h3>
                    <p className="text-xs text-slate-400">{mod.description}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    isSet ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                  )}>
                    {isSet ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Configurado
                      </span>
                    ) : "Padrão"}
                  </span>
                  <ConfigModuleDialog
                    chave={mod.chave}
                    label={mod.label}
                    currentJson={JSON.stringify(values, null, 2)}
                    accent={mod.accent}
                  />
                </div>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-t border-slate-100">
                {mod.fields.map((field) => {
                  const val    = values[field.key];
                  const display = fmtValue(val, field.type);
                  const isDefault = !stored || val === mod.defaults[field.key];
                  return (
                    <div key={field.key} className="px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {field.label}
                      </p>
                      <p className={cn(
                        "mt-1 text-sm font-medium",
                        display === "—"  ? "text-slate-400" :
                        isDefault        ? "text-slate-500" :
                        "text-slate-900",
                      )}>
                        {display}
                        {isDefault && display !== "—" && (
                          <span className="ml-1 text-[9px] text-slate-300">(padrão)</span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Raw table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Banco de dados</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Registros brutos</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {configuracoes.length} chaves
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={configuracoes.map((c) => ({
              ...c,
              valor_texto: (() => {
                const v = c.valor;
                if (v === null || v === undefined) return "—";
                if (typeof v === "boolean") return v ? "Sim" : "Não";
                if (typeof v === "string" || typeof v === "number") return String(v);
                return Object.entries(v as Record<string, unknown>)
                  .map(([k, val]) => `${k}: ${typeof val === "boolean" ? (val ? "Sim" : "Não") : String(val ?? "—")}`)
                  .join(" · ");
              })(),
            })) as unknown as Record<string, unknown>[]}
            columns={[
              { key: "chave",       label: "Chave" },
              { key: "valor_texto", label: "Valor" },
              { key: "updated_at",  label: "Atualizado em", format: "date" },
            ]}
            deleteAction={deleteConfiguracao}
          />
        </div>
      </section>
    </>
  );
}
