import {
  KeyRound,
  Layers,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { requirePermission } from "@/lib/auth";
import { listScopedRecords } from "@/lib/data";
import { cn } from "@/lib/utils";

type Tone = "amber" | "success" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string }> = {
  amber:   { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400" },
};

// Cores por módulo
const moduloCor: Record<string, string> = {
  financeiro:   "#10b981",
  rh:           "#7c3aed",
  contratos:    "#3b82f6",
  inventario:   "#f97316",
  lgpd:         "#0d9488",
  tarefas:      "#6366f1",
  documentos:   "#0ea5e9",
  usuarios:     "#d97706",
  agenda:       "#ec4899",
  configuracoes:"#64748b",
};

export default async function PermissoesPage() {
  await requirePermission("gerenciar_usuarios");

  const [permissions, perfis] = await Promise.all([
    listScopedRecords("permissoes", { orderBy: "modulo", ascending: true }),
    listScopedRecords("perfis",     { orderBy: "nome",   ascending: true }),
  ]);

  // Agrupamento por módulo
  const porModulo = Object.entries(
    permissions.reduce<Record<string, typeof permissions>>((acc, p) => {
      const m = p.modulo ?? "geral";
      acc[m] = acc[m] ?? [];
      acc[m].push(p);
      return acc;
    }, {}),
  ).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <>
      <PageHeader
        title="Perfis e permissões"
        description="Controle de acesso baseado em papéis (RBAC) — permissões por módulo e perfis de usuário."
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <KPICard label="Total de permissões" value={String(permissions.length)} sub="Chaves RBAC" icon={KeyRound} tone="amber" />
        <KPICard label="Módulos cobertos"    value={String(porModulo.length)}   sub="Com permissões definidas" icon={Layers} tone="success" />
        <KPICard label="Perfis de acesso"    value={String(perfis.length)}      sub="Grupos de permissões" icon={ShieldCheck} tone="neutral" />
      </div>

      {/* Perfis de acesso */}
      {perfis.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">RBAC</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Perfis de acesso</h2>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {perfis.map((perfil) => (
              <div key={perfil.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Shield className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{perfil.nome}</p>
                  {perfil.descricao && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{perfil.descricao}</p>
                  )}
                  {perfil.sistema && (
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Sistema
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Permissões agrupadas por módulo */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Controle de acesso</p>
          <h2 className="mt-0.5 text-base font-semibold text-slate-900">Permissões por módulo</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {porModulo.map(([modulo, perms]) => {
            const cor = moduloCor[modulo.toLowerCase()] ?? "#94a3b8";
            return (
              <div key={modulo} className="px-5 py-4">
                {/* Módulo header */}
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${cor}18` }}
                  >
                    <Shield className="h-3.5 w-3.5" style={{ color: cor }} />
                  </div>
                  <h3 className="text-sm font-semibold capitalize text-slate-800">{modulo}</h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${cor}18`, color: cor }}
                  >
                    {perms.length}
                  </span>
                </div>
                {/* Permission chips */}
                <div className="flex flex-wrap gap-2">
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className="group relative flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5"
                      title={perm.descricao}
                    >
                      <KeyRound className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="text-xs font-mono text-slate-700">{perm.chave}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabela exportável */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Exportação</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todas as permissões</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {permissions.length} chaves
          </span>
        </div>
        <div className="p-4">
          <DataTable
            data={permissions as unknown as Record<string, unknown>[]}
            columns={[
              { key: "chave",     label: "Permissão" },
              { key: "modulo",    label: "Módulo" },
              { key: "descricao", label: "Descrição" },
            ]}
            exportable
            exportFilename="permissoes-rbac"
            exportTitle="Permissões RBAC"
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
