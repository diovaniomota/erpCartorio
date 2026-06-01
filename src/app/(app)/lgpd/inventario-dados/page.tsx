import {
  Database,
  Scale,
  Share2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { createLgpdInventarioDado, deleteLgpdInventarioDado } from "@/modules/lgpd/actions";
import { getLgpdInventarioDados } from "@/modules/lgpd/queries";
import { getFuncionarios } from "@/modules/rh/queries";
import { cn } from "@/lib/utils";

type Tone = "teal" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  teal:    { text: "text-teal-700",    border: "border-l-teal-500",    icon: "text-teal-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function LgpdInventarioDadosPage() {
  const [inventario, funcionarios] = await Promise.all([getLgpdInventarioDados(), getFuncionarios()]);

  const basesLegais    = [...new Set(inventario.map((i) => i.base_legal).filter(Boolean))];
  const compartilhados = inventario.filter((i) => i.compartilhamento).length;
  const categorias     = [...new Set(inventario.map((i) => i.categoria_dado).filter(Boolean))];

  // Breakdown por base legal
  const porBaseLegal = Object.entries(
    inventario.reduce<Record<string, number>>((acc, i) => {
      const b = i.base_legal ?? "Não informada";
      acc[b] = (acc[b] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const fields: EntityField[] = [
    { name: "processo",       label: "Processo",          required: true },
    { name: "categoria_dado", label: "Categoria de dado", required: true },
    { name: "base_legal",     label: "Base legal",        required: true },
    { name: "finalidade",     label: "Finalidade",        type: "textarea", required: true },
    { name: "retencao",       label: "Retenção" },
    { name: "compartilhamento", label: "Compartilhamento", type: "textarea" },
    { name: "responsavel_id", label: "Responsável", type: "select", options: funcionarios.map((f) => ({ label: f.nome, value: f.id })) },
  ];

  return (
    <>
      <PageHeader
        title="Inventário de dados"
        description="Mapeamento de processos, categorias de dados pessoais, bases legais, finalidade, retenção e compartilhamentos."
        actions={<EntityFormDialog title="Novo item de inventário" fields={fields} action={createLgpdInventarioDado} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Processos mapeados" value={String(inventario.length)} sub="Total no inventário" icon={Database} tone="teal" />
        <KPICard label="Bases legais"       value={String(basesLegais.length)} sub="Distintas" icon={Scale} tone="success" />
        <KPICard label="Com compartilhamento" value={String(compartilhados)} sub="Dados compartilhados" icon={Share2} tone={compartilhados > 0 ? "warning" : "neutral"} />
        <KPICard label="Categorias" value={String(categorias.length)} sub="Tipos de dado" icon={ShieldCheck} tone="teal" />
      </div>

      {/* Processos + breakdown bases legais */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Processos por categoria */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Mapeamento</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Processos por categoria</h2>
          </div>
          {inventario.length ? (
            <div className="divide-y divide-slate-100">
              {inventario.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{item.processo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.categoria_dado}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                      {item.base_legal}
                    </span>
                    {item.compartilhamento && (
                      <p className="mt-1 text-[10px] text-amber-600 flex items-center justify-end gap-1">
                        <Share2 className="h-2.5 w-2.5" /> Compartilhado
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {inventario.length > 8 && (
                <p className="px-5 py-3 text-xs text-slate-400">+ {inventario.length - 8} itens — veja a tabela abaixo</p>
              )}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum processo mapeado.</p>
          )}
        </section>

        {/* Bases legais */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">LGPD</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Bases legais</h2>
          </div>
          {porBaseLegal.length ? (
            <div className="divide-y divide-slate-100">
              {porBaseLegal.map(([base, count]) => (
                <div key={base} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    <span className="text-sm text-slate-700">{base}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-teal-700">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhuma base legal cadastrada.</p>
          )}
        </section>
      </div>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Inventário completo</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todos os processos</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {inventario.length} processos
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={inventario as unknown as Record<string, unknown>[]}
            columns={[
              { key: "processo",        label: "Processo" },
              { key: "categoria_dado",  label: "Categoria" },
              { key: "base_legal",      label: "Base legal" },
              { key: "finalidade",      label: "Finalidade" },
              { key: "responsavel_nome",label: "Responsável" },
            ]}
            deleteAction={deleteLgpdInventarioDado}
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
