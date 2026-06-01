import { notFound } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Mail,
  Phone,
  ShieldAlert,
  Tag,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { requirePermission } from "@/lib/auth";
import { getFuncionario, getAtestados, getFerias, getBeneficios } from "@/modules/rh/queries";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function FuncionarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requirePermission("ver_dados_rh");
  const { id } = await params;

  const [funcionario, atestados, ferias, beneficios] = await Promise.all([
    getFuncionario(id),
    getAtestados(),
    getFerias(),
    getBeneficios(),
  ]);

  if (!funcionario) notFound();

  const canSeeSensitive = context.permissions.includes("gerenciar_funcionarios");

  const funcAtestados = atestados.filter((a) => a.funcionario_id === id);
  const funcFerias    = ferias.filter((f) => f.funcionario_id === id);
  const funcBeneficios = beneficios.filter((b) => b.funcionario_id === id && b.ativo);
  const custoMensal   = funcBeneficios.reduce((s, b) => s + Number(b.valor ?? 0), 0);

  const cpfDisplay = canSeeSensitive && funcionario.cpf
    ? funcionario.cpf
    : funcionario.cpf
      ? `•••.•••.•••-${funcionario.cpf.replace(/\D/g, "").slice(-2)}`
      : null;

  return (
    <>
      <PageHeader
        title={funcionario.nome}
        description="Ficha administrativa com dados contratuais, histórico de atestados e férias."
      />

      {/* Hero card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Header strip */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-950 px-6 py-5 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Funcionário</p>
              {funcionario.tipo_contrato && (
                <code className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                  {funcionario.tipo_contrato}
                </code>
              )}
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">{funcionario.nome}</h2>
          </div>
          <StatusBadge status={funcionario.status} />
        </div>

        {/* Info grid */}
        <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-3">
          <InfoCell icon={Briefcase} label="Cargo"       value={funcionario.cargo} />
          <InfoCell icon={Tag}       label="Setor"       value={funcionario.setor} />
          <InfoCell icon={CalendarDays} label="Admissão" value={formatDate(funcionario.data_admissao)} />
          <InfoCell icon={ShieldAlert} label="CPF"       value={cpfDisplay} tone="neutral" />
          <InfoCell
            icon={CircleDollarSign}
            label="Salário"
            value={canSeeSensitive && funcionario.salario ? formatCurrency(funcionario.salario) : "Restrito"}
            tone={canSeeSensitive ? "violet" : "neutral"}
          />
          {funcionario.email   && <InfoCell icon={Mail}  label="E-mail"   value={funcionario.email} />}
          {funcionario.telefone && <InfoCell icon={Phone} label="Telefone" value={funcionario.telefone} />}
        </div>

        {funcionario.observacoes && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Observações</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-700">{funcionario.observacoes}</p>
          </div>
        )}
      </section>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-violet-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Atestados</p>
          <p className="mt-3 text-2xl font-bold text-violet-700">{funcAtestados.length}</p>
          <p className="mt-1 text-xs text-slate-400">
            {funcAtestados.filter((a) => a.status === "pendente").length} pendente(s)
          </p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-blue-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Férias</p>
          <p className="mt-3 text-2xl font-bold text-blue-700">{funcFerias.length}</p>
          <p className="mt-1 text-xs text-slate-400">
            {funcFerias.filter((f) => ["aprovada", "em andamento"].includes(f.status)).length} ativa(s)
          </p>
        </div>
        <div className="rounded-xl border border-l-4 border-slate-200 border-l-emerald-500 bg-white px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Benefícios ativos</p>
          <p className="mt-3 text-2xl font-bold text-emerald-700">{funcBeneficios.length}</p>
          <p className="mt-1 text-xs text-slate-400">
            {custoMensal > 0 ? `${formatCurrency(custoMensal)}/mês` : "Sem custo"}
          </p>
        </div>
      </div>

      {/* Benefícios */}
      {funcBeneficios.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <FileText className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Folha</p>
              <h2 className="text-base font-semibold text-slate-900">Benefícios ativos</h2>
            </div>
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {funcBeneficios.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {funcBeneficios.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-slate-700">{b.nome}</span>
                <span className="text-sm font-semibold text-emerald-700">{formatCurrency(Number(b.valor ?? 0))}/mês</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

type Tone = "violet" | "success" | "danger" | "warning" | "neutral";
const toneText: Record<Tone, string> = {
  violet:  "text-violet-700",
  success: "text-emerald-700",
  danger:  "text-red-700",
  warning: "text-amber-700",
  neutral: "text-slate-600",
};

function InfoCell({ icon: Icon, label, value, tone = "neutral" }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  tone?: Tone;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneText[tone])} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={cn("mt-1 text-sm font-medium", value ? "text-slate-900" : "text-slate-400")}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
