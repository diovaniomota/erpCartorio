import { addDays, isBefore, isSameDay, parseISO, startOfMonth } from "date-fns";
import { SEM_CATEGORIA } from "@/lib/constants";
import { getAgendaEventos } from "@/modules/agenda/queries";
import { getContratos } from "@/modules/contratos/queries";
import { getContasFinanceiras, getLivroCaixa } from "@/modules/financeiro/queries";
import { getFornecedores } from "@/modules/fornecedores/queries";
import { getInventarioItens } from "@/modules/inventario/queries";
import { getLgpdIncidentes } from "@/modules/lgpd/queries";
import { getOfficialUpdates } from "@/modules/central-oficial/queries";
import { getAtestados, getFuncionarios } from "@/modules/rh/queries";
import { getTasks } from "@/modules/tarefas/queries";

export async function getDashboardData() {
  const [
    contas,
    livroCaixa,
    contratos,
    funcionarios,
    atestados,
    tasks,
    officialUpdates,
    inventario,
    lgpdIncidentes,
    agenda,
    fornecedores,
  ] = await Promise.all([
    getContasFinanceiras(),
    getLivroCaixa(),
    getContratos(),
    getFuncionarios(),
    getAtestados(),
    getTasks(),
    getOfficialUpdates(),
    getInventarioItens(),
    getLgpdIncidentes(),
    getAgendaEventos(),
    getFornecedores(),
  ]);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const in30Days = addDays(today, 30);

  const contasVencendoHoje = contas.filter((conta) =>
    isSameDay(parseISO(conta.data_vencimento), today) &&
    ["aberta", "agendada"].includes(conta.status),
  );
  const contasVencidas = contas.filter((conta) =>
    isBefore(parseISO(conta.data_vencimento), today) &&
    ["aberta", "agendada", "vencida"].includes(conta.status),
  );
  const boletosAbertos = contas.filter((conta) => conta.codigo_barras && conta.status !== "paga");
  // "Em aberto" = all non-paid/non-cancelled bills, regardless of month.
  // Previously filtered by monthStart which returned R$0 when no bills existed
  // for the current month, diverging from the Financeiro total.
  const despesasMes = contas
    .filter((conta) => conta.tipo === "pagar" && !["paga", "cancelada"].includes(conta.status))
    .reduce((sum, conta) => sum + conta.valor, 0);
  const receitasMes = contas
    .filter((conta) => conta.tipo === "receber" && !["recebida", "cancelada"].includes(conta.status))
    .reduce((sum, conta) => sum + conta.valor, 0);
  const saldoCaixa = livroCaixa.reduce((sum, movimento) => {
    const sign = ["entrada", "ajuste"].includes(movimento.tipo) ? 1 : -1;
    return sum + movimento.valor * sign;
  }, 0);
  const contratosVencendo = contratos.filter((contrato) => {
    const vencimento = parseISO(contrato.data_vencimento);
    return vencimento <= in30Days && contrato.status !== "cancelado";
  });
  const tarefasAtrasadas = tasks.filter((task) =>
    task.data_prazo && isBefore(parseISO(task.data_prazo), today) && task.status !== "concluída",
  );
  const funcionariosAtivos = funcionarios.filter((funcionario) => funcionario.status === "ativo");
  const funcionariosAusentes = funcionarios.filter((funcionario) =>
    ["afastado", "férias", "licença"].includes(funcionario.status),
  );

  const stats = [
    { title: "Contas vencendo hoje", value: contasVencendoHoje.length, tone: "warning" as const },
    { title: "Contas vencidas", value: contasVencidas.length, tone: "danger" as const },
    { title: "Boletos em aberto", value: boletosAbertos.length, tone: "info" as const },
    { title: "Saldo do caixa", value: saldoCaixa, format: "currency" as const, tone: "success" as const },
    { title: "Despesas em aberto", value: despesasMes, format: "currency" as const, tone: "neutral" as const },
    { title: "Receitas em aberto", value: receitasMes, format: "currency" as const, tone: "success" as const },
    { title: "Contratos vencendo", value: contratosVencendo.length, tone: "warning" as const },
    { title: "Funcionários ativos", value: funcionariosAtivos.length, tone: "success" as const },
    { title: "Funcionários ausentes", value: funcionariosAusentes.length, tone: "warning" as const },
    { title: "Atestados recentes", value: atestados.length, tone: "neutral" as const },
    { title: "Férias próximas", value: funcionarios.filter((f) => f.status === "férias").length, tone: "info" as const },
    { title: "Tarefas atrasadas", value: tarefasAtrasadas.length, tone: "danger" as const },
    { title: "Comunicados não lidos", value: officialUpdates.filter((update) => update.status === "nova").length, tone: "info" as const },
    { title: "Pendências LGPD", value: lgpdIncidentes.filter((item) => item.status !== "concluído").length, tone: "danger" as const },
    { title: "Inventário em manutenção", value: inventario.filter((item) => item.status === "em manutenção").length, tone: "warning" as const },
  ];

  const group = <T extends { [key: string]: unknown }>(rows: T[], key: keyof T) =>
    Object.entries(
      rows.reduce<Record<string, number>>((acc, item) => {
        const label = String(item[key] ?? "Sem status");
        acc[label] = (acc[label] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

  const despesasPorCategoria = Object.entries(
    contas
      .filter((conta) => conta.tipo === "pagar")
      .reduce<Record<string, number>>((acc, conta) => {
        const categoria = conta.categoria_nome ?? SEM_CATEGORIA;
        acc[categoria] = (acc[categoria] ?? 0) + conta.valor;
        return acc;
      }, {}),
  ).map(([name, value]) => ({ name, value }));

  return {
    stats,
    charts: {
      despesasPorCategoria,
      contasPorStatus: group(contas, "status"),
      tarefasPorPrioridade: group(tasks, "prioridade"),
      funcionariosPorStatus: group(funcionarios, "status"),
      contratosPorStatus: group(contratos, "status"),
    },
    agenda,
    tarefasAtrasadas,
    comunicadosImportantes: officialUpdates.filter((item) => item.importante),
    fornecedores,
  };
}
