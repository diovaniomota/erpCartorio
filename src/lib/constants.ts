export const SEM_CATEGORIA = "Sem categoria";

export const PERMISSIONS = [
  "ver_dashboard",
  "gerenciar_central_oficial",
  "gerenciar_financeiro",
  "aprovar_pagamentos",
  "gerenciar_fornecedores",
  "gerenciar_contratos",
  "gerenciar_inventario",
  "gerenciar_funcionarios",
  "ver_dados_rh",
  "gerenciar_ponto",
  "aprovar_ajustes_ponto",
  "gerenciar_lgpd",
  "ver_documentos_internos",
  "enviar_documentos",
  "gerenciar_tarefas",
  "usar_chat",
  "ver_relatorios",
  "gerenciar_usuarios",
  "ver_auditoria",
  "gerenciar_configuracoes",
] as const;

export const FINANCIAL_CATEGORIES = [
  "aluguel",
  "energia",
  "água",
  "internet",
  "telefone",
  "sistema",
  "contabilidade",
  "folha de pagamento",
  "benefícios",
  "material de escritório",
  "manutenção",
  "limpeza",
  "segurança",
  "impostos",
  "fornecedores",
  "outros",
] as const;

export const TASK_PRIORITIES = ["baixa", "média", "alta", "urgente"] as const;

export const TASK_STATUSES = [
  "aberta",
  "em andamento",
  "aguardando terceiro",
  "em revisão",
  "concluída",
  "cancelada",
  "atrasada",
] as const;

export const EVENT_TYPES = [
  "reunião",
  "boleto",
  "contrato",
  "férias",
  "atestado",
  "LGPD",
  "tarefa",
  "tribunal",
  "manutenção",
  "treinamento",
  "manual",
] as const;

export const OFFICIAL_UPDATE_TYPES = [
  "notícia",
  "comunicado",
  "provimento",
  "publicação oficial",
  "alerta",
  "norma",
  "portaria",
] as const;

export const ROLES = [
  "administrador",
  "oficial",
  "gestor_administrativo",
  "financeiro",
  "rh",
  "encarregado_lgpd",
  "funcionario",
  "consulta",
] as const;
