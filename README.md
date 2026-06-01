# CartórioHub

ERP administrativo para cartórios e serventias, com foco em backoffice interno: financeiro, fornecedores, contratos, RH, agenda, documentos, tarefas, central oficial, LGPD e auditoria.

O sistema não implementa atos registrais, escrituras, certidões ou protocolos cartorários. A arquitetura é multi-tenant por `cartorio_id` e preparada para Supabase/PostgreSQL com RLS.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + componentes no padrão shadcn/ui
- Supabase Auth, PostgreSQL e Storage
- React Hook Form + Zod
- FullCalendar
- dnd-kit para Kanban
- Recharts para gráficos

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

As variáveis do Supabase são obrigatórias. Sem `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, o sistema bloqueia o acesso administrativo.

## Supabase

1. Crie um projeto Supabase.
2. Configure `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Aplique a migration:

```bash
supabase db push
```

4. Rode o seed para criar a estrutura inicial:

```bash
supabase db reset
```

Usuário administrador inicial do seed:

- E-mail: `admin@cartoriohub.local`
- Senha: `CartorioHub@123`

Se o projeto já estiver criado no Supabase remoto, você também pode executar `supabase/create_admin_account.sql` no SQL Editor para recriar o cartório, o perfil e a identidade Auth do administrador inicial.

## Estrutura

```text
src/
  app/                 Rotas App Router
  components/
    layout/            Sidebar e topbar
    shared/            DataTable, StatCard, Kanban, calendário, badges
    ui/                Componentes base shadcn-like
  lib/                 Supabase, auth, permissões, dados e helpers
  modules/             Actions, queries e schemas por domínio
supabase/
  migrations/          Schema SQL com RLS
  seed.sql             Dados iniciais
```

## Multi-tenant e segurança

- Todas as tabelas administrativas possuem `cartorio_id`.
- RLS isola leitura, inserção e atualização por `app.current_cartorio_id()`.
- `requirePermission(permission)` valida permissões no servidor.
- Operações sensíveis registram `auditoria_logs`.
- Registros críticos usam soft delete com `deleted_at`, `deleted_by` e `motivo_exclusao`.

## Módulos entregues no MVP

- Autenticação Supabase
- Layout administrativo responsivo
- Dashboard com indicadores e gráficos
- Central Oficial manual e fontes monitoradas
- Agenda com FullCalendar
- Financeiro, contas, boletos e livro caixa
- Fornecedores e contratos
- Inventário inicial
- RH, funcionários e atestados
- LGPD básico com incidentes
- Documentos internos
- Tarefas Kanban com drag and drop
- Chat interno com persistência no banco
- Relatórios estruturais
- Usuários, permissões e auditoria
