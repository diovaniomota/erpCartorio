import {
  AlertTriangle,
  CalendarClock,
  FileHeart,
  UserCheck,
  UserMinus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { getAtestados, getBeneficios, getFerias, getFuncionarios, getPonto } from "@/modules/rh/queries";
import { cn, formatCurrency } from "@/lib/utils";

type Tone = "violet" | "success" | "warning" | "danger" | "info" | "neutral";

const toneConf: Record<Tone, { text: string; border: string; icon: string; dot: string }> = {
  violet:  { text: "text-violet-700",  border: "border-l-violet-500",  icon: "text-violet-500",  dot: "bg-violet-500" },
  success: { text: "text-emerald-700", border: "border-l-emerald-500", icon: "text-emerald-500", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700",   border: "border-l-amber-500",   icon: "text-amber-500",   dot: "bg-amber-500" },
  danger:  { text: "text-red-700",     border: "border-l-red-500",     icon: "text-red-500",     dot: "bg-red-500" },
  info:    { text: "text-blue-700",    border: "border-l-blue-500",    icon: "text-blue-500",    dot: "bg-blue-500" },
  neutral: { text: "text-slate-600",   border: "border-l-slate-300",   icon: "text-slate-400",   dot: "bg-slate-400" },
};

export default async function RhPage() {
  const [funcionarios, atestados, ponto, ferias, beneficios] = await Promise.all([
    getFuncionarios(),
    getAtestados(),
    getPonto(),
    getFerias(),
    getBeneficios(),
  ]);

  const ativos    = funcionarios.filter((f) => f.status === "ativo");
  const ausentes  = funcionarios.filter((f) => ["afastado", "férias", "licença"].includes(f.status));
  const folha     = ativos.reduce((s, f) => s + Number(f.salario ?? 0), 0);
  const pendentes = atestados.filter((a) => a.status === "pendente").length;

  const hoje = new Date().toISOString().slice(0, 10);
  const feriasProg = ferias.filter((f) => f.status === "aprovada" || f.status === "pendente").length;

  const porSetor = Object.entries(
    ativos.reduce<Record<string, number>>((acc, f) => {
      const s = f.setor ?? "Sem setor";
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const pontoPorFunc = funcionarios.map((f) => ({
    ...f,
    ponto_count: ponto.filter((p) => p.funcionario_id === f.id).length,
    beneficios_count: beneficios.filter((b) => b.funcionario_id === f.id && b.ativo).length,
  }));

  return (
    <>
      <PageHeader
        title="RH administrativo"
        description="Funcionários, controle de ponto, atestados, férias e benefícios."
      />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total de funcionários" value={String(funcionarios.length)} sub={`${ativos.length} ativos`} icon={Users} tone="violet" />
        <KPICard label="Ativos" value={String(ativos.length)} sub="Em exercício" icon={UserCheck} tone="success" />
        <KPICard label="Ausentes" value={String(ausentes.length)} sub={ausentes.length > 0 ? "Afastados / férias / licença" : "Ninguém ausente"} icon={UserMinus} tone={ausentes.length > 0 ? "warning" : "success"} />
        <KPICard label="Folha estimada" value={formatCurrency(folha)} sub="Salários dos ativos" icon={FileHeart} tone="violet" />
      </div>

      {/* Status + Setores */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* Status breakdown */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Equipe</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Situação funcional</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
            {[
              { label: "Ativos",    count: ativos.length,      tone: "success" as Tone },
              { label: "Férias",    count: funcionarios.filter((f) => f.status === "férias").length,    tone: "info" as Tone },
              { label: "Afastados", count: funcionarios.filter((f) => f.status === "afastado").length,  tone: "warning" as Tone },
              { label: "Desligados",count: funcionarios.filter((f) => f.status === "desligado").length, tone: ausentes.length > 0 ? "danger" as Tone : "neutral" as Tone },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 py-4">
                <span className={cn("text-3xl font-bold tabular-nums", toneConf[s.tone].text)}>{s.count}</span>
                <span className="mt-1 text-xs text-slate-500">{s.label}</span>
                <span className={cn("mt-2 h-1 w-8 rounded-full", toneConf[s.tone].dot)} />
              </div>
            ))}
          </div>
        </section>

        {/* Setores */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Estrutura</p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900">Setores</h2>
          </div>
          {porSetor.length ? (
            <div className="divide-y divide-slate-100">
              {porSetor.map(([setor, count]) => (
                <div key={setor} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    <span className="text-sm text-slate-700">{setor}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-violet-700">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Nenhum funcionário cadastrado.</p>
          )}
          {(pendentes > 0 || feriasProg > 0) && (
            <div className="border-t border-amber-100 bg-amber-50 px-5 py-3 space-y-1">
              {pendentes > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span><strong>{pendentes}</strong> atestado{pendentes !== 1 ? "s" : ""} pendente{pendentes !== 1 ? "s" : ""}</span>
                </div>
              )}
              {feriasProg > 0 && (
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <CalendarClock className="h-3.5 w-3.5" />
                  <span><strong>{feriasProg}</strong> férias programada{feriasProg !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Tabela resumo de funcionários */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Visão geral</p>
          <h2 className="mt-0.5 text-base font-semibold text-slate-900">Funcionários</h2>
        </div>
        <div className="p-4">
          <DataTable
            data={pontoPorFunc as unknown as Record<string, unknown>[]}
            columns={[
              { key: "nome",             label: "Funcionário", hrefBase: "/rh/funcionarios" },
              { key: "cargo",            label: "Cargo" },
              { key: "setor",            label: "Setor" },
              { key: "ponto_count",      label: "Marcações" },
              { key: "beneficios_count", label: "Benefícios" },
              { key: "status",           label: "Status", format: "status" },
            ]}
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
