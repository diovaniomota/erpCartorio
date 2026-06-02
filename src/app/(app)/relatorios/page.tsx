import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileHeart,
  Package,
  ShieldAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/auth";
import { getContratos } from "@/modules/contratos/queries";
import { getContasFinanceiras } from "@/modules/financeiro/queries";
import { getInventarioItens } from "@/modules/inventario/queries";
import { getLgpdIncidentes, getLgpdSolicitacoes } from "@/modules/lgpd/queries";
import { getAtestados, getFerias, getFuncionarios } from "@/modules/rh/queries";
import { getTasks } from "@/modules/tarefas/queries";
import { cn, formatCurrency } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Health = "ok" | "warn" | "critical";
type Metric = { label: string; value: string | number; sub?: string };

// ── Health indicator ──────────────────────────────────────────────────────────
const healthConf: Record<Health, { dot: string; bg: string; text: string; label: string }> = {
  ok:       { dot: "bg-emerald-500", bg: "bg-emerald-50",  text: "text-emerald-700", label: "Tudo em ordem" },
  warn:     { dot: "bg-amber-500",   bg: "bg-amber-50",    text: "text-amber-700",   label: "Atenção" },
  critical: { dot: "bg-red-500",     bg: "bg-red-50",      text: "text-red-700",     label: "Crítico" },
};

export default async function RelatoriosPage() {
  await requirePermission("ver_relatorios");

  const [contas, funcionarios, atestados, ferias, contratos, inventario, incidentes, solicitacoes, tasks] =
    await Promise.all([
      getContasFinanceiras(),
      getFuncionarios(),
      getAtestados(),
      getFerias(),
      getContratos(),
      getInventarioItens(),
      getLgpdIncidentes(),
      getLgpdSolicitacoes(),
      getTasks(),
    ]);

  // ── Derivados ────────────────────────────────────────────────────────────────
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Financeiro
  const contasPendentes = contas.filter((c) => ["pendente", "aberta"].includes(c.status)).length;
  const contasVencidas  = contas.filter((c) => c.status === "vencida").length;
  const folha           = funcionarios.filter((f) => f.status === "ativo").reduce((s, f) => s + Number(f.salario ?? 0), 0);

  // RH
  const funcAtivos    = funcionarios.filter((f) => f.status === "ativo").length;
  const atestPend     = atestados.filter((a) => a.status === "pendente").length;
  const feriasProg    = ferias.filter((f) => ["em andamento", "aprovada"].includes(f.status)).length;

  // Contratos
  const contratoVigente  = contratos.filter((c) => c.status === "vigente" || c.status === "a vencer").length;
  const contratoVencendo = contratos.filter((c) => {
    if (!c.data_vencimento) return false;
    const diff = new Date(c.data_vencimento).getTime() - hoje.getTime();
    return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000 && c.status === "vigente";
  }).length;

  // Inventário
  const invManutencao = inventario.filter((i) => i.status === "em manutenção").length;
  const invEmUso      = inventario.filter((i) => i.status === "em uso").length;

  // LGPD
  const hoje7 = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
  const solAtrasadas = solicitacoes.filter((s) => new Date(s.prazo_resposta) < hoje && s.status !== "concluída").length;
  const incCriticos  = incidentes.filter((i) => ["crítico", "alto"].includes(i.risco) && i.status !== "encerrado").length;

  // Tarefas
  const tasksAbertas  = tasks.filter((t) => t.status !== "concluída" && t.status !== "cancelada").length;
  const tasksAtrasadas= tasks.filter((t) => t.data_prazo && new Date(t.data_prazo) < hoje && t.status !== "concluída").length;
  const tasksUrgentes = tasks.filter((t) => t.prioridade === "urgente" && t.status !== "concluída").length;

  // ── Health por módulo ────────────────────────────────────────────────────────
  const healthFinanceiro: Health = contasVencidas > 0        ? "critical" : contasPendentes > 0      ? "warn" : "ok";
  const healthRh:         Health = atestPend > 0             ? "warn"     : "ok";
  const healthContratos:  Health = contratoVencendo > 0      ? "warn"     : "ok";
  const healthInventario: Health = invManutencao > 0         ? "warn"     : "ok";
  const healthLgpd:       Health = incCriticos > 0 || solAtrasadas > 0 ? "critical" : "warn";
  const healthTarefas:    Health = tasksAtrasadas > 0        ? "critical" : tasksUrgentes > 0 ? "warn" : "ok";

  // ── Alertas consolidados ─────────────────────────────────────────────────────
  const alertas = [
    contasVencidas  > 0 && { modulo: "Financeiro", msg: `${contasVencidas} conta${contasVencidas !== 1 ? "s" : ""} vencida${contasVencidas !== 1 ? "s" : ""}`, h: "critical" as Health },
    atestPend       > 0 && { modulo: "RH",         msg: `${atestPend} atestado${atestPend !== 1 ? "s" : ""} pendente${atestPend !== 1 ? "s" : ""}`, h: "warn" as Health },
    contratoVencendo> 0 && { modulo: "Contratos",  msg: `${contratoVencendo} contrato${contratoVencendo !== 1 ? "s" : ""} vencendo em 30 dias`, h: "warn" as Health },
    invManutencao   > 0 && { modulo: "Inventário", msg: `${invManutencao} bem${invManutencao !== 1 ? "ns" : ""} em manutenção`, h: "warn" as Health },
    solAtrasadas    > 0 && { modulo: "LGPD",       msg: `${solAtrasadas} solicitação${solAtrasadas !== 1 ? "ões" : ""} atrasada${solAtrasadas !== 1 ? "s" : ""}`, h: "critical" as Health },
    incCriticos     > 0 && { modulo: "LGPD",       msg: `${incCriticos} incidente${incCriticos !== 1 ? "s" : ""} crítico${incCriticos !== 1 ? "s" : ""}`, h: "critical" as Health },
    tasksAtrasadas  > 0 && { modulo: "Tarefas",    msg: `${tasksAtrasadas} tarefa${tasksAtrasadas !== 1 ? "s" : ""} atrasada${tasksAtrasadas !== 1 ? "s" : ""}`, h: "critical" as Health },
    tasksUrgentes   > 0 && { modulo: "Tarefas",    msg: `${tasksUrgentes} tarefa${tasksUrgentes !== 1 ? "s" : ""} urgente${tasksUrgentes !== 1 ? "s" : ""}`, h: "warn" as Health },
  ].filter(Boolean) as { modulo: string; msg: string; h: Health }[];

  // ── Tabela de exportação ─────────────────────────────────────────────────────
  const tableData = [
    { modulo: "Financeiro",  indicador: "Contas cadastradas",           valor: contas.length },
    { modulo: "Financeiro",  indicador: "Contas vencidas",              valor: contasVencidas },
    { modulo: "Financeiro",  indicador: "Folha estimada (ativos)",      valor: formatCurrency(folha) },
    { modulo: "RH",          indicador: "Funcionários ativos",          valor: funcAtivos },
    { modulo: "RH",          indicador: "Atestados pendentes",          valor: atestPend },
    { modulo: "RH",          indicador: "Férias em andamento/aprovadas",valor: feriasProg },
    { modulo: "Contratos",   indicador: "Contratos vigentes",           valor: contratoVigente },
    { modulo: "Contratos",   indicador: "Vencendo em 30 dias",          valor: contratoVencendo },
    { modulo: "Inventário",  indicador: "Bens em uso",                  valor: invEmUso },
    { modulo: "Inventário",  indicador: "Bens em manutenção",           valor: invManutencao },
    { modulo: "LGPD",        indicador: "Incidentes críticos/altos",    valor: incCriticos },
    { modulo: "LGPD",        indicador: "Solicitações atrasadas",       valor: solAtrasadas },
    { modulo: "Tarefas",     indicador: "Tarefas em aberto",            valor: tasksAbertas },
    { modulo: "Tarefas",     indicador: "Tarefas atrasadas",            valor: tasksAtrasadas },
    { modulo: "Tarefas",     indicador: "Tarefas urgentes",             valor: tasksUrgentes },
  ];

  return (
    <>
      <PageHeader
        title="Relatórios administrativos"
        description="Visão executiva consolidada de todos os módulos — indicadores, alertas e exportação de dados."
      />

      {/* Totalizadores gerais */}
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Financeiro",  value: contas.length,        icon: CircleDollarSign, color: "text-emerald-700 bg-emerald-50" },
          { label: "Funcionários",value: funcionarios.length,  icon: UsersRound,       color: "text-violet-700 bg-violet-50" },
          { label: "Contratos",   value: contratos.length,     icon: BriefcaseBusiness,color: "text-blue-700 bg-blue-50" },
          { label: "Inventário",  value: inventario.length,    icon: Package,          color: "text-orange-700 bg-orange-50" },
          { label: "LGPD",        value: incidentes.length + solicitacoes.length, icon: ShieldAlert, color: "text-teal-700 bg-teal-50" },
          { label: "Tarefas",     value: tasks.length,         icon: ClipboardList,    color: "text-indigo-700 bg-indigo-50" },
        ].map((s) => {
          const Icon = s.icon;
          const [text, bg] = s.color.split(" ");
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", text)} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className={cn("text-xl font-bold tabular-nums leading-none", text)}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas consolidados */}
      {alertas.length > 0 ? (
        <section className="rounded-xl border border-red-200 bg-white">
          <div className="flex items-center gap-3 border-b border-red-100 bg-red-50/60 px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">Atenção</p>
              <h2 className="text-base font-semibold text-red-900">Alertas consolidados</h2>
            </div>
            <span className="ml-auto rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              {alertas.length}
            </span>
          </div>
          <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2">
            {alertas.map((a, i) => {
              const hc = healthConf[a.h];
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", hc.dot)} />
                  <span className="min-w-0 flex-1 text-sm text-slate-700">{a.msg}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", hc.bg, hc.text)}>
                    {a.modulo}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <p className="text-sm font-medium text-emerald-700">Nenhum alerta crítico em todos os módulos.</p>
        </div>
      )}

      {/* Cards por módulo */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ModuleCard
          title="Financeiro"
          icon={CircleDollarSign}
          accent="#10b981"
          health={healthFinanceiro}
          metrics={[
            { label: "Contas cadastradas",  value: contas.length },
            { label: "Pendentes",           value: contasPendentes, sub: contasPendentes > 0 ? "aguardando" : undefined },
            { label: "Vencidas",            value: contasVencidas,  sub: contasVencidas > 0 ? "ação necessária" : undefined },
          ]}
        />
        <ModuleCard
          title="RH"
          icon={UsersRound}
          accent="#7c3aed"
          health={healthRh}
          metrics={[
            { label: "Funcionários ativos", value: funcAtivos },
            { label: "Atestados pendentes", value: atestPend,    sub: atestPend > 0 ? "para aprovação" : undefined },
            { label: "Férias programadas",  value: feriasProg },
          ]}
        />
        <ModuleCard
          title="Contratos"
          icon={BriefcaseBusiness}
          accent="#3b82f6"
          health={healthContratos}
          metrics={[
            { label: "Total de contratos",  value: contratos.length },
            { label: "Vigentes",            value: contratoVigente },
            { label: "Vencendo em 30 dias", value: contratoVencendo, sub: contratoVencendo > 0 ? "renovar" : undefined },
          ]}
        />
        <ModuleCard
          title="Inventário"
          icon={Package}
          accent="#f97316"
          health={healthInventario}
          metrics={[
            { label: "Total de itens",  value: inventario.length },
            { label: "Em uso",          value: invEmUso },
            { label: "Em manutenção",   value: invManutencao, sub: invManutencao > 0 ? "verificar andamento" : undefined },
          ]}
        />
        <ModuleCard
          title="LGPD"
          icon={ShieldAlert}
          accent="#0d9488"
          health={healthLgpd}
          metrics={[
            { label: "Incidentes abertos",     value: incidentes.filter((i) => i.status !== "encerrado").length },
            { label: "Incidentes críticos",    value: incCriticos,   sub: incCriticos > 0 ? "alto risco" : undefined },
            { label: "Solicitações atrasadas", value: solAtrasadas,  sub: solAtrasadas > 0 ? "prazo vencido" : undefined },
          ]}
        />
        <ModuleCard
          title="Tarefas"
          icon={ClipboardList}
          accent="#6366f1"
          health={healthTarefas}
          metrics={[
            { label: "Em aberto",  value: tasksAbertas },
            { label: "Atrasadas",  value: tasksAtrasadas, sub: tasksAtrasadas > 0 ? "prazo vencido" : undefined },
            { label: "Urgentes",   value: tasksUrgentes,  sub: tasksUrgentes > 0 ? "prioridade máxima" : undefined },
          ]}
        />
      </div>

      {/* Tabela de exportação */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Exportação</p>
            <h2 className="text-base font-semibold text-slate-900">Todos os indicadores</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {tableData.length} indicadores
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={tableData}
            columns={[
              { key: "modulo",    label: "Módulo" },
              { key: "indicador", label: "Indicador" },
              { key: "valor",     label: "Total" },
            ]}
            exportable
            exportFilename="relatorios-administrativos"
            exportTitle="Relatórios administrativos"
          />
        </div>
      </section>
    </>
  );
}

// ── ModuleCard ────────────────────────────────────────────────────────────────
function ModuleCard({
  title,
  icon: Icon,
  accent,
  health,
  metrics,
}: {
  title: string;
  icon: LucideIcon;
  accent: string;
  health: Health;
  metrics: Metric[];
}) {
  const hc = healthConf[health];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: `${accent}18` }}
          >
            <Icon className="h-4 w-4" style={{ color: accent }} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", hc.bg, hc.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", hc.dot)} />
          {hc.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 leading-tight">
              {m.label}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums leading-none" style={{ color: accent }}>
              {m.value}
            </p>
            {m.sub && (
              <p className="mt-1 text-[10px] text-slate-400 leading-tight">{m.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
