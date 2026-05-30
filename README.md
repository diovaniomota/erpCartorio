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

Sem variáveis Supabase, a aplicação roda em modo demo local com dados seedados em memória. Nesse modo, formulários validam os dados e exibem sucesso, mas a persistência real acontece apenas quando o Supabase está configurado.

## Supabase

1. Crie um projeto Supabase.
2. Configure `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Aplique a migration:

```bash
supabase db push
```

4. Rode o seed:

```bash
supabase db reset
```

Usuário demo do seed:

- E-mail: `admin@cartoriohub.local`
- Senha: `CartorioHub@123`

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

- Autenticação Supabase com fallback demo
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
- Chat interno estrutural
- Relatórios estruturais
- Usuários, permissões e auditoria
