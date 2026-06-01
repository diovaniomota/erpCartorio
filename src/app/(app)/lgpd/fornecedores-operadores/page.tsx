import {
  ExternalLink,
  FileCheck2,
  FileX2,
  ServerCog,
  ShieldCheck,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { createLgpdFornecedorOperador, deleteLgpdFornecedorOperador } from "@/modules/lgpd/actions";
import { getLgpdFornecedoresOperadores } from "@/modules/lgpd/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";
import { cn } from "@/lib/utils";

type Tone = "teal" | "success" | "warning" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  teal:    { text: "text-teal-700",    border: "border-l-teal-500",    icon: "text-teal-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

export default async function LgpdFornecedoresOperadoresPage() {
  const [operadores, fornecedores] = await Promise.all([getLgpdFornecedoresOperadores(), getFornecedores()]);

  const ativos      = operadores.filter((o) => o.status === "ativo");
  const inativos    = operadores.filter((o) => o.status !== "ativo").length;
  const comContrato = operadores.filter((o) => o.contrato_operador_url).length;
  const semContrato = operadores.filter((o) => !o.contrato_operador_url && o.status === "ativo");

  const fields: EntityField[] = [
    { name: "fornecedor_id", label: "Fornecedor", type: "select", options: fornecedores.map((f) => ({ label: f.nome, value: f.id })) },
    { name: "descricao_tratamento", label: "Descrição do tratamento", type: "textarea", required: true },
    { name: "dados_tratados",       label: "Dados tratados",          type: "textarea" },
    { name: "contrato_operador_url",label: "Contrato/DPA",            type: "url" },
    { name: "status",               label: "Status",                  defaultValue: "ativo" },
  ];

  return (
    <>
      <PageHeader
        title="Fornecedores operadores"
        description="Fornecedores que tratam dados pessoais em nome do cartório — contratos DPA e dados tratados."
        actions={<EntityFormDialog title="Novo operador" fields={fields} action={createLgpdFornecedorOperador} />}
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Operadores cadastrados" value={String(operadores.length)} sub={`${inativos} inativo${inativos !== 1 ? "s" : ""}`} icon={ServerCog} tone="teal" />
        <KPICard label="Ativos" value={String(ativos.length)} sub="Tratando dados agora" icon={ShieldCheck} tone="success" />
        <KPICard label="Com contrato/DPA" value={String(comContrato)} sub="Devidamente formalizados" icon={FileCheck2} tone={comContrato === ativos.length ? "success" : "warning"} />
        <KPICard label="Sem contrato" value={String(semContrato.length)} sub={semContrato.length > 0 ? "Ativos sem DPA" : "Todos formalizados"} icon={FileX2} tone={semContrato.length > 0 ? "danger" : "success"} />
      </div>

      {/* Alerta operadores sem contrato */}
      {semContrato.length > 0 && (
        <section className="rounded-xl border border-red-200 bg-white">
          <div className="flex items-center gap-3 border-b border-red-100 bg-red-50/60 px-5 py-4">
            <ShieldOff className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">Conformidade</p>
              <h2 className="text-base font-semibold text-red-900">Operadores ativos sem contrato/DPA</h2>
            </div>
            <span className="ml-auto rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
              {semContrato.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {semContrato.map((o) => (
              <div key={o.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <FileX2 className="h-4 w-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{o.fornecedor_nome ?? "Fornecedor não vinculado"}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{o.descricao_tratamento}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de operadores ativos */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <ServerCog className="h-4 w-4 text-teal-500" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Contratos</p>
            <h2 className="text-base font-semibold text-slate-900">Operadores ativos</h2>
          </div>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {ativos.length}
          </span>
        </div>
        {ativos.length ? (
          <div className="divide-y divide-slate-100">
            {ativos.map((o) => (
              <div key={o.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50">
                  <ServerCog className="h-4 w-4 text-teal-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{o.fornecedor_nome ?? "Fornecedor não vinculado"}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{o.descricao_tratamento}</p>
                  {o.dados_tratados && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">Dados: {o.dados_tratados}</p>
                  )}
                </div>
                {o.contrato_operador_url ? (
                  <a
                    href={o.contrato_operador_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
                  >
                    <ExternalLink className="h-3 w-3" /> DPA
                  </a>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
                    Sem DPA
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum operador ativo cadastrado.</p>
        )}
      </section>

      {/* Tabela completa */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cadastro</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todos os operadores</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {operadores.length} registros
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={operadores as unknown as Record<string, unknown>[]}
            columns={[
              { key: "fornecedor_nome",       label: "Fornecedor" },
              { key: "descricao_tratamento",  label: "Tratamento" },
              { key: "dados_tratados",        label: "Dados tratados" },
              { key: "contrato_operador_url", label: "Contrato" },
              { key: "status",                label: "Status", format: "status" },
            ]}
            deleteAction={deleteLgpdFornecedorOperador}
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
