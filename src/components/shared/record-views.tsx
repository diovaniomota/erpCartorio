import Link from "next/link";
import {
  Archive,
  BriefcaseBusiness,
  CalendarClock,
  ExternalLink,
  FileText,
  FolderOpen,
  RadioTower,
  Mail,
  Package,
  Phone,
  UserRound,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  ActionResult,
  Contrato,
  DocumentoInterno,
  FinanceiroConta,
  Fornecedor,
  Funcionario,
  InventarioItem,
  OfficialUpdate,
} from "@/lib/types";

type DeleteAction = (id: string) => Promise<ActionResult>;

export function SupplierDirectory({ fornecedores, deleteAction }: { fornecedores: Fornecedor[]; deleteAction: DeleteAction }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {fornecedores.map((fornecedor) => (
        <article key={fornecedor.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
          <div className="border-b bg-slate-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/fornecedores/${fornecedor.id}`} className="truncate text-base font-semibold text-slate-950 hover:text-primary">
                  {fornecedor.nome}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{fornecedor.categoria}</p>
              </div>
              <StatusBadge status={fornecedor.status} />
            </div>
          </div>
          <div className="space-y-3 p-4 text-sm">
            <InfoLine icon={BriefcaseBusiness} value={fornecedor.documento ?? "Documento não informado"} />
            <InfoLine icon={Mail} value={fornecedor.email ?? "E-mail não informado"} />
            <InfoLine icon={Phone} value={fornecedor.telefone ?? "Telefone não informado"} />
            <InfoLine icon={UserRound} value={fornecedor.contato_responsavel ?? "Contato não informado"} />
          </div>
          <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">
            <Link href={`/fornecedores/${fornecedor.id}`} className="text-sm font-semibold text-primary hover:underline">
              Abrir cadastro
            </Link>
            <DeleteButton id={fornecedor.id} action={deleteAction} />
          </div>
        </article>
      ))}
    </section>
  );
}

export function ContractPipeline({ contratos, deleteAction }: { contratos: Contrato[]; deleteAction: DeleteAction }) {
  const buckets = [
    { label: "Vigentes", statuses: ["vigente", "renovado"] },
    { label: "Atenção", statuses: ["a vencer", "suspenso"] },
    { label: "Encerrados", statuses: ["vencido", "cancelado"] },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {buckets.map((bucket) => {
        const items = contratos.filter((contrato) => bucket.statuses.includes(contrato.status));
        return (
          <div key={bucket.label} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-950">{bucket.label}</h2>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <div className="space-y-3">
              {items.map((contrato) => (
                <article key={contrato.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/contratos/${contrato.id}`} className="font-semibold text-slate-950 hover:text-primary">
                      {contrato.nome}
                    </Link>
                    <StatusBadge status={contrato.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{contrato.fornecedor_nome ?? "Fornecedor não vinculado"}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <MetricBox label="Valor" value={formatCurrency(Number(contrato.valor ?? 0))} />
                    <MetricBox label="Vencimento" value={formatDate(contrato.data_vencimento)} />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">{contrato.numero ?? "Sem número"}</span>
                    <DeleteButton id={contrato.id} action={deleteAction} />
                  </div>
                </article>
              ))}
              {!items.length ? <EmptyPanel text="Nenhum contrato nesta etapa." /> : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function FinancialLedger({ contas, deleteAction }: { contas: FinanceiroConta[]; deleteAction: DeleteAction }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="grid border-b bg-[#0e1d42] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.6fr_3rem]">
        <span>Conta</span>
        <span>Fornecedor</span>
        <span>Vencimento</span>
        <span>Valor</span>
        <span>Status</span>
        <span />
      </div>
      {contas.map((conta) => (
        <div key={conta.id} className="grid gap-3 border-b px-4 py-4 last:border-b-0 hover:bg-blue-50/35 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.6fr_3rem] md:items-center">
          <div>
            <p className="font-semibold text-slate-950">{conta.descricao}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant={conta.tipo === "receber" ? "info" : "secondary"}>{conta.tipo}</Badge>
              {conta.recorrente ? <Badge variant="outline">recorrente</Badge> : null}
              {conta.codigo_barras ? <Badge variant="outline">boleto</Badge> : null}
            </div>
          </div>
          <span className="text-sm text-slate-600">{conta.fornecedor_nome ?? conta.centro_custo ?? "-"}</span>
          <span className="flex items-center gap-2 text-sm text-slate-700">
            <CalendarClock className="h-4 w-4 text-slate-400" />
            {formatDate(conta.data_vencimento)}
          </span>
          <span className="text-sm font-semibold text-slate-950">{formatCurrency(Number(conta.valor ?? 0))}</span>
          <StatusBadge status={conta.status} />
          <DeleteButton id={conta.id} action={deleteAction} />
        </div>
      ))}
    </section>
  );
}

export function StaffDirectory({ funcionarios, deleteAction }: { funcionarios: Funcionario[]; deleteAction: DeleteAction }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {funcionarios.map((funcionario) => (
        <article key={funcionario.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 font-semibold text-rose-700 ring-1 ring-rose-100">
                {initials(funcionario.nome)}
              </div>
              <div className="min-w-0">
                <Link href={`/rh/funcionarios/${funcionario.id}`} className="truncate font-semibold text-slate-950 hover:text-primary">
                  {funcionario.nome}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{funcionario.cargo}</p>
              </div>
            </div>
            <DeleteButton id={funcionario.id} action={deleteAction} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <InfoLine icon={BriefcaseBusiness} value={funcionario.setor} />
            <InfoLine icon={CalendarClock} value={`Admissão ${formatDate(funcionario.data_admissao)}`} />
            <InfoLine icon={Mail} value={funcionario.email ?? "E-mail não informado"} />
          </div>
          <div className="mt-4 border-t pt-3">
            <StatusBadge status={funcionario.status} />
          </div>
        </article>
      ))}
    </section>
  );
}

export function DocumentLibrary({ docs, deleteAction }: { docs: DocumentoInterno[]; deleteAction: DeleteAction }) {
  const folders = Array.from(new Set(docs.map((doc) => doc.pasta ?? doc.categoria)));

  return (
    <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pastas</p>
        <div className="mt-3 space-y-2">
          {folders.map((folder) => (
            <div key={folder} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <FolderOpen className="h-4 w-4 text-slate-500" />
                <span className="truncate">{folder}</span>
              </span>
              <Badge variant="secondary">{docs.filter((doc) => (doc.pasta ?? doc.categoria) === folder).length}</Badge>
            </div>
          ))}
        </div>
      </aside>
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <article key={doc.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/documentos/${doc.id}`} className="font-semibold text-slate-950 hover:text-primary">
                  {doc.titulo}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{doc.categoria}</p>
              </div>
              <FileText className="h-5 w-5 shrink-0 text-slate-400" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={doc.status} />
              <StatusBadge status={doc.acesso} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <MetricBox label="Pasta" value={doc.pasta ?? "-"} />
              <MetricBox label="Validade" value={formatDate(doc.validade_em)} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-xs text-muted-foreground">{doc.vinculo_tipo ?? "sem vínculo"}</span>
              <DeleteButton id={doc.id} action={deleteAction} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AssetGrid({ itens, deleteAction }: { itens: InventarioItem[]; deleteAction: DeleteAction }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {itens.map((item) => (
        <article key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
          <div className="flex h-28 items-center justify-center bg-slate-100">
            {item.status === "em manutenção" ? <Wrench className="h-9 w-9 text-amber-600" /> : item.status === "baixado" ? <Archive className="h-9 w-9 text-slate-500" /> : <Package className="h-9 w-9 text-orange-600" />}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/inventario/${item.id}`} className="font-semibold text-slate-950 hover:text-primary">
                  {item.nome}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">{item.codigo_patrimonio}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <MetricBox label="Categoria" value={item.categoria} />
              <MetricBox label="Valor" value={formatCurrency(Number(item.valor_compra ?? 0))} />
              <MetricBox label="Local" value={item.localizacao} />
              <MetricBox label="Garantia" value={formatDate(item.garantia_ate)} />
            </div>
          </div>
          <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">
            <span className="text-xs text-muted-foreground">{item.numero_serie ?? "sem série"}</span>
            <DeleteButton id={item.id} action={deleteAction} />
          </div>
        </article>
      ))}
    </section>
  );
}

export function OfficialFeed({ updates, deleteAction }: { updates: OfficialUpdate[]; deleteAction: DeleteAction }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {updates.map((update) => (
          <article key={update.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
            <div className="flex flex-col gap-4 border-b bg-slate-50 px-4 py-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={update.tipo} />
                  <StatusBadge status={update.relevancia} />
                  {update.importante ? <Badge variant="warning">importante</Badge> : null}
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-950">{update.titulo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{update.resumo ?? "Sem resumo cadastrado."}</p>
              </div>
              <DeleteButton id={update.id} action={deleteAction} />
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-[1fr_220px]">
              <p className="line-clamp-4 text-sm leading-6 text-slate-700">{update.conteudo ?? update.resumo ?? "-"}</p>
              <div className="space-y-2 rounded-lg border bg-slate-50 p-3 text-sm">
                <MetricBox label="Órgão" value={update.orgao} />
                <MetricBox label="Publicado" value={formatDate(update.publicado_em)} />
                <MetricBox label="Status" value={update.status} />
                {update.url_original ? (
                  <Link href={update.url_original} target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    Abrir origem
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {!updates.length ? <EmptyPanel text="Nenhuma publicação nesta visualização." /> : null}
      </div>
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
            <RadioTower className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-950">Monitoramento</p>
            <p className="text-xs text-muted-foreground">Triagem manual de publicações oficiais.</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <MetricBox label="Publicações" value={String(updates.length)} />
          <MetricBox label="Importantes" value={String(updates.filter((update) => update.importante).length)} />
          <MetricBox label="Em análise" value={String(updates.filter((update) => update.status === "em análise").length)} />
        </div>
      </aside>
    </section>
  );
}

function InfoLine({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <p className="flex min-w-0 items-center gap-2 text-slate-600">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="truncate">{value}</span>
    </p>
  );
}

function MetricBox({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-950">{value || "-"}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed bg-white/70 p-4 text-center text-sm text-muted-foreground">{text}</div>;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
