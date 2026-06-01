-- ═══════════════════════════════════════════════════════════════════════════
-- CartórioHub — Row Level Security (RLS) Policies
-- Execute no SQL Editor do Supabase Studio
-- ═══════════════════════════════════════════════════════════════════════════
--
-- COMO USAR:
--   1. Copie e cole todo o conteúdo no Supabase Studio → SQL Editor
--   2. Execute tudo de uma vez (Run All) ou seção por seção
--   3. Após executar, vá em Database → Tables e confirme que RLS está ON
--      em cada tabela (ícone de cadeado verde)
--
-- ATENÇÃO: Este script usa IF NOT EXISTS onde disponível.
--   Execute em ambiente de staging antes de produção.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── 1. Helper function ──────────────────────────────────────────────────────
-- Retorna o cartorio_id do usuário autenticado.
-- SECURITY DEFINER permite que a função leia profiles mesmo com RLS ativo.
CREATE OR REPLACE FUNCTION public.auth_cartorio_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cartorio_id
  FROM public.profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;


-- ── 2. Tabela: profiles ──────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    cartorio_id = public.auth_cartorio_id()
    OR auth_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- INSERT/DELETE are admin operations — handled via service_role in Supabase Auth hooks
-- Regular users never INSERT/DELETE their own profile directly


-- ── 3. Tabela: cartorios ─────────────────────────────────────────────────────
ALTER TABLE public.cartorios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cartorios_select_own" ON public.cartorios;
CREATE POLICY "cartorios_select_own" ON public.cartorios
  FOR SELECT TO authenticated
  USING (id = public.auth_cartorio_id());

-- Only service_role (admin) can INSERT/UPDATE/DELETE cartorios


-- ── 4. Macro: isolation for all tables with cartorio_id ─────────────────────
-- The following tables share the same pattern:
--   SELECT/INSERT/UPDATE/DELETE restricted to own cartorio_id
--
-- funcionarios, fornecedores, contratos, inventario_itens,
-- inventario_manutencoes, documentos_internos, financeiro_contas,
-- financeiro_categorias, livro_caixa, auditoria_logs, configuracoes,
-- permissoes, perfis, notificacoes, tarefas, agenda_eventos,
-- chat_mensagens, central_oficial_updates (or official_updates),
-- lgpd_incidentes, lgpd_solicitacoes, lgpd_politicas, lgpd_treinamentos,
-- lgpd_inventario_dados, lgpd_fornecedores_operadores,
-- rh_atestados (or atestados), rh_ferias (or ferias),
-- rh_beneficios (or beneficios), rh_ponto (or ponto),
-- inventario_movimentacoes

-- Template (repeat for each table, adjusting the table name):
-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;                    │
-- │                                                                           │
-- │ DROP POLICY IF EXISTS "<table>_cartorio_isolation" ON public.<table>;     │
-- │ CREATE POLICY "<table>_cartorio_isolation" ON public.<table>             │
-- │   FOR ALL TO authenticated                                                │
-- │   USING (cartorio_id = public.auth_cartorio_id())                        │
-- │   WITH CHECK (cartorio_id = public.auth_cartorio_id());                  │
-- └──────────────────────────────────────────────────────────────────────────┘

-- funcionarios
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "funcionarios_cartorio_isolation" ON public.funcionarios;
CREATE POLICY "funcionarios_cartorio_isolation" ON public.funcionarios
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- fornecedores
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fornecedores_cartorio_isolation" ON public.fornecedores;
CREATE POLICY "fornecedores_cartorio_isolation" ON public.fornecedores
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- contratos
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contratos_cartorio_isolation" ON public.contratos;
CREATE POLICY "contratos_cartorio_isolation" ON public.contratos
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- inventario_itens
ALTER TABLE public.inventario_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventario_itens_cartorio_isolation" ON public.inventario_itens;
CREATE POLICY "inventario_itens_cartorio_isolation" ON public.inventario_itens
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- inventario_manutencoes
ALTER TABLE public.inventario_manutencoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventario_manutencoes_cartorio_isolation" ON public.inventario_manutencoes;
CREATE POLICY "inventario_manutencoes_cartorio_isolation" ON public.inventario_manutencoes
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- inventario_movimentacoes
ALTER TABLE public.inventario_movimentacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventario_movimentacoes_cartorio_isolation" ON public.inventario_movimentacoes;
CREATE POLICY "inventario_movimentacoes_cartorio_isolation" ON public.inventario_movimentacoes
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- documentos_internos
ALTER TABLE public.documentos_internos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "documentos_internos_cartorio_isolation" ON public.documentos_internos;
CREATE POLICY "documentos_internos_cartorio_isolation" ON public.documentos_internos
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- financeiro_contas
ALTER TABLE public.financeiro_contas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "financeiro_contas_cartorio_isolation" ON public.financeiro_contas;
CREATE POLICY "financeiro_contas_cartorio_isolation" ON public.financeiro_contas
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- financeiro_categorias
ALTER TABLE public.financeiro_categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "financeiro_categorias_cartorio_isolation" ON public.financeiro_categorias;
CREATE POLICY "financeiro_categorias_cartorio_isolation" ON public.financeiro_categorias
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- livro_caixa
ALTER TABLE public.livro_caixa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "livro_caixa_cartorio_isolation" ON public.livro_caixa;
CREATE POLICY "livro_caixa_cartorio_isolation" ON public.livro_caixa
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- auditoria_logs
ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auditoria_logs_cartorio_isolation" ON public.auditoria_logs;
CREATE POLICY "auditoria_logs_cartorio_isolation" ON public.auditoria_logs
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- configuracoes
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "configuracoes_cartorio_isolation" ON public.configuracoes;
CREATE POLICY "configuracoes_cartorio_isolation" ON public.configuracoes
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- permissoes
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "permissoes_cartorio_isolation" ON public.permissoes;
CREATE POLICY "permissoes_cartorio_isolation" ON public.permissoes
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "perfis_cartorio_isolation" ON public.perfis;
CREATE POLICY "perfis_cartorio_isolation" ON public.perfis
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- notificacoes
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notificacoes_cartorio_isolation" ON public.notificacoes;
CREATE POLICY "notificacoes_cartorio_isolation" ON public.notificacoes
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- tarefas
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tarefas_cartorio_isolation" ON public.tarefas;
CREATE POLICY "tarefas_cartorio_isolation" ON public.tarefas
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- agenda_eventos
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "agenda_eventos_cartorio_isolation" ON public.agenda_eventos;
CREATE POLICY "agenda_eventos_cartorio_isolation" ON public.agenda_eventos
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- chat_mensagens
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat_mensagens_cartorio_isolation" ON public.chat_mensagens;
CREATE POLICY "chat_mensagens_cartorio_isolation" ON public.chat_mensagens
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- official_updates (Central Oficial) — adjust table name if different
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'official_updates' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.official_updates ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "official_updates_cartorio_isolation" ON public.official_updates';
    EXECUTE $p$CREATE POLICY "official_updates_cartorio_isolation" ON public.official_updates
      FOR ALL TO authenticated
      USING (cartorio_id = public.auth_cartorio_id())
      WITH CHECK (cartorio_id = public.auth_cartorio_id())$p$;
  END IF;
END $$;

-- lgpd_incidentes
ALTER TABLE public.lgpd_incidentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lgpd_incidentes_cartorio_isolation" ON public.lgpd_incidentes;
CREATE POLICY "lgpd_incidentes_cartorio_isolation" ON public.lgpd_incidentes
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- lgpd_solicitacoes
ALTER TABLE public.lgpd_solicitacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lgpd_solicitacoes_cartorio_isolation" ON public.lgpd_solicitacoes;
CREATE POLICY "lgpd_solicitacoes_cartorio_isolation" ON public.lgpd_solicitacoes
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- lgpd_politicas
ALTER TABLE public.lgpd_politicas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lgpd_politicas_cartorio_isolation" ON public.lgpd_politicas;
CREATE POLICY "lgpd_politicas_cartorio_isolation" ON public.lgpd_politicas
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- lgpd_treinamentos
ALTER TABLE public.lgpd_treinamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lgpd_treinamentos_cartorio_isolation" ON public.lgpd_treinamentos;
CREATE POLICY "lgpd_treinamentos_cartorio_isolation" ON public.lgpd_treinamentos
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- lgpd_inventario_dados
ALTER TABLE public.lgpd_inventario_dados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lgpd_inventario_dados_cartorio_isolation" ON public.lgpd_inventario_dados;
CREATE POLICY "lgpd_inventario_dados_cartorio_isolation" ON public.lgpd_inventario_dados
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- lgpd_fornecedores_operadores
ALTER TABLE public.lgpd_fornecedores_operadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lgpd_fornecedores_operadores_cartorio_isolation" ON public.lgpd_fornecedores_operadores;
CREATE POLICY "lgpd_fornecedores_operadores_cartorio_isolation" ON public.lgpd_fornecedores_operadores
  FOR ALL TO authenticated
  USING (cartorio_id = public.auth_cartorio_id())
  WITH CHECK (cartorio_id = public.auth_cartorio_id());

-- atestados (rh)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'atestados' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.atestados ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "atestados_cartorio_isolation" ON public.atestados';
    EXECUTE $p$CREATE POLICY "atestados_cartorio_isolation" ON public.atestados
      FOR ALL TO authenticated
      USING (cartorio_id = public.auth_cartorio_id())
      WITH CHECK (cartorio_id = public.auth_cartorio_id())$p$;
  END IF;
END $$;

-- ferias (rh)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ferias' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.ferias ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "ferias_cartorio_isolation" ON public.ferias';
    EXECUTE $p$CREATE POLICY "ferias_cartorio_isolation" ON public.ferias
      FOR ALL TO authenticated
      USING (cartorio_id = public.auth_cartorio_id())
      WITH CHECK (cartorio_id = public.auth_cartorio_id())$p$;
  END IF;
END $$;

-- beneficios (rh)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beneficios' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.beneficios ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "beneficios_cartorio_isolation" ON public.beneficios';
    EXECUTE $p$CREATE POLICY "beneficios_cartorio_isolation" ON public.beneficios
      FOR ALL TO authenticated
      USING (cartorio_id = public.auth_cartorio_id())
      WITH CHECK (cartorio_id = public.auth_cartorio_id())$p$;
  END IF;
END $$;

-- ponto (rh)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ponto' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.ponto ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "ponto_cartorio_isolation" ON public.ponto';
    EXECUTE $p$CREATE POLICY "ponto_cartorio_isolation" ON public.ponto
      FOR ALL TO authenticated
      USING (cartorio_id = public.auth_cartorio_id())
      WITH CHECK (cartorio_id = public.auth_cartorio_id())$p$;
  END IF;
END $$;


-- ── 5. Verificação final ─────────────────────────────────────────────────────
-- Execute esta query para confirmar quais tabelas têm RLS habilitado:
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE schemaname = t.schemaname AND tablename = t.tablename) AS policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- Tabelas sem RLS (rowsecurity = false) que aparecerem aqui precisam de
-- atenção manual — verifique se têm cartorio_id e adicione a policy acima.
