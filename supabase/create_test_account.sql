-- Execute este arquivo no SQL Editor do Supabase depois da migration inicial.
-- Ele cria um cartório e um usuário administrador para teste.
--
-- Login:
--   E-mail: admin@cartoriohub.local
--   Senha:  CartorioHub@123

insert into public.cartorios (id, nome, cnpj, cidade, uf, plano, ativo)
values (
  '11111111-1111-4111-8111-111111111111',
  'Cartório de Demonstração',
  '12.345.678/0001-90',
  'Florianópolis',
  'SC',
  'demo',
  true
)
on conflict (id) do update
set nome = excluded.nome,
    cnpj = excluded.cnpj,
    cidade = excluded.cidade,
    uf = excluded.uf,
    ativo = true,
    updated_at = now();

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '22222222-2222-4222-8222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@cartoriohub.local',
  crypt('CartorioHub@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nome":"Administrador Demo"}'::jsonb,
  now(),
  now()
)
on conflict (id) do update
set email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = now(),
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  '23232323-2323-4232-8232-232323232323',
  '22222222-2222-4222-8222-222222222222',
  '22222222-2222-4222-8222-222222222222',
  '{"sub":"22222222-2222-4222-8222-222222222222","email":"admin@cartoriohub.local","email_verified":true,"phone_verified":false}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (provider, provider_id) do update
set identity_data = excluded.identity_data,
    updated_at = now();

insert into public.profiles (id, cartorio_id, auth_user_id, nome, email, cargo, setor, ativo)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  'Administrador Demo',
  'admin@cartoriohub.local',
  'Gestor administrativo',
  'Administração',
  true
)
on conflict (id) do update
set cartorio_id = excluded.cartorio_id,
    nome = excluded.nome,
    email = excluded.email,
    cargo = excluded.cargo,
    setor = excluded.setor,
    ativo = true,
    deleted_at = null,
    updated_at = now();

insert into public.perfis (id, cartorio_id, nome, descricao, sistema)
values
  ('44444444-4444-4444-8444-444444444401','11111111-1111-4111-8111-111111111111','administrador','Acesso total ao cartório',true),
  ('44444444-4444-4444-8444-444444444402','11111111-1111-4111-8111-111111111111','financeiro','Financeiro, fornecedores e contratos',true),
  ('44444444-4444-4444-8444-444444444403','11111111-1111-4111-8111-111111111111','rh','Funcionários, ponto, férias e atestados',true),
  ('44444444-4444-4444-8444-444444444404','11111111-1111-4111-8111-111111111111','funcionario','Acesso operacional restrito',true)
on conflict (cartorio_id, nome) do update
set descricao = excluded.descricao,
    sistema = excluded.sistema,
    deleted_at = null,
    updated_at = now();

insert into public.permissoes (cartorio_id, chave, descricao, modulo)
select
  '11111111-1111-4111-8111-111111111111'::uuid,
  chave,
  replace(chave, '_', ' '),
  split_part(chave, '_', 2)
from unnest(array[
  'ver_dashboard','gerenciar_central_oficial','gerenciar_financeiro','aprovar_pagamentos',
  'gerenciar_fornecedores','gerenciar_contratos','gerenciar_inventario','gerenciar_funcionarios',
  'ver_dados_rh','gerenciar_ponto','aprovar_ajustes_ponto','gerenciar_lgpd',
  'ver_documentos_internos','enviar_documentos','gerenciar_tarefas','usar_chat',
  'ver_relatorios','gerenciar_usuarios','ver_auditoria','gerenciar_configuracoes'
]) as chave
on conflict (cartorio_id, chave) do update
set descricao = excluded.descricao,
    modulo = excluded.modulo,
    deleted_at = null,
    updated_at = now();

insert into public.perfil_permissoes (cartorio_id, perfil_id, permissao_id)
select p.cartorio_id, p.id, perm.id
from public.perfis p
cross join public.permissoes perm
where p.cartorio_id = '11111111-1111-4111-8111-111111111111'
  and p.nome = 'administrador'
  and perm.cartorio_id = p.cartorio_id
on conflict (cartorio_id, perfil_id, permissao_id) do nothing;

insert into public.usuario_perfis (cartorio_id, usuario_id, perfil_id)
select p.cartorio_id, '22222222-2222-4222-8222-222222222222'::uuid, p.id
from public.perfis p
where p.cartorio_id = '11111111-1111-4111-8111-111111111111'
  and p.nome = 'administrador'
on conflict (cartorio_id, usuario_id, perfil_id) do nothing;

insert into public.configuracoes (cartorio_id, chave, valor)
values (
  '11111111-1111-4111-8111-111111111111',
  'task_completion_rule',
  '{"clear_completion_when_leaving_done":false}'::jsonb
)
on conflict (cartorio_id, chave) do update
set valor = excluded.valor,
    updated_at = now();
