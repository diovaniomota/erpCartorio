import {
  AlertTriangle,
  CircleDollarSign,
  Package,
  PackageCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { AssetGrid } from "@/components/shared/record-views";
import { createInventarioItem, deleteInventarioItem, restoreInventarioItem } from "@/modules/inventario/actions";
import { getInventarioItens } from "@/modules/inventario/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";
import { getFuncionarios } from "@/modules/rh/queries";
import { cn, formatCurrency } from "@/lib/utils";

type InventarioPageProps = {
  searchParams?: Promise<{ status?: string }>;
};

type Tone = "orange" | "success" | "warning" | "danger" | "info" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  orange:  { text: "text-orange-700",  border: "border-l-orange-500",  icon: "text-orange-500",  dot: "bg-orange-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500",    dot: "bg-blue-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

export default async function InventarioPage({ searchParams }: InventarioPageProps) {
  const params = await searchParams;
  const [itens, fornecedores, funcionarios] = await Promise.all([
    getInventarioItens({ includeDeleted: true }),
    getFornecedores(),
    getFuncionarios(),
  ]);

  const statusFiltro = params?.status;
  const ativos = itens.filter((i) => !i.deleted_at);
  const itensFiltrados = statusFiltro ? itens.filter((i) => i.status === statusFiltro) : itens;

  // KPIs
  const emUso        = ativos.filter((i) => i.status === "em uso").length;
  const emManutencao = ativos.filter((i) => i.status === "em manutenção").length;
  const baixados     = ativos.filter((i) => ["baixado", "vendido", "perdido", "danificado"].includes(i.status)).length;
  const patrimonioTotal = ativos.reduce((s, i) => s + Number(i.valor_compra ?? 0), 0);

  // Category breakdown
  const porCategoria = Object.entries(
    ativos.reduce<Record<string, number>>((acc, i) => {
      const cat = i.categoria ?? "Sem categoria";
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const fields: EntityField[] = [
    { name: "codigo_patrimonio", label: "Código patrimonial", required: true },
    { name: "nome", label: "Nome", required: true },
    { name: "categoria", label: "Categoria", required: true },
    { name: "numero_serie", label: "Número de série" },
    { name: "fornecedor_id", label: "Fornecedor", type: "select", options: fornecedores.map((i) => ({ label: i.nome, value: i.id })) },
    { name: "valor_compra", label: "Valor de compra", type: "money" },
    { name: "data_compra", label: "Compra", type: "date" },
    { name: "garantia_ate", label: "Garantia até", type: "date" },
    { name: "localizacao", label: "Localização", required: true },
    { name: "responsavel_id", label: "Responsável", type: "select", options: funcionarios.map((i) => ({ label: i.nome, value: i.id })) },
    { name: "status", label: "Status", type: "select", defaultValue: "em uso", options: ["em uso", "em manutenção", "reservado", "baixado", "perdido", "danificado", "vendido"].map((value) => ({ label: value, value })) },
    { name: "descricao", label: "Descrição", type: "textarea" },
  ];

  return (
    <>
      <PageHeader
        title={statusFiltro === "baixado" ? "Baixas patrimoniais" : "Inventário e patrimônio"}
        description={
          statusFiltro
            ? `Itens patrimoniais com status "${statusFiltro}".`
            : "Bens patrimoniais com responsáveis, localizações, garantias e histórico de manutenções."
        }
        actions={<EntityFormDialog title="Novo patrimônio" fields={fields} action={createInventarioItem} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total de itens" value={String(ativos.length)} sub="Patrimônio ativo" icon={Package} tone="orange" />
        <KPICard label="Em uso" value={String(emUso)} sub="Alocados" icon={PackageCheck} tone="success" />
        <KPICard label="Em manutenção" value={String(emManutencao)} sub={emManutencao > 0 ? "Verificar andamento" : "Tudo em ordem"} icon={Wrench} tone={emManutencao > 0 ? "warning" : "success"} />
        <KPICard label="Valor do patrimônio" value={formatCurrency(patrimonioTotal)} sub={`${baixados} baixados`} icon={CircleDollarSign} tone="orange" />
      </div>

      {/* Status pills + categorias */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Status breakdown */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Situação</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Distribuição por status</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
            {[
              { label: "Em uso",        count: emUso,        tone: "success" as Tone },
              { label: "Em manutenção", count: emManutencao, tone: "warning" as Tone },
              { label: "Reservados",    count: ativos.filter((i) => i.status === "reservado").length,  tone: "info" as Tone },
              { label: "Baixados",      count: baixados,     tone: baixados > 0 ? "danger" as Tone : "neutral" as Tone },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 py-4">
                <span className={cn("text-3xl font-bold tabular-nums", toneConf[s.tone].text)}>{s.count}</span>
                <span className="mt-1 text-xs text-slate-500">{s.label}</span>
                <span className={cn("mt-2 h-1 w-8 rounded-full", toneConf[s.tone].dot)} />
              </div>
            ))}
          </div>
        </section>

        {/* Categorias */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Inventário</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Categorias</h2>
          </div>
          {porCategoria.length ? (
            <div className="divide-y divide-slate-100">
              {porCategoria.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="text-sm text-slate-700">{cat}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-orange-700">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum item cadastrado.</p>
          )}
          {emManutencao > 0 && (
            <div className="border-t border-amber-100 bg-amber-50 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span><strong>{emManutencao}</strong> {emManutencao === 1 ? "item em manutenção" : "itens em manutenção"}</span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Tabela de itens */}
      <AssetGrid itens={itensFiltrados} deleteAction={deleteInventarioItem} restoreAction={restoreInventarioItem} />
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
