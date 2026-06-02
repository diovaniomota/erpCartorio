import {
  CheckCircle2,
  ShieldOff,
  UserCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { requirePermission } from "@/lib/auth";
import { listScopedRecords } from "@/lib/data";
import { cn } from "@/lib/utils";

type Tone = "amber" | "success" | "danger" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  amber:   { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

export default async function UsuariosPage() {
  await requirePermission("gerenciar_usuarios");

  const [profiles, perfis] = await Promise.all([
    listScopedRecords("profiles", { orderBy: "nome", ascending: true }),
    listScopedRecords("perfis",   { orderBy: "nome", ascending: true }),
  ]);

  const ativos    = profiles.filter((p) => p.ativo);
  const inativos  = profiles.filter((p) => !p.ativo);

  // Distribuição por setor
  const porSetor = Object.entries(
    ativos.reduce<Record<string, number>>((acc, p) => {
      const s = p.setor ?? "Sem setor";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  // Distribuição por cargo
  const porCargo = Object.entries(
    ativos.reduce<Record<string, number>>((acc, p) => {
      const c = p.cargo ?? "Sem cargo";
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Equipe com acesso ao sistema. Cada usuário é vinculado a um perfil de permissões."
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total de usuários"  value={String(profiles.length)}  sub={`${perfis.length} perfil${perfis.length !== 1 ? "is" : ""} de acesso`} icon={Users}     tone="amber" />
        <KPICard label="Usuários ativos"    value={String(ativos.length)}    sub="Com acesso ativo"    icon={UserCheck} tone="success" />
        <KPICard label="Inativos"           value={String(inativos.length)}  sub={inativos.length > 0 ? "Sem acesso" : "Todos ativos"} icon={ShieldOff} tone={inativos.length > 0 ? "danger" : "neutral"} />
        <KPICard label="Perfis de acesso"   value={String(perfis.length)}    sub="RBAC configurado"    icon={UserCog}   tone="amber" />
      </div>

      {/* Setor + Cargo */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Setor */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Estrutura</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Usuários por setor</h2>
          </div>
          {porSetor.length ? (
            <div className="divide-y divide-slate-100">
              {porSetor.map(([setor, count]) => (
                <div key={setor} className="flex items-center gap-3 px-5 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <span className="flex-1 text-sm text-slate-700">{setor}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${Math.round((count / ativos.length) * 100)}%` }}
                      />
                    </div>
                    <span className="w-4 text-right text-sm font-semibold tabular-nums text-amber-700">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum usuário ativo.</p>
          )}
        </section>

        {/* Cargos */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Hierarquia</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Usuários por cargo</h2>
          </div>
          {porCargo.length ? (
            <div className="divide-y divide-slate-100">
              {porCargo.map(([cargo, count]) => (
                <div key={cargo} className="flex items-center gap-3 px-5 py-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                  <span className="flex-1 text-sm text-slate-700">{cargo}</span>
                  <span className="text-sm font-semibold tabular-nums text-amber-700">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum cargo cadastrado.</p>
          )}
          {/* Ativo/Inativo resumo */}
          <div className="border-t border-slate-100 px-5 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-semibold text-emerald-600">Ativos</p>
                  <p className="text-lg font-bold text-emerald-700">{ativos.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
                <ShieldOff className="h-3.5 w-3.5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-500">Inativos</p>
                  <p className="text-lg font-bold text-slate-600">{inativos.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Lista de usuários */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cadastro</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Todos os usuários</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {profiles.length} usuários
          </span>
        </div>
        {/* User cards */}
        <div className="divide-y divide-slate-100">
          {profiles.map((p) => {
            const initials = p.nome
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((n: string) => n[0].toUpperCase())
              .join("");
            return (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/60">
                {/* Avatar */}
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  p.ativo ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500",
                )}>
                  {initials}
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{p.nome}</p>
                  <p className="truncate text-xs text-slate-400">{p.email}</p>
                </div>
                {/* Cargo/Setor */}
                <div className="hidden min-w-0 sm:block">
                  {p.cargo && <p className="truncate text-xs text-slate-600">{p.cargo}</p>}
                  {p.setor && <p className="truncate text-[10px] text-slate-400">{p.setor}</p>}
                </div>
                {/* Status */}
                <span className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  p.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                )}>
                  {p.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            );
          })}
        </div>
        {/* Fallback table for export */}
        <div className="border-t border-slate-100 p-4">
          <DataTable
            data={profiles as unknown as Record<string, unknown>[]}
            columns={[
              { key: "nome",   label: "Nome" },
              { key: "email",  label: "E-mail" },
              { key: "cargo",  label: "Cargo" },
              { key: "setor",  label: "Setor" },
              { key: "ativo",  label: "Ativo", format: "boolean" },
            ]}
            exportable
            exportFilename="usuarios"
            exportTitle="Usuários do sistema"
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
