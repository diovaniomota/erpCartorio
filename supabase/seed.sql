insert into public.cartorios (id, nome, cnpj, cidade, uf, plano, ativo)
values ('11111111-1111-4111-8111-111111111111', 'Cartório de Demonstração', '12.345.678/0001-90', 'Florianópolis', 'SC', 'demo', true)
on conflict (id) do update set nome = excluded.nome;

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
) on conflict (id) do update set email = excluded.email, updated_at = now();

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
) on conflict (provider, provider_id) do update
set identity_data = excluded.identity_data, updated_at = now();

insert into public.profiles (id, cartorio_id, auth_user_id, nome, email, cargo, setor, ativo)
values ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Administrador Demo', 'admin@cartoriohub.local', 'Gestor administrativo', 'Administração', true)
on conflict (id) do update set nome = excluded.nome, email = excluded.email;

insert into public.perfis (id, cartorio_id, nome, descricao, sistema)
values
  ('44444444-4444-4444-8444-444444444401','11111111-1111-4111-8111-111111111111','administrador','Acesso total ao cartório',true),
  ('44444444-4444-4444-8444-444444444402','11111111-1111-4111-8111-111111111111','financeiro','Financeiro, fornecedores e contratos',true),
  ('44444444-4444-4444-8444-444444444403','11111111-1111-4111-8111-111111111111','rh','Funcionários, ponto, férias e atestados',true),
  ('44444444-4444-4444-8444-444444444404','11111111-1111-4111-8111-111111111111','funcionario','Acesso operacional restrito',true)
on conflict (cartorio_id, nome) do update set descricao = excluded.descricao;

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
on conflict (cartorio_id, chave) do update set descricao = excluded.descricao;

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

insert into public.financeiro_categorias (cartorio_id, nome, tipo, cor)
select '11111111-1111-4111-8111-111111111111'::uuid, nome, 'despesa', cor
from (values
  ('aluguel','#0f766e'),('energia','#2563eb'),('água','#0891b2'),('internet','#d97706'),
  ('telefone','#7c3aed'),('sistema','#0f766e'),('contabilidade','#2563eb'),
  ('folha de pagamento','#dc2626'),('benefícios','#059669'),('material de escritório','#d97706'),
  ('manutenção','#ea580c'),('limpeza','#64748b'),('segurança','#111827'),
  ('impostos','#dc2626'),('fornecedores','#7c3aed'),('outros','#475569')
) as c(nome, cor)
on conflict (cartorio_id, nome) do nothing;

insert into public.fornecedores (id, cartorio_id, nome, categoria, documento, telefone, email, contato_responsavel, status)
values
  ('66666666-6666-4666-8666-666666666601','11111111-1111-4111-8111-111111111111','TecnoCart Sistemas','sistema','23.456.789/0001-10','(48) 3333-0101','financeiro@tecnocart.example','Marina Duarte','ativo'),
  ('66666666-6666-4666-8666-666666666602','11111111-1111-4111-8111-111111111111','Contábil Norte','contabilidade','98.765.432/0001-22','(48) 3333-0202','atendimento@contabilnorte.example','Paulo Nunes','ativo'),
  ('66666666-6666-4666-8666-666666666603','11111111-1111-4111-8111-111111111111','Limpeza Alfa','limpeza','11.222.333/0001-44','(48) 3333-0303','contratos@limpezaalfa.example','Bruna Costa','ativo')
on conflict (id) do nothing;

insert into public.contratos (id, cartorio_id, fornecedor_id, nome, numero, valor, data_inicio, data_vencimento, data_reajuste, indice_reajuste, status)
values
  ('77777777-7777-4777-8777-777777777701','11111111-1111-4111-8111-111111111111','66666666-6666-4666-8666-666666666601','Licença ERP e suporte','CT-2026-001',1850,current_date - 120,current_date + 24,current_date + 30,'IPCA','a vencer'),
  ('77777777-7777-4777-8777-777777777702','11111111-1111-4111-8111-111111111111','66666666-6666-4666-8666-666666666602','Assessoria contábil mensal','CT-2025-044',2400,current_date - 300,current_date + 240,current_date + 60,'INPC','vigente')
on conflict (id) do nothing;

insert into public.financeiro_contas (id, cartorio_id, descricao, tipo, valor, data_vencimento, status, fornecedor_id, contrato_id, categoria_id, centro_custo, codigo_barras, recorrente)
select '99999999-9999-4999-8999-999999999901','11111111-1111-4111-8111-111111111111','Boleto internet corporativa','pagar',429.90,current_date,'aberta','66666666-6666-4666-8666-666666666601','77777777-7777-4777-8777-777777777701',fc.id,'Administrativo','23791.11111 60000.000001 01000.000009 1 99990000042990',true
from public.financeiro_categorias fc where fc.cartorio_id = '11111111-1111-4111-8111-111111111111' and fc.nome = 'internet'
on conflict (id) do nothing;

insert into public.financeiro_contas (id, cartorio_id, descricao, tipo, valor, data_vencimento, status, fornecedor_id, centro_custo, recorrente)
values ('99999999-9999-4999-8999-999999999902','11111111-1111-4111-8111-111111111111','Serviço de limpeza','pagar',980,current_date - 3,'vencida','66666666-6666-4666-8666-666666666603','Operação',false)
on conflict (id) do nothing;

insert into public.financeiro_contas (id, cartorio_id, descricao, tipo, valor, data_vencimento, status, centro_custo, recorrente, observacoes)
values ('99999999-9999-4999-8999-999999999903','11111111-1111-4111-8111-111111111111','Reembolso de treinamento interno','receber',650,current_date + 7,'agendada','RH',false,'Crédito previsto.')
on conflict (id) do nothing;

insert into public.livro_caixa (id, cartorio_id, descricao, tipo, valor, data_movimento, forma_pagamento, observacoes)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','11111111-1111-4111-8111-111111111111','Saldo inicial do caixa administrativo','entrada',4250,current_date - 15,'dinheiro','Abertura do caixa demo'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','11111111-1111-4111-8111-111111111111','Compra de material de escritório','saída',385.40,current_date - 2,'pix','Papel, pastas e toner')
on conflict (id) do nothing;

insert into public.funcionarios (id, cartorio_id, nome, cpf, email, telefone, cargo, setor, data_admissao, tipo_contrato, salario, status)
values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','11111111-1111-4111-8111-111111111111','Ana Ribeiro','111.222.333-44','ana.ribeiro@cartoriohub.local','(48) 99999-1111','Escrevente administrativa','Administrativo',current_date - 420,'CLT',4200,'ativo'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','11111111-1111-4111-8111-111111111111','Carlos Mendes','555.666.777-88','carlos.mendes@cartoriohub.local','(48) 99999-2222','Auxiliar financeiro','Financeiro',current_date - 250,'CLT',3900,'afastado'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3','11111111-1111-4111-8111-111111111111','Juliana Paes','222.333.444-55','juliana.paes@cartoriohub.local','(48) 99999-3333','Analista LGPD','Compliance',current_date - 180,'CLT',5100,'férias')
on conflict (id) do nothing;

insert into public.funcionario_atestados (id, cartorio_id, funcionario_id, tipo, data_inicio, data_fim, quantidade_dias, status, observacoes)
values ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','atestado médico',current_date - 2,current_date + 1,4,'aprovado','Gerar justificativa no ponto')
on conflict (id) do nothing;

insert into public.agenda_eventos (id, cartorio_id, titulo, descricao, tipo, data_inicio, data_fim, dia_todo, local, prioridade, status, criado_por, responsavel_id, vinculo_tipo, vinculo_id, lembrete_minutos)
values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1','11111111-1111-4111-8111-111111111111','Reunião com fornecedor de sistemas','Avaliar renovação e SLA.','reunião',now() + interval '2 days',now() + interval '2 days 1 hour',false,'Sala administrativa','alta','agendado','22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222','contrato','77777777-7777-4777-8777-777777777701',60),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2','11111111-1111-4111-8111-111111111111','Vencimento boleto internet','Conta vencendo hoje.','boleto',now(),now(),true,null,'média','agendado','22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222','financeiro_conta','99999999-9999-4999-8999-999999999901',1440),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd3','11111111-1111-4111-8111-111111111111','Prazo para atualizar política LGPD','Concluir revisão interna e registrar evidências do treinamento.','LGPD',now() + interval '4 days',now() + interval '4 days',true,null,'alta','agendado','22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222','task','15151515-1515-4515-8515-151515151502',1440)
on conflict (id) do nothing;

insert into public.official_sources (id, cartorio_id, nome, orgao, tipo, url, ativa)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1','11111111-1111-4111-8111-111111111111','TJSC','Tribunal de Justiça de Santa Catarina','manual','https://www.tjsc.jus.br',true),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2','11111111-1111-4111-8111-111111111111','CNJ','Conselho Nacional de Justiça','manual','https://www.cnj.jus.br',true),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3','11111111-1111-4111-8111-111111111111','DJEN/CNJ','Diário de Justiça Eletrônico Nacional','manual','https://www.cnj.jus.br',true)
on conflict (id) do nothing;

insert into public.official_updates (id, cartorio_id, source_id, titulo, resumo, conteudo, url_original, orgao, tipo, relevancia, status, importante, publicado_em)
values
  ('ffffffff-ffff-4fff-8fff-fffffffffff1','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1','Comunicado sobre expediente administrativo','Orientação administrativa para serventias extrajudiciais.','Cadastro manual preparado para futura ingestão por RSS, API ou scraping.','https://www.tjsc.jus.br','TJSC','comunicado','alta','nova',true,current_date - 1),
  ('ffffffff-ffff-4fff-8fff-fffffffffff2','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2','Alerta de prazo LGPD','Reforço de boas práticas para resposta a titulares.','Item demo para acionar o painel LGPD.','https://www.cnj.jus.br','CNJ','alerta','crítica','em análise',true,current_date - 3),
  ('ffffffff-ffff-4fff-8fff-fffffffffff3','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1','Notícia sobre modernização administrativa','TJSC divulga orientação de gestão para rotinas internas de serventias.','Registro demo para validar o filtro de notícias oficiais e o fluxo de acompanhamento interno.','https://www.tjsc.jus.br','TJSC','notícia','média','lida',false,current_date - 5),
  ('ffffffff-ffff-4fff-8fff-fffffffffff4','11111111-1111-4111-8111-111111111111','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2','Provimento administrativo de referência','Provimento cadastrado manualmente para acompanhamento da equipe administrativa.','Item demo preparado para gerar tarefa, evento de agenda e comentários internos.','https://www.cnj.jus.br','CNJ','provimento','alta','nova',true,current_date - 7)
on conflict (id) do nothing;

insert into public.task_boards (id, cartorio_id, nome, descricao, criado_por, ativo)
values ('33333333-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111','Administrativo Geral','Demandas internas da serventia.','22222222-2222-4222-8222-222222222222',true)
on conflict (id) do nothing;

insert into public.task_columns (id, cartorio_id, board_id, nome, ordem, cor, status_equivalente)
values
  ('13131313-1313-4313-8313-131313131301','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','A fazer',1,'#64748b','aberta'),
  ('13131313-1313-4313-8313-131313131302','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','Em andamento',2,'#2563eb','em andamento'),
  ('13131313-1313-4313-8313-131313131303','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','Aguardando terceiro',3,'#d97706','aguardando terceiro'),
  ('13131313-1313-4313-8313-131313131304','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','Em revisão',4,'#7c3aed','em revisão'),
  ('13131313-1313-4313-8313-131313131305','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','Concluído',5,'#059669','concluída')
on conflict (id) do nothing;

insert into public.task_labels (id, cartorio_id, nome, cor)
values
  ('14141414-1414-4414-8414-141414141401','11111111-1111-4111-8111-111111111111','Financeiro','#0f766e'),
  ('14141414-1414-4414-8414-141414141402','11111111-1111-4111-8111-111111111111','RH','#2563eb'),
  ('14141414-1414-4414-8414-141414141403','11111111-1111-4111-8111-111111111111','LGPD','#7c3aed'),
  ('14141414-1414-4414-8414-141414141404','11111111-1111-4111-8111-111111111111','Urgente','#dc2626')
on conflict (id) do nothing;

insert into public.tasks (id, cartorio_id, board_id, column_id, titulo, descricao, categoria, prioridade, status, responsavel_id, criado_por, data_inicio, data_prazo, vinculo_tipo, vinculo_id, ordem)
values
  ('15151515-1515-4515-8515-151515151501','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','13131313-1313-4313-8313-131313131301','Pagar boleto da internet','Conferir código de barras e anexar comprovante.','financeiro','alta','aberta','22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222',current_date,current_date + 1,'financeiro_conta','99999999-9999-4999-8999-999999999901',1),
  ('15151515-1515-4515-8515-151515151502','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','13131313-1313-4313-8313-131313131302','Atualizar política LGPD','Revisar base legal e fluxo de solicitações de titulares.','lgpd','urgente','em andamento','22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222',current_date - 4,current_date - 1,'lgpd',null,1),
  ('15151515-1515-4515-8515-151515151503','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333','13131313-1313-4313-8313-131313131303','Conferir contrato vencendo','Solicitar proposta de renovação.','contratos','média','aguardando terceiro','22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222',current_date - 2,current_date + 5,'contrato','77777777-7777-4777-8777-777777777701',1)
on conflict (id) do nothing;

insert into public.inventario_itens (id, cartorio_id, codigo_patrimonio, nome, categoria, descricao, numero_serie, fornecedor_id, valor_compra, data_compra, garantia_ate, localizacao, responsavel_id, status)
values
  ('16161616-1616-4616-8616-161616161601','11111111-1111-4111-8111-111111111111','PAT-0001','Notebook atendimento financeiro','informática','Notebook Dell 14 polegadas.','DL-2026-88991','66666666-6666-4666-8666-666666666601',4650,current_date - 200,current_date + 480,'Financeiro','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','em manutenção'),
  ('16161616-1616-4616-8616-161616161602','11111111-1111-4111-8111-111111111111','PAT-0002','Impressora laser antiga','equipamentos','Equipamento substituído por nova impressora multifuncional.','HP-OLD-7782','66666666-6666-4666-8666-666666666601',1320,current_date - 980,current_date - 250,'Arquivo administrativo','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','baixado')
on conflict (id) do nothing;

insert into public.lgpd_incidentes (id, cartorio_id, data_incidente, descricao, tipo_dado_afetado, pessoas_afetadas, risco, medidas_tomadas, responsavel_id, status)
values ('17171717-1717-4717-8717-171717171701','11111111-1111-4111-8111-111111111111',current_date - 2,'E-mail com dados pessoais enviado a destinatário incorreto.','dados cadastrais',1,'alto','Contato com destinatário e registro de contenção.','22222222-2222-4222-8222-222222222222','em análise')
on conflict (id) do nothing;

insert into public.documentos_internos (id, cartorio_id, titulo, categoria, pasta, validade_em, status, acesso, vinculo_tipo)
values
  ('12121212-1212-4212-8212-121212121201','11111111-1111-4111-8111-111111111111','Política interna de segurança da informação','políticas internas','Compliance',current_date + 150,'ativo','gestores','lgpd'),
  ('12121212-1212-4212-8212-121212121202','11111111-1111-4111-8111-111111111111','Comprovante de pagamento internet','documentos financeiros','Financeiro/Boletos',null,'ativo','restrito','financeiro_conta')
on conflict (id) do nothing;

insert into public.chat_conversas (id, cartorio_id, nome, tipo, setor, criado_por)
values
  ('20202020-2020-4020-8020-202020202001','11111111-1111-4111-8111-111111111111','Geral','canal','geral','22222222-2222-4222-8222-222222222222'),
  ('20202020-2020-4020-8020-202020202002','11111111-1111-4111-8111-111111111111','Financeiro','canal','financeiro','22222222-2222-4222-8222-222222222222'),
  ('20202020-2020-4020-8020-202020202003','11111111-1111-4111-8111-111111111111','RH','canal','rh','22222222-2222-4222-8222-222222222222'),
  ('20202020-2020-4020-8020-202020202004','11111111-1111-4111-8111-111111111111','Administrativo','canal','administrativo','22222222-2222-4222-8222-222222222222'),
  ('20202020-2020-4020-8020-202020202005','11111111-1111-4111-8111-111111111111','LGPD','canal','lgpd','22222222-2222-4222-8222-222222222222'),
  ('20202020-2020-4020-8020-202020202006','11111111-1111-4111-8111-111111111111','Avisos importantes','canal','avisos','22222222-2222-4222-8222-222222222222'),
  ('20202020-2020-4020-8020-202020202007','11111111-1111-4111-8111-111111111111','TI/Suporte','canal','ti','22222222-2222-4222-8222-222222222222')
on conflict (id) do nothing;

insert into public.notificacoes (id, cartorio_id, usuario_id, tipo, titulo, descricao, lida, vinculo_tipo, vinculo_id)
values
  ('18181818-1818-4818-8818-181818181801','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','conta vencendo','Boleto vence hoje','Boleto internet corporativa vence hoje.',false,'financeiro_conta','99999999-9999-4999-8999-999999999901'),
  ('18181818-1818-4818-8818-181818181802','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','incidente LGPD','Incidente LGPD em análise','Incidente de risco alto aberto.',false,'lgpd_incidente','17171717-1717-4717-8717-171717171701')
on conflict (id) do nothing;

insert into public.auditoria_logs (id, cartorio_id, usuario_id, acao, modulo, tabela, registro_id, dados_novos, user_agent)
values
  ('19191919-1919-4919-8919-191919191901','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','create','financeiro','financeiro_contas','99999999-9999-4999-8999-999999999901','{"descricao":"Boleto internet corporativa"}'::jsonb,'seed'),
  ('19191919-1919-4919-8919-191919191902','11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','move','tarefas','tasks','15151515-1515-4515-8515-151515151502','{"column_id":"Em andamento"}'::jsonb,'seed')
on conflict (id) do nothing;

insert into public.funcionario_ponto (id, cartorio_id, funcionario_id, tipo, registrado_em, observacao, ajuste_manual, justificativa_ajuste, aprovado_por, aprovado_em)
values
  ('c1c1c1c1-c1c1-4c1c-8c1c-c1c1c1c1c101','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','entrada',date_trunc('day', now()) + interval '8 hours 4 minutes',null,false,null,null,null),
  ('c1c1c1c1-c1c1-4c1c-8c1c-c1c1c1c1c102','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','saida_almoco',date_trunc('day', now()) + interval '12 hours 3 minutes',null,false,null,null,null),
  ('c1c1c1c1-c1c1-4c1c-8c1c-c1c1c1c1c103','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','retorno_almoco',date_trunc('day', now()) + interval '13 hours 2 minutes',null,false,null,null,null),
  ('c1c1c1c1-c1c1-4c1c-8c1c-c1c1c1c1c104','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','entrada',now() - interval '3 days','Ajuste lançado por atestado aprovado.',true,'Atestado médico aprovado pelo RH.','22222222-2222-4222-8222-222222222222',now() - interval '1 day')
on conflict (id) do nothing;

insert into public.funcionario_ferias (id, cartorio_id, funcionario_id, periodo_aquisitivo_inicio, periodo_aquisitivo_fim, data_inicio, data_fim, status, aprovado_por, aprovado_em, observacoes)
values
  ('c2c2c2c2-c2c2-4c2c-8c2c-c2c2c2c2c201','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',current_date - 365,current_date,current_date - 4,current_date + 10,'em andamento','22222222-2222-4222-8222-222222222222',now() - interval '20 days','Férias programadas no calendário administrativo.'),
  ('c2c2c2c2-c2c2-4c2c-8c2c-c2c2c2c2c202','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',current_date - 420,current_date - 55,current_date + 35,current_date + 49,'aprovada','22222222-2222-4222-8222-222222222222',now() - interval '5 days','Cobertura interna já alinhada.')
on conflict (id) do nothing;

insert into public.funcionario_beneficios (id, cartorio_id, funcionario_id, nome, valor, ativo)
values
  ('c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c301','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','Vale alimentação',780,true),
  ('c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c302','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','Vale transporte',240,true),
  ('c3c3c3c3-c3c3-4c3c-8c3c-c3c3c3c3c303','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3','Plano de saúde',620,true)
on conflict (id) do nothing;

insert into public.inventario_movimentacoes (id, cartorio_id, item_id, tipo, descricao, localizacao_anterior, localizacao_nova, responsavel_anterior, responsavel_novo, criado_por)
values
  ('16161616-1616-4616-8616-161616161701','11111111-1111-4111-8111-111111111111','16161616-1616-4616-8616-161616161601','transferência','Item transferido do administrativo para o financeiro.','Administrativo','Financeiro','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','22222222-2222-4222-8222-222222222222')
on conflict (id) do nothing;

insert into public.inventario_manutencoes (id, cartorio_id, item_id, fornecedor_id, descricao, data_inicio, data_fim, custo, status)
values
  ('16161616-1616-4616-8616-161616161801','11111111-1111-4111-8111-111111111111','16161616-1616-4616-8616-161616161601','66666666-6666-4666-8666-666666666601','Troca preventiva de SSD e limpeza interna.',current_date - 1,null,420,'em andamento')
on conflict (id) do nothing;

insert into public.lgpd_inventario_dados (id, cartorio_id, processo, categoria_dado, base_legal, finalidade, retencao, compartilhamento, responsavel_id)
values
  ('17171717-1717-4717-8717-171717171601','11111111-1111-4111-8111-111111111111','Cadastro administrativo de funcionários','dados pessoais e contratuais','execução de contrato e obrigação legal','Gestão de vínculo, folha, benefícios e obrigações trabalhistas.','Prazo legal trabalhista e previdenciário aplicável.','Contabilidade e sistemas administrativos contratados.','22222222-2222-4222-8222-222222222222'),
  ('17171717-1717-4717-8717-171717171602','11111111-1111-4111-8111-111111111111','Cadastro de fornecedores','dados de contato e representantes','execução de contrato','Contratação, pagamento e gestão de fornecedores.','Durante vigência contratual e prazo fiscal.','Financeiro interno e contabilidade.','22222222-2222-4222-8222-222222222222')
on conflict (id) do nothing;

insert into public.lgpd_solicitacoes (id, cartorio_id, titular_nome, titular_email, tipo, prazo_resposta, status, responsavel_id, observacoes)
values
  ('17171717-1717-4717-8717-171717171801','11111111-1111-4111-8111-111111111111','Marina Duarte','marina.duarte@example.com','acesso aos dados',current_date + 8,'em atendimento','22222222-2222-4222-8222-222222222222','Solicitação recebida pelo canal administrativo.'),
  ('17171717-1717-4717-8717-171717171802','11111111-1111-4111-8111-111111111111','Paulo Nunes','paulo.nunes@example.com','correção',current_date + 18,'aberta','22222222-2222-4222-8222-222222222222','Atualizar dados de contato do representante.')
on conflict (id) do nothing;

insert into public.lgpd_politicas (id, cartorio_id, titulo, versao, documento_url, validade_em, status)
values
  ('17171717-1717-4717-8717-171717171901','11111111-1111-4111-8111-111111111111','Política interna de privacidade e proteção de dados','1.0','/documentos/politica-lgpd-v1.pdf',current_date + 180,'ativa'),
  ('17171717-1717-4717-8717-171717171902','11111111-1111-4111-8111-111111111111','Procedimento de resposta a titulares','1.1','/documentos/resposta-titulares.pdf',current_date + 120,'ativa')
on conflict (id) do nothing;

insert into public.lgpd_treinamentos (id, cartorio_id, titulo, data_treinamento, responsavel_id, participantes, comprovante_url)
values
  ('17171717-1717-4717-8717-171717172001','11111111-1111-4111-8111-111111111111','Treinamento LGPD para equipe administrativa',current_date - 12,'22222222-2222-4222-8222-222222222222','["Ana Ribeiro","Carlos Mendes","Juliana Paes"]'::jsonb,'/documentos/treinamento-lgpd.pdf')
on conflict (id) do nothing;

insert into public.lgpd_fornecedores_operadores (id, cartorio_id, fornecedor_id, descricao_tratamento, dados_tratados, contrato_operador_url, status)
values
  ('17171717-1717-4717-8717-171717172101','11111111-1111-4111-8111-111111111111','66666666-6666-4666-8666-666666666601','Hospedagem e suporte do sistema administrativo.','dados cadastrais de usuários, fornecedores e funcionários','/documentos/dpa-tecnocart.pdf','ativo'),
  ('17171717-1717-4717-8717-171717172102','11111111-1111-4111-8111-111111111111','66666666-6666-4666-8666-666666666602','Processamento de folha e obrigações acessórias.','dados pessoais, contratuais e financeiros de funcionários','/documentos/dpa-contabilidade.pdf','ativo')
on conflict (id) do nothing;

insert into public.chat_mensagens (id, cartorio_id, conversa_id, usuario_id, mensagem, anexos, fixada)
values
  ('21212121-2121-4121-8121-212121212101','11111111-1111-4111-8111-111111111111','20202020-2020-4020-8020-202020202001','22222222-2222-4222-8222-222222222222','Bom dia. Agenda administrativa atualizada com vencimentos da semana.','[]'::jsonb,true),
  ('21212121-2121-4121-8121-212121212102','11111111-1111-4111-8111-111111111111','20202020-2020-4020-8020-202020202002','22222222-2222-4222-8222-222222222222','Boleto de internet vence hoje e está pendente de comprovante.','[]'::jsonb,false)
on conflict (id) do nothing;

insert into public.configuracoes (id, cartorio_id, chave, valor)
values
  ('22222222-2222-4222-8222-222222222301','11111111-1111-4111-8111-111111111111','tarefas','{"preservar_conclusao_ao_reabrir":false,"alerta_vencimento_horas":24}'::jsonb),
  ('22222222-2222-4222-8222-222222222302','11111111-1111-4111-8111-111111111111','notificacoes','{"email":false,"interno":true,"whatsapp":false}'::jsonb)
on conflict (cartorio_id, chave) do update set valor = excluded.valor, updated_at = now();
