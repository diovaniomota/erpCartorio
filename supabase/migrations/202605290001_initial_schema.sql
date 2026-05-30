create extension if not exists "pgcrypto";

create schema if not exists app;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.cartorios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  cidade text,
  uf text,
  plano text default 'mvp',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  auth_user_id uuid,
  nome text not null,
  email text not null,
  cargo text,
  setor text,
  avatar_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid,
  motivo_exclusao text
);

create table public.perfis (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text not null,
  descricao text,
  sistema boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, nome)
);

create table public.permissoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  chave text not null,
  descricao text not null,
  modulo text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, chave)
);

create table public.perfil_permissoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  perfil_id uuid not null references public.perfis(id) on delete cascade,
  permissao_id uuid not null references public.permissoes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, perfil_id, permissao_id)
);

create table public.usuario_perfis (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  perfil_id uuid not null references public.perfis(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, usuario_id, perfil_id)
);

create table public.official_sources (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text not null,
  orgao text not null,
  tipo text not null default 'manual',
  url text,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.official_updates (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  source_id uuid references public.official_sources(id),
  titulo text not null,
  resumo text,
  conteudo text,
  url_original text,
  orgao text not null,
  tipo text not null,
  relevancia text not null default 'média',
  status text not null default 'nova',
  importante boolean not null default false,
  publicado_em date,
  anexo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.official_update_reads (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  update_id uuid not null references public.official_updates(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id),
  lido_em timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.official_update_comments (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  update_id uuid not null references public.official_updates(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id),
  comentario text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.official_update_tasks (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  update_id uuid not null references public.official_updates(id) on delete cascade,
  task_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text not null,
  categoria text not null,
  documento text,
  telefone text,
  email text,
  endereco text,
  contato_responsavel text,
  dados_bancarios text,
  observacoes text,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  fornecedor_id uuid references public.fornecedores(id),
  nome text not null,
  numero text,
  valor numeric(14,2) not null default 0,
  data_inicio date not null,
  data_vencimento date not null,
  data_reajuste date,
  indice_reajuste text,
  status text not null default 'vigente',
  arquivo_url text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.financeiro_categorias (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text not null,
  tipo text not null default 'despesa',
  cor text,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, nome)
);

create table public.financeiro_contas (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  descricao text not null,
  tipo text not null,
  valor numeric(14,2) not null,
  data_vencimento date not null,
  data_pagamento date,
  status text not null default 'aberta',
  fornecedor_id uuid references public.fornecedores(id),
  contrato_id uuid references public.contratos(id),
  categoria_id uuid references public.financeiro_categorias(id),
  centro_custo text,
  codigo_barras text,
  recorrente boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.financeiro_pagamentos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  conta_id uuid not null references public.financeiro_contas(id),
  valor_pago numeric(14,2) not null,
  data_pagamento date not null,
  forma_pagamento text not null,
  comprovante_url text,
  estornado boolean not null default false,
  estornado_em timestamptz,
  estornado_por uuid references public.profiles(id),
  motivo_estorno text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.financeiro_anexos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  conta_id uuid references public.financeiro_contas(id),
  pagamento_id uuid references public.financeiro_pagamentos(id),
  nome_arquivo text not null,
  arquivo_url text not null,
  tipo text,
  enviado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.livro_caixa (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  descricao text not null,
  tipo text not null,
  valor numeric(14,2) not null,
  data_movimento date not null,
  forma_pagamento text not null,
  conta_id uuid references public.financeiro_contas(id),
  pagamento_id uuid references public.financeiro_pagamentos(id),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.caixa_movimentos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  livro_caixa_id uuid references public.livro_caixa(id),
  descricao text not null,
  tipo text not null,
  valor numeric(14,2) not null,
  data_movimento date not null,
  forma_pagamento text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.funcionarios (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text not null,
  cpf text,
  email text,
  telefone text,
  cargo text not null,
  setor text not null,
  data_admissao date not null,
  tipo_contrato text not null,
  salario numeric(14,2),
  status text not null default 'ativo',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.funcionario_documentos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios(id),
  nome_arquivo text not null,
  arquivo_url text not null,
  categoria text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.funcionario_atestados (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios(id),
  tipo text not null,
  data_inicio date not null,
  data_fim date not null,
  quantidade_dias integer not null,
  cid text,
  status text not null default 'pendente',
  aprovado_por uuid references public.profiles(id),
  aprovado_em timestamptz,
  documento_url text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.funcionario_ponto (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios(id),
  tipo text not null,
  registrado_em timestamptz not null,
  observacao text,
  ajuste_manual boolean not null default false,
  justificativa_ajuste text,
  aprovado_por uuid references public.profiles(id),
  aprovado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.funcionario_ferias (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios(id),
  periodo_aquisitivo_inicio date not null,
  periodo_aquisitivo_fim date not null,
  data_inicio date not null,
  data_fim date not null,
  status text not null default 'pendente',
  aprovado_por uuid references public.profiles(id),
  aprovado_em timestamptz,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.funcionario_beneficios (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios(id),
  nome text not null,
  valor numeric(14,2),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.agenda_eventos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  titulo text not null,
  descricao text,
  tipo text not null,
  data_inicio timestamptz not null,
  data_fim timestamptz not null,
  dia_todo boolean not null default false,
  local text,
  link_reuniao text,
  prioridade text not null default 'média',
  status text not null default 'agendado',
  criado_por uuid references public.profiles(id),
  responsavel_id uuid references public.profiles(id),
  vinculo_tipo text,
  vinculo_id uuid,
  lembrete_minutos integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.agenda_evento_participantes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  evento_id uuid not null references public.agenda_eventos(id) on delete cascade,
  usuario_id uuid references public.profiles(id),
  funcionario_id uuid references public.funcionarios(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.inventario_itens (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  codigo_patrimonio text not null,
  nome text not null,
  categoria text not null,
  descricao text,
  numero_serie text,
  fornecedor_id uuid references public.fornecedores(id),
  valor_compra numeric(14,2),
  data_compra date,
  garantia_ate date,
  localizacao text not null,
  responsavel_id uuid references public.funcionarios(id),
  status text not null default 'em uso',
  foto_url text,
  nota_fiscal_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, codigo_patrimonio)
);

create table public.inventario_movimentacoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  item_id uuid not null references public.inventario_itens(id),
  tipo text not null,
  descricao text,
  localizacao_anterior text,
  localizacao_nova text,
  responsavel_anterior uuid references public.funcionarios(id),
  responsavel_novo uuid references public.funcionarios(id),
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.inventario_manutencoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  item_id uuid not null references public.inventario_itens(id),
  fornecedor_id uuid references public.fornecedores(id),
  descricao text not null,
  data_inicio date not null,
  data_fim date,
  custo numeric(14,2),
  status text not null default 'aberta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.lgpd_inventario_dados (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  processo text not null,
  categoria_dado text not null,
  base_legal text not null,
  finalidade text not null,
  retencao text,
  compartilhamento text,
  responsavel_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.lgpd_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  titular_nome text not null,
  titular_email text,
  tipo text not null,
  prazo_resposta date not null,
  status text not null default 'aberta',
  responsavel_id uuid references public.profiles(id),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.lgpd_incidentes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  data_incidente date not null,
  descricao text not null,
  tipo_dado_afetado text not null,
  pessoas_afetadas integer,
  risco text not null default 'médio',
  medidas_tomadas text,
  responsavel_id uuid references public.profiles(id),
  status text not null default 'em análise',
  anexos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.lgpd_politicas (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  titulo text not null,
  versao text,
  documento_url text,
  validade_em date,
  status text not null default 'ativa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.lgpd_treinamentos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  titulo text not null,
  data_treinamento date not null,
  responsavel_id uuid references public.profiles(id),
  participantes jsonb not null default '[]'::jsonb,
  comprovante_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.lgpd_fornecedores_operadores (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  fornecedor_id uuid references public.fornecedores(id),
  descricao_tratamento text not null,
  dados_tratados text,
  contrato_operador_url text,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.documentos_internos (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  titulo text not null,
  categoria text not null,
  pasta text,
  arquivo_url text,
  validade_em date,
  status text not null default 'ativo',
  acesso text not null default 'restrito',
  vinculo_tipo text,
  vinculo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.documento_versoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  documento_id uuid not null references public.documentos_internos(id) on delete cascade,
  versao integer not null,
  arquivo_url text not null,
  enviado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_boards (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text not null,
  descricao text,
  criado_por uuid references public.profiles(id),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_columns (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  board_id uuid not null references public.task_boards(id) on delete cascade,
  nome text not null,
  ordem integer not null default 1,
  cor text,
  status_equivalente text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  board_id uuid not null references public.task_boards(id) on delete cascade,
  column_id uuid not null references public.task_columns(id),
  titulo text not null,
  descricao text,
  categoria text not null,
  prioridade text not null default 'média',
  status text not null default 'aberta',
  responsavel_id uuid references public.profiles(id),
  criado_por uuid references public.profiles(id),
  data_inicio date,
  data_prazo date,
  data_conclusao timestamptz,
  vinculo_tipo text,
  vinculo_id uuid,
  ordem integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_checklists (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  titulo text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  checklist_id uuid not null references public.task_checklists(id) on delete cascade,
  texto text not null,
  concluido boolean not null default false,
  ordem integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  usuario_id uuid references public.profiles(id),
  comentario text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  nome_arquivo text not null,
  arquivo_url text not null,
  enviado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_labels (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text not null,
  cor text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.task_label_relations (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.task_labels(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, task_id, label_id)
);

create table public.task_activity_logs (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  usuario_id uuid references public.profiles(id),
  acao text not null,
  dados_anteriores jsonb,
  dados_novos jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.chat_conversas (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  nome text,
  tipo text not null default 'canal',
  setor text,
  criado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.chat_participantes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  conversa_id uuid not null references public.chat_conversas(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.chat_mensagens (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  conversa_id uuid not null references public.chat_conversas(id) on delete cascade,
  usuario_id uuid references public.profiles(id),
  mensagem text not null,
  anexos jsonb not null default '[]'::jsonb,
  fixada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  usuario_id uuid references public.profiles(id),
  tipo text not null,
  titulo text not null,
  descricao text,
  lida boolean not null default false,
  vinculo_tipo text,
  vinculo_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text
);

create table public.auditoria_logs (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  usuario_id uuid references public.profiles(id),
  acao text not null,
  modulo text not null,
  tabela text not null,
  registro_id uuid,
  dados_anteriores jsonb,
  dados_novos jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  cartorio_id uuid not null references public.cartorios(id) on delete cascade,
  chave text not null,
  valor jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id),
  motivo_exclusao text,
  unique (cartorio_id, chave)
);

create or replace function app.current_cartorio_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cartorio_id
  from public.profiles
  where id = auth.uid()
    and deleted_at is null
    and ativo = true
  limit 1;
$$;

create or replace function app.is_cartorio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuario_perfis up
    join public.perfis p on p.id = up.perfil_id
    where up.usuario_id = auth.uid()
      and up.cartorio_id = app.current_cartorio_id()
      and p.nome in ('administrador', 'oficial')
      and up.deleted_at is null
      and p.deleted_at is null
  );
$$;

create or replace function public.user_permission_keys()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct perm.chave), array[]::text[])
  from public.usuario_perfis up
  join public.perfil_permissoes pp on pp.perfil_id = up.perfil_id and pp.cartorio_id = up.cartorio_id
  join public.permissoes perm on perm.id = pp.permissao_id and perm.cartorio_id = up.cartorio_id
  where up.usuario_id = auth.uid()
    and up.cartorio_id = app.current_cartorio_id()
    and up.deleted_at is null
    and pp.deleted_at is null
    and perm.deleted_at is null;
$$;

grant execute on function public.user_permission_keys() to authenticated;
grant execute on function app.current_cartorio_id() to authenticated;
grant execute on function app.is_cartorio_admin() to authenticated;

alter table public.cartorios enable row level security;
create policy "cartorio select own" on public.cartorios
  for select to authenticated
  using (id = app.current_cartorio_id());
create policy "cartorio update own admin" on public.cartorios
  for update to authenticated
  using (id = app.current_cartorio_id() and app.is_cartorio_admin())
  with check (id = app.current_cartorio_id() and app.is_cartorio_admin());

do $$
declare
  table_name text;
  table_names text[] := array[
    'profiles','perfis','permissoes','perfil_permissoes','usuario_perfis',
    'official_sources','official_updates','official_update_reads','official_update_comments','official_update_tasks',
    'agenda_eventos','agenda_evento_participantes',
    'financeiro_categorias','financeiro_contas','financeiro_pagamentos','financeiro_anexos','livro_caixa','caixa_movimentos',
    'fornecedores','contratos',
    'inventario_itens','inventario_movimentacoes','inventario_manutencoes',
    'funcionarios','funcionario_documentos','funcionario_atestados','funcionario_ponto','funcionario_ferias','funcionario_beneficios',
    'lgpd_inventario_dados','lgpd_solicitacoes','lgpd_incidentes','lgpd_politicas','lgpd_treinamentos','lgpd_fornecedores_operadores',
    'documentos_internos','documento_versoes',
    'task_boards','task_columns','tasks','task_checklists','task_checklist_items','task_comments','task_attachments','task_labels','task_label_relations','task_activity_logs',
    'chat_conversas','chat_mensagens','chat_participantes',
    'notificacoes','auditoria_logs','configuracoes'
  ];
begin
  foreach table_name in array table_names loop
    execute format('alter table public.%I enable row level security', table_name);

    execute format('drop policy if exists "tenant select" on public.%I', table_name);
    execute format('create policy "tenant select" on public.%I for select to authenticated using (cartorio_id = app.current_cartorio_id())', table_name);

    execute format('drop policy if exists "tenant insert" on public.%I', table_name);
    execute format('create policy "tenant insert" on public.%I for insert to authenticated with check (cartorio_id = app.current_cartorio_id())', table_name);

    execute format('drop policy if exists "tenant update" on public.%I', table_name);
    execute format('create policy "tenant update" on public.%I for update to authenticated using (cartorio_id = app.current_cartorio_id()) with check (cartorio_id = app.current_cartorio_id())', table_name);
  end loop;
end;
$$;

do $$
declare
  table_name text;
  table_names text[] := array[
    'cartorios','profiles','perfis','permissoes','perfil_permissoes','usuario_perfis',
    'official_sources','official_updates','official_update_reads','official_update_comments','official_update_tasks',
    'agenda_eventos','agenda_evento_participantes',
    'financeiro_categorias','financeiro_contas','financeiro_pagamentos','financeiro_anexos','livro_caixa','caixa_movimentos',
    'fornecedores','contratos',
    'inventario_itens','inventario_movimentacoes','inventario_manutencoes',
    'funcionarios','funcionario_documentos','funcionario_atestados','funcionario_ponto','funcionario_ferias','funcionario_beneficios',
    'lgpd_inventario_dados','lgpd_solicitacoes','lgpd_incidentes','lgpd_politicas','lgpd_treinamentos','lgpd_fornecedores_operadores',
    'documentos_internos','documento_versoes',
    'task_boards','task_columns','tasks','task_checklists','task_checklist_items','task_comments','task_attachments','task_labels','task_label_relations','task_activity_logs',
    'chat_conversas','chat_mensagens','chat_participantes',
    'notificacoes','configuracoes'
  ];
begin
  foreach table_name in array table_names loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

create index if not exists idx_profiles_cartorio on public.profiles(cartorio_id);
create index if not exists idx_financeiro_contas_cartorio_vencimento on public.financeiro_contas(cartorio_id, data_vencimento, status);
create index if not exists idx_contratos_cartorio_vencimento on public.contratos(cartorio_id, data_vencimento, status);
create index if not exists idx_tasks_cartorio_board_column on public.tasks(cartorio_id, board_id, column_id, ordem);
create index if not exists idx_agenda_cartorio_inicio on public.agenda_eventos(cartorio_id, data_inicio);
create index if not exists idx_auditoria_cartorio_created on public.auditoria_logs(cartorio_id, created_at desc);

insert into storage.buckets (id, name, public)
values
  ('documentos-internos', 'documentos-internos', false),
  ('financeiro-anexos', 'financeiro-anexos', false),
  ('rh-documentos', 'rh-documentos', false),
  ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;
