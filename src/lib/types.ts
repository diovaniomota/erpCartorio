export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ActionResult<T = unknown> = {
  ok: boolean;
  message: string;
  data?: T;
};

export type BaseRecord = {
  id: string;
  cartorio_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  motivo_exclusao?: string | null;
};

export type Cartorio = {
  id: string;
  nome: string;
  cnpj?: string | null;
  cidade?: string | null;
  uf?: string | null;
  plano?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type UserProfile = BaseRecord & {
  auth_user_id?: string | null;
  nome: string;
  email: string;
  cargo?: string | null;
  setor?: string | null;
  avatar_url?: string | null;
  ativo: boolean;
};

export type Perfil = BaseRecord & {
  nome: string;
  descricao?: string | null;
  sistema: boolean;
};

export type Permissao = BaseRecord & {
  chave: string;
  descricao: string;
  modulo: string;
};

export type Fornecedor = BaseRecord & {
  nome: string;
  categoria: string;
  documento?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  contato_responsavel?: string | null;
  dados_bancarios?: string | null;
  observacoes?: string | null;
  status: "ativo" | "inativo";
};

export type Contrato = BaseRecord & {
  fornecedor_id?: string | null;
  fornecedor_nome?: string | null;
  nome: string;
  numero?: string | null;
  valor: number;
  data_inicio: string;
  data_vencimento: string;
  data_reajuste?: string | null;
  indice_reajuste?: string | null;
  status: "vigente" | "a vencer" | "vencido" | "cancelado" | "renovado" | "suspenso";
  arquivo_url?: string | null;
  observacoes?: string | null;
};

export type FinanceiroCategoria = BaseRecord & {
  nome: string;
  tipo: "despesa" | "receita" | "ambos";
  cor?: string | null;
  ativa: boolean;
};

export type FinanceiroConta = BaseRecord & {
  descricao: string;
  tipo: "pagar" | "receber";
  valor: number;
  data_vencimento: string;
  data_pagamento?: string | null;
  status: "aberta" | "agendada" | "paga" | "vencida" | "cancelada" | "estornada";
  fornecedor_id?: string | null;
  fornecedor_nome?: string | null;
  contrato_id?: string | null;
  categoria_id?: string | null;
  categoria_nome?: string | null;
  centro_custo?: string | null;
  codigo_barras?: string | null;
  recorrente: boolean;
  observacoes?: string | null;
};

export type FinanceiroPagamento = BaseRecord & {
  conta_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  comprovante_url?: string | null;
  estornado: boolean;
};

export type LivroCaixa = BaseRecord & {
  descricao: string;
  tipo: "entrada" | "saída" | "transferência" | "ajuste" | "estorno";
  valor: number;
  data_movimento: string;
  forma_pagamento: string;
  conta_id?: string | null;
  pagamento_id?: string | null;
  observacoes?: string | null;
};

export type Funcionario = BaseRecord & {
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  cargo: string;
  setor: string;
  data_admissao: string;
  tipo_contrato: string;
  salario?: number | null;
  status: "ativo" | "afastado" | "férias" | "desligado" | "licença";
  observacoes?: string | null;
};

export type FuncionarioAtestado = BaseRecord & {
  funcionario_id: string;
  funcionario_nome?: string | null;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  quantidade_dias: number;
  cid?: string | null;
  status: "pendente" | "aprovado" | "reprovado";
  documento_url?: string | null;
  observacoes?: string | null;
};

export type FuncionarioPonto = BaseRecord & {
  funcionario_id: string;
  funcionario_nome?: string | null;
  tipo: "entrada" | "saida_almoco" | "retorno_almoco" | "saida";
  registrado_em: string;
  observacao?: string | null;
  ajuste_manual: boolean;
  justificativa_ajuste?: string | null;
  aprovado_por?: string | null;
  aprovado_em?: string | null;
};

export type FuncionarioFerias = BaseRecord & {
  funcionario_id: string;
  funcionario_nome?: string | null;
  periodo_aquisitivo_inicio: string;
  periodo_aquisitivo_fim: string;
  data_inicio: string;
  data_fim: string;
  status: "pendente" | "aprovada" | "reprovada" | "em andamento" | "concluída" | "cancelada";
  aprovado_por?: string | null;
  aprovado_em?: string | null;
  observacoes?: string | null;
};

export type FuncionarioBeneficio = BaseRecord & {
  funcionario_id: string;
  funcionario_nome?: string | null;
  nome: string;
  valor?: number | null;
  ativo: boolean;
};

export type AgendaEvento = BaseRecord & {
  titulo: string;
  descricao?: string | null;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  dia_todo: boolean;
  local?: string | null;
  link_reuniao?: string | null;
  prioridade: "baixa" | "média" | "alta" | "urgente";
  status: "agendado" | "concluído" | "cancelado";
  criado_por?: string | null;
  responsavel_id?: string | null;
  vinculo_tipo?: string | null;
  vinculo_id?: string | null;
  lembrete_minutos?: number | null;
};

export type OfficialSource = BaseRecord & {
  nome: string;
  orgao: string;
  tipo: "API" | "RSS" | "scraping" | "manual";
  url?: string | null;
  ativa: boolean;
};

export type OfficialUpdate = BaseRecord & {
  source_id?: string | null;
  fonte_nome?: string | null;
  titulo: string;
  resumo?: string | null;
  conteudo?: string | null;
  url_original?: string | null;
  orgao: string;
  tipo: string;
  relevancia: "baixa" | "média" | "alta" | "crítica";
  status: "nova" | "lida" | "em análise" | "gerou tarefa" | "arquivada";
  importante: boolean;
  publicado_em?: string | null;
  anexo_url?: string | null;
};

export type DocumentoInterno = BaseRecord & {
  titulo: string;
  categoria: string;
  pasta?: string | null;
  arquivo_url?: string | null;
  validade_em?: string | null;
  status: "ativo" | "vencido" | "arquivado";
  acesso: "todos" | "restrito" | "gestores";
  vinculo_tipo?: string | null;
  vinculo_id?: string | null;
};

export type TaskBoard = BaseRecord & {
  nome: string;
  descricao?: string | null;
  criado_por?: string | null;
  ativo: boolean;
};

export type TaskColumn = BaseRecord & {
  board_id: string;
  nome: string;
  ordem: number;
  cor?: string | null;
  status_equivalente?: string | null;
};

export type Task = BaseRecord & {
  board_id: string;
  column_id: string;
  titulo: string;
  descricao?: string | null;
  categoria: string;
  prioridade: "baixa" | "média" | "alta" | "urgente";
  status: string;
  responsavel_id?: string | null;
  responsavel_nome?: string | null;
  criado_por?: string | null;
  data_inicio?: string | null;
  data_prazo?: string | null;
  data_conclusao?: string | null;
  vinculo_tipo?: string | null;
  vinculo_id?: string | null;
  ordem: number;
  labels?: TaskLabel[];
  comentarios_count?: number;
  anexos_count?: number;
  checklist_total?: number;
  checklist_done?: number;
};

export type TaskLabel = BaseRecord & {
  nome: string;
  cor: string;
};

export type InventarioItem = BaseRecord & {
  codigo_patrimonio: string;
  nome: string;
  categoria: string;
  descricao?: string | null;
  numero_serie?: string | null;
  fornecedor_id?: string | null;
  valor_compra?: number | null;
  data_compra?: string | null;
  garantia_ate?: string | null;
  localizacao: string;
  responsavel_id?: string | null;
  status: string;
  foto_url?: string | null;
  nota_fiscal_url?: string | null;
};

export type InventarioMovimentacao = BaseRecord & {
  item_id: string;
  item_nome?: string | null;
  tipo: string;
  descricao?: string | null;
  localizacao_anterior?: string | null;
  localizacao_nova?: string | null;
  responsavel_anterior?: string | null;
  responsavel_novo?: string | null;
  criado_por?: string | null;
};

export type InventarioManutencao = BaseRecord & {
  item_id: string;
  item_nome?: string | null;
  fornecedor_id?: string | null;
  fornecedor_nome?: string | null;
  descricao: string;
  data_inicio: string;
  data_fim?: string | null;
  custo?: number | null;
  status: "aberta" | "em andamento" | "concluída" | "cancelada";
};

export type LgpdInventarioDado = BaseRecord & {
  processo: string;
  categoria_dado: string;
  base_legal: string;
  finalidade: string;
  retencao?: string | null;
  compartilhamento?: string | null;
  responsavel_id?: string | null;
  responsavel_nome?: string | null;
};

export type LgpdSolicitacao = BaseRecord & {
  titular_nome: string;
  titular_email?: string | null;
  tipo: string;
  prazo_resposta: string;
  status: string;
  responsavel_id?: string | null;
  responsavel_nome?: string | null;
  observacoes?: string | null;
};

export type LgpdIncidente = BaseRecord & {
  data_incidente: string;
  descricao: string;
  tipo_dado_afetado: string;
  pessoas_afetadas?: number | null;
  risco: "baixo" | "médio" | "alto" | "crítico";
  medidas_tomadas?: string | null;
  responsavel_id?: string | null;
  status: string;
};

export type LgpdPolitica = BaseRecord & {
  titulo: string;
  versao?: string | null;
  documento_url?: string | null;
  validade_em?: string | null;
  status: string;
};

export type LgpdTreinamento = BaseRecord & {
  titulo: string;
  data_treinamento: string;
  responsavel_id?: string | null;
  responsavel_nome?: string | null;
  participantes: Json[];
  comprovante_url?: string | null;
};

export type LgpdFornecedorOperador = BaseRecord & {
  fornecedor_id?: string | null;
  fornecedor_nome?: string | null;
  descricao_tratamento: string;
  dados_tratados?: string | null;
  contrato_operador_url?: string | null;
  status: string;
};

export type ChatConversa = BaseRecord & {
  nome?: string | null;
  tipo: string;
  setor?: string | null;
  criado_por?: string | null;
};

export type ChatMensagem = BaseRecord & {
  conversa_id: string;
  conversa_nome?: string | null;
  usuario_id?: string | null;
  usuario_nome?: string | null;
  mensagem: string;
  anexos: Json[];
  fixada: boolean;
};

export type Configuracao = BaseRecord & {
  chave: string;
  valor: Json;
};

export type Notificacao = BaseRecord & {
  usuario_id?: string | null;
  tipo: string;
  titulo: string;
  descricao?: string | null;
  lida: boolean;
  vinculo_tipo?: string | null;
  vinculo_id?: string | null;
};

export type AuditoriaLog = {
  id: string;
  cartorio_id: string;
  usuario_id?: string | null;
  usuario_nome?: string | null;
  acao: string;
  modulo: string;
  tabela: string;
  registro_id?: string | null;
  dados_anteriores?: Json | null;
  dados_novos?: Json | null;
  ip?: string | null;
  user_agent?: string | null;
  created_at: string;
};

export type TableMap = {
  cartorios: Cartorio[];
  profiles: UserProfile[];
  perfis: Perfil[];
  permissoes: Permissao[];
  fornecedores: Fornecedor[];
  contratos: Contrato[];
  financeiro_categorias: FinanceiroCategoria[];
  financeiro_contas: FinanceiroConta[];
  financeiro_pagamentos: FinanceiroPagamento[];
  livro_caixa: LivroCaixa[];
  funcionarios: Funcionario[];
  funcionario_atestados: FuncionarioAtestado[];
  funcionario_ponto: FuncionarioPonto[];
  funcionario_ferias: FuncionarioFerias[];
  funcionario_beneficios: FuncionarioBeneficio[];
  agenda_eventos: AgendaEvento[];
  official_sources: OfficialSource[];
  official_updates: OfficialUpdate[];
  documentos_internos: DocumentoInterno[];
  task_boards: TaskBoard[];
  task_columns: TaskColumn[];
  tasks: Task[];
  task_labels: TaskLabel[];
  inventario_itens: InventarioItem[];
  inventario_movimentacoes: InventarioMovimentacao[];
  inventario_manutencoes: InventarioManutencao[];
  lgpd_inventario_dados: LgpdInventarioDado[];
  lgpd_solicitacoes: LgpdSolicitacao[];
  lgpd_incidentes: LgpdIncidente[];
  lgpd_politicas: LgpdPolitica[];
  lgpd_treinamentos: LgpdTreinamento[];
  lgpd_fornecedores_operadores: LgpdFornecedorOperador[];
  chat_conversas: ChatConversa[];
  chat_mensagens: ChatMensagem[];
  configuracoes: Configuracao[];
  notificacoes: Notificacao[];
  auditoria_logs: AuditoriaLog[];
};

export type TableName = keyof TableMap;
