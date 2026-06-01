import Link from "next/link";
import {
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export function SupplierDirectory({
  fornecedores,
  deleteAction,
}: {
  fornecedores: Fornecedor[];
  deleteAction: DeleteAction;
}) {
  const ativos = fornecedores.filter((fornecedor) => fornecedor.status === "ativo").length;
  const categorias = Array.from(new Set(fornecedores.map((fornecedor) => fornecedor.categoria).filter(Boolean))).length;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Lista de fornecedores</h2>
          <p className="text-sm text-slate-500">Contatos e responsáveis em linhas para leitura rápida.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="inline-flex items-baseline gap-1">
            <span className="font-semibold text-slate-950">{ativos}</span> ativos
          </span>
          <span className="inline-flex items-baseline gap-1">
            <span className="font-semibold text-slate-950">{categorias}</span> categorias
          </span>
          <span className="inline-flex items-baseline gap-1">
            <span className="font-semibold text-slate-950">{fornecedores.length}</span> registros
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-60">Fornecedor</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="min-w-48">Contato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="min-w-56">E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fornecedores.length ? fornecedores.map((fornecedor) => (
              <TableRow key={fornecedor.id} className="border-slate-100 hover:bg-cyan-50/[0.45]">
                <TableCell>
                  <Link
                    href={`/fornecedores/${fornecedor.id}`}
                    prefetch={false}
                    className="font-semibold text-slate-950 underline-offset-4 hover:text-cyan-800 hover:underline"
                  >
                    {fornecedor.nome}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{fornecedor.categoria || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{fornecedor.documento || "-"}</TableCell>
                <TableCell className="text-slate-700">{fornecedor.contato_responsavel || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{fornecedor.telefone || "-"}</TableCell>
                <TableCell className="text-slate-700">{fornecedor.email || "-"}</TableCell>
                <TableCell><StatusBadge status={fornecedor.status} /></TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/fornecedores/${fornecedor.id}`}
                      prefetch={false}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-cyan-800 transition-colors hover:bg-cyan-50"
                      title="Abrir ficha"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">Abrir ficha</span>
                    </Link>
                    <DeleteButton id={fornecedor.id} action={deleteAction} />
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-sm text-slate-500">
                  Nenhum fornecedor cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function ContractPipeline({
  contratos,
  deleteAction,
}: {
  contratos: Contrato[];
  deleteAction: DeleteAction;
}) {
  const vigentes = contratos.filter((contrato) => ["vigente", "renovado"].includes(contrato.status)).length;
  const atencao = contratos.filter((contrato) => ["a vencer", "suspenso"].includes(contrato.status)).length;
  const encerrados = contratos.filter((contrato) => ["vencido", "cancelado"].includes(contrato.status)).length;

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de contratos"
        description="Contratos em linha, com fornecedor, valores e vencimentos visíveis sem abrir cartões."
        metrics={[
          { label: "vigentes", value: String(vigentes) },
          { label: "atenção", value: String(atencao) },
          { label: "encerrados", value: String(encerrados) },
          { label: "registros", value: String(contratos.length) },
        ]}
      />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-64">Contrato</TableHead>
              <TableHead className="min-w-52">Fornecedor</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Valor mensal</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Reajuste</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contratos.length ? contratos.map((contrato) => (
              <TableRow key={contrato.id} className="border-slate-100 hover:bg-indigo-50/[0.40]">
                <TableCell>
                  <Link href={`/contratos/${contrato.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-indigo-700 hover:underline">
                    {contrato.nome}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{contrato.fornecedor_nome ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{contrato.numero ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-950">{formatCurrency(Number(contrato.valor ?? 0))}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(contrato.data_inicio)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(contrato.data_vencimento)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{contrato.indice_reajuste ?? "-"}</TableCell>
                <TableCell><StatusBadge status={contrato.status} /></TableCell>
                <TableCell className="text-right"><DeleteButton id={contrato.id} action={deleteAction} /></TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={9} text="Nenhum contrato cadastrado." />}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function FinancialLedger({
  contas,
  deleteAction,
}: {
  contas: FinanceiroConta[];
  deleteAction: DeleteAction;
}) {
  const totalPagar = contas.filter((conta) => conta.tipo === "pagar").reduce((sum, conta) => sum + Number(conta.valor ?? 0), 0);
  const totalReceber = contas.filter((conta) => conta.tipo === "receber").reduce((sum, conta) => sum + Number(conta.valor ?? 0), 0);
  const vencidas = contas.filter((conta) => conta.status === "vencida").length;

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de contas"
        description="Contas financeiras em formato operacional, com vencimento, valor e fornecedor na mesma linha."
        metrics={[
          { label: "a pagar", value: formatCurrency(totalPagar) },
          { label: "a receber", value: formatCurrency(totalReceber) },
          { label: "vencidas", value: String(vencidas) },
          { label: "registros", value: String(contas.length) },
        ]}
      />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-72">Conta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="min-w-44">Categoria</TableHead>
              <TableHead className="min-w-52">Fornecedor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas.length ? contas.map((conta) => (
              <TableRow key={conta.id} className="border-slate-100 hover:bg-blue-50/[0.40]">
                <TableCell>
                  <p className="font-semibold text-slate-950">{conta.descricao}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {conta.recorrente ? <Badge variant="outline">recorrente</Badge> : null}
                    {conta.codigo_barras ? <Badge variant="outline">boleto</Badge> : null}
                  </div>
                </TableCell>
                <TableCell><Badge variant={conta.tipo === "receber" ? "info" : "secondary"}>{conta.tipo}</Badge></TableCell>
                <TableCell className="text-slate-700">{conta.categoria_nome ?? conta.centro_custo ?? "-"}</TableCell>
                <TableCell className="text-slate-700">{conta.fornecedor_nome ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(conta.data_vencimento)}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-950">{formatCurrency(Number(conta.valor ?? 0))}</TableCell>
                <TableCell><StatusBadge status={conta.status} /></TableCell>
                <TableCell className="text-right"><DeleteButton id={conta.id} action={deleteAction} /></TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={8} text="Nenhuma conta encontrada." />}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function StaffDirectory({
  funcionarios,
  deleteAction,
}: {
  funcionarios: Funcionario[];
  deleteAction: DeleteAction;
}) {
  const ativos = funcionarios.filter((funcionario) => funcionario.status === "ativo").length;
  const ausentes = funcionarios.filter((funcionario) => ["afastado", "férias", "licença"].includes(funcionario.status)).length;

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de funcionários"
        description="Equipe em linhas com cargo, setor, contato, admissão e situação."
        metrics={[
          { label: "ativos", value: String(ativos) },
          { label: "ausentes", value: String(ausentes) },
          { label: "registros", value: String(funcionarios.length) },
        ]}
      />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-60">Funcionário</TableHead>
              <TableHead className="min-w-52">Cargo</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="min-w-56">E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Salário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcionarios.length ? funcionarios.map((funcionario) => (
              <TableRow key={funcionario.id} className="border-slate-100 hover:bg-rose-50/[0.35]">
                <TableCell>
                  <Link href={`/rh/funcionarios/${funcionario.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-rose-700 hover:underline">
                    {funcionario.nome}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">{funcionario.cpf ?? "CPF não informado"}</p>
                </TableCell>
                <TableCell className="text-slate-700">{funcionario.cargo}</TableCell>
                <TableCell className="text-slate-700">{funcionario.setor}</TableCell>
                <TableCell className="text-slate-700">{funcionario.email ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{funcionario.telefone ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(funcionario.data_admissao)}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-950">{formatCurrency(Number(funcionario.salario ?? 0))}</TableCell>
                <TableCell><StatusBadge status={funcionario.status} /></TableCell>
                <TableCell className="text-right"><DeleteButton id={funcionario.id} action={deleteAction} /></TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={9} text="Nenhum funcionário cadastrado." />}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function DocumentLibrary({
  docs,
  deleteAction,
}: {
  docs: DocumentoInterno[];
  deleteAction: DeleteAction;
}) {
  const folders = Array.from(new Set(docs.map((doc) => doc.pasta ?? doc.categoria).filter(Boolean)));
  const vencidos = docs.filter((doc) => doc.status === "vencido").length;

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de documentos"
        description="Arquivo interno em linhas com pasta, validade, acesso e vínculo."
        metrics={[
          { label: "pastas", value: String(folders.length) },
          { label: "vencidos", value: String(vencidos) },
          { label: "registros", value: String(docs.length) },
        ]}
      />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-72">Documento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Pasta</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Acesso</TableHead>
              <TableHead>Vínculo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.length ? docs.map((doc) => (
              <TableRow key={doc.id} className="border-slate-100 hover:bg-slate-50">
                <TableCell>
                  <Link href={`/documentos/${doc.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-slate-700 hover:underline">
                    {doc.titulo}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{doc.categoria}</TableCell>
                <TableCell className="text-slate-700">{doc.pasta ?? "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(doc.validade_em)}</TableCell>
                <TableCell><StatusBadge status={doc.acesso} /></TableCell>
                <TableCell className="text-slate-700">{doc.vinculo_tipo ?? "-"}</TableCell>
                <TableCell><StatusBadge status={doc.status} /></TableCell>
                <TableCell className="text-right"><DeleteButton id={doc.id} action={deleteAction} /></TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={8} text="Nenhum documento interno cadastrado." />}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function AssetGrid({
  itens,
  deleteAction,
}: {
  itens: InventarioItem[];
  deleteAction: DeleteAction;
}) {
  const emManutencao = itens.filter((item) => item.status === "em manutenção").length;
  const patrimonio = itens.reduce((sum, item) => sum + Number(item.valor_compra ?? 0), 0);

  return (
    <section className="space-y-3">
      <ListSummary
        title="Lista de patrimônio"
        description="Itens do inventário em linha com localização, valor, garantia e status."
        metrics={[
          { label: "itens", value: String(itens.length) },
          { label: "em manutenção", value: String(emManutencao) },
          { label: "patrimônio", value: formatCurrency(patrimonio) },
        ]}
      />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Patrimônio</TableHead>
              <TableHead className="min-w-72">Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Compra</TableHead>
              <TableHead>Garantia</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.length ? itens.map((item) => (
              <TableRow key={item.id} className="border-slate-100 hover:bg-orange-50/[0.35]">
                <TableCell className="whitespace-nowrap font-medium text-orange-700">{item.codigo_patrimonio}</TableCell>
                <TableCell>
                  <Link href={`/inventario/${item.id}`} prefetch={false} className="font-semibold text-slate-950 underline-offset-4 hover:text-orange-700 hover:underline">
                    {item.nome}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{item.categoria}</TableCell>
                <TableCell className="text-slate-700">{item.localizacao}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-950">{formatCurrency(Number(item.valor_compra ?? 0))}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(item.data_compra)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(item.garantia_ate)}</TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{item.numero_serie ?? "-"}</TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell className="text-right"><DeleteButton id={item.id} action={deleteAction} /></TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={10} text="Nenhum item de patrimônio cadastrado." />}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

export function OfficialFeed({
  updates,
  deleteAction,
}: {
  updates: OfficialUpdate[];
  deleteAction: DeleteAction;
}) {
  const destaque = updates[0];
  const importantes = updates.filter((update) => update.importante).length;
  const emAnalise = updates.filter((update) => update.status === "em análise").length;
  const criticas = updates.filter((update) => update.relevancia === "crítica").length;

  return (
    <section className="space-y-3">
      <ListSummary
        title="Fila oficial"
        description={destaque ? `Destaque atual: ${destaque.titulo}` : "Publicações oficiais em linha para triagem rápida."}
        metrics={[
          { label: "total", value: String(updates.length) },
          { label: "importantes", value: String(importantes) },
          { label: "críticas", value: String(criticas) },
          { label: "em análise", value: String(emAnalise) },
        ]}
      />
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-96">Publicação</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Relevância</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Publicado</TableHead>
              <TableHead>Importante</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="w-16 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.length ? updates.map((update) => (
              <TableRow key={update.id} className="border-slate-100 hover:bg-amber-50/[0.35]">
                <TableCell>
                  <p className="font-semibold text-slate-950">{update.titulo}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{update.resumo ?? update.conteudo ?? "-"}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{update.orgao}</TableCell>
                <TableCell><StatusBadge status={update.tipo} /></TableCell>
                <TableCell><StatusBadge status={update.relevancia} /></TableCell>
                <TableCell><StatusBadge status={update.status} /></TableCell>
                <TableCell className="whitespace-nowrap text-slate-700">{formatDate(update.publicado_em)}</TableCell>
                <TableCell>{update.importante ? <Badge variant="warning">sim</Badge> : <span className="text-slate-500">não</span>}</TableCell>
                <TableCell>
                  {update.url_original ? (
                    <Link href={update.url_original} target="_blank" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:underline">
                      abrir <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : <span className="text-slate-500">-</span>}
                </TableCell>
                <TableCell className="text-right"><DeleteButton id={update.id} action={deleteAction} /></TableCell>
              </TableRow>
            )) : <EmptyTableRow colSpan={9} text="Nenhuma publicação nesta visualização." />}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function ListSummary({
  title,
  description,
  metrics,
}: {
  title: string;
  description: string;
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
        {metrics.map((metric) => (
          <span key={metric.label} className="inline-flex items-baseline gap-1">
            <span className="font-semibold text-slate-950">{metric.value}</span> {metric.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyTableRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-slate-500">
        {text}
      </TableCell>
    </TableRow>
  );
}
