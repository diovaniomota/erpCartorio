import {
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Hammer,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createInventarioManutencao, deleteInventarioManutencao } from "@/modules/inventario/actions";
import { getInventarioItens, getInventarioManutencoes } from "@/modules/inventario/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

type Tone = "orange" | "success" | "warning" | "danger" | "info" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  orange:  { text: "text-orange-700",  border: "border-l-orange-500",  icon: "text-orange-500",  dot: "bg-orange-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500",    dot: "bg-blue-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

export default async function InventarioManutencoesPage() {
  const [manutencoes, itens, fornecedores] = await Promise.all([
    getInventarioManutencoes(),
    getInventarioItens(),
    getFornecedores(),
  ]);

  const abertas      = manutencoes.filter((m) => m.status === "aberta");
  const emAndamento  = manutencoes.filter((m) => m.status === "em andamento");
  const concluidas   = manutencoes.filter((m) => m.status === "concluída");
  const canceladas   = manutencoes.filter((m) => m.status === "cancelada");
  const custo        = manutencoes.reduce((s, m) => s + Number(m.custo ?? 0), 0);
  const custoAberto  = [...abertas, ...emAndamento].reduce((s, m) => s + Number(m.custo ?? 0), 0);

  const fields: EntityField[] = [
    {
      name: "item_id",
      label: "Patrimônio",
      type: "select",
      required: true,
      options: itens.map((i) => ({ label: `${i.codigo_patrimonio} — ${i.nome}`, value: i.id })),
    },
    {
      name: "fornecedor_id",
      label: "Fornecedor",
      type: "select",
      options: fornecedores.map((i) => ({ label: i.nome, value: i.id })),
    },
    { name: "descricao",   label: "Descrição",  type: "textarea", required: true },
    { name: "data_inicio", label: "Início",     type: "date",     required: true },
    { name: "data_fim",    label: "Fim",        type: "date" },
    { name: "custo",       label: "Custo",      type: "money" },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "aberta",
      options: ["aberta", "em andamento", "concluída", "cancelada"].map((value) => ({ label: value, value })),
    },
  ];

  return (
    <>
      <PageHeader
        title="Manutenções do patrimônio"
        description="Controle de manutenção preventiva e corretiva, custo, fornecedor e andamento."
        actions={<EntityFormDialog title="Nova manutenção" fields={fields} action={createInventarioManutencao} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Abertas" value={String(abertas.length)} sub="Aguardando início" icon={Clock} tone="warning" />
        <KPICard label="Em andamento" value={String(emAndamento.length)} sub={custoAberto > 0 ? formatCurrency(custoAberto) + " em aberto" : "Nenhum custo"} icon={Wrench} tone="orange" />
        <KPICard label="Concluídas" value={String(concluidas.length)} sub="Finalizadas" icon={CheckCircle2} tone="success" />
        <KPICard label="Custo total" value={formatCurrency(custo)} sub={`${manutencoes.length} registros`} icon={CircleDollarSign} tone="neutral" />
      </div>

      {/* Pipeline visual */}
      {(abertas.length > 0 || emAndamento.length > 0) && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Pipeline</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Manutenções em aberto</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {[...emAndamento, ...abertas].map((m) => (
              <div key={m.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                <div className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  m.status === "em andamento" ? "bg-orange-50 text-orange-600" : "bg-amber-50 text-amber-600",
                )}>
                  {m.status === "em andamento" ? <Wrench className="h-4 w-4" /> : <Hammer className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{m.item_nome ?? "Item sem nome"}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{m.descricao}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    {m.fornecedor_nome && <span>{m.fornecedor_nome}</span>}
                    <span>Início: {formatDate(m.data_inicio)}</span>
                    {m.data_fim && <span>Prev. conclusão: {formatDate(m.data_fim)}</span>}
                    {m.custo ? <span className="font-medium text-orange-700">{formatCurrency(Number(m.custo))}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Status breakdown */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Abertas",      count: abertas.length,     tone: "warning" as Tone,  icon: Clock },
          { label: "Em andamento", count: emAndamento.length, tone: "orange" as Tone,   icon: Wrench },
          { label: "Concluídas",   count: concluidas.length,  tone: "success" as Tone,  icon: CheckCircle2 },
          { label: "Canceladas",   count: canceladas.length,  tone: "neutral" as Tone,  icon: XCircle },
        ].map((s) => {
          const c = toneConf[s.tone];
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Icon className={cn("h-4 w-4 shrink-0", c.icon)} />
              <span className="flex-1 text-sm text-slate-600">{s.label}</span>
              <span className={cn("text-lg font-bold tabular-nums", c.text)}>{s.count}</span>
            </div>
          );
        })}
      </div>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Histórico</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todas as manutenções</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {manutencoes.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={manutencoes as unknown as Record<string, unknown>[]}
            columns={[
              { key: "item_nome",       label: "Patrimônio" },
              { key: "fornecedor_nome", label: "Fornecedor" },
              { key: "descricao",       label: "Descrição" },
              { key: "data_inicio",     label: "Início",  format: "date" },
              { key: "data_fim",        label: "Fim",     format: "date" },
              { key: "custo",           label: "Custo",   format: "currency" },
              { key: "status",          label: "Status",  format: "status" },
            ]}
            deleteAction={deleteInventarioManutencao}
          />
        </div>
      </section>
    </>
  );
}

function KPICard({ label, value, sub, icon: Icon, tone }: {
  label: string; value: string; sub?: string; icon: LucideIcon; tone: Tone;
}) {
  const c = toneConf[tone];
  return (
    <div className={cn("rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4", c.border)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <Icon className={cn("h-4 w-4 shrink-0", c.icon)} aria-hidden="true" />
      </div>
      <p className={cn("mt-3 text-2xl font-bold leading-none tabular-nums", c.text)}>{value}</p>
      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
