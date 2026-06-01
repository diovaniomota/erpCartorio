# Aviso sobre dados pessoais (PII) no ambiente de demonstração

## Contexto

O CartórioHub não possui seeds automatizados — os dados de exemplo foram
inseridos manualmente no Supabase. Isso significa que registros com
**informações pessoais reais** (CPF, e-mail, telefone, salário) podem estar
presentes nas tabelas de funcionários e de outras entidades.

## O que fazer antes de usar este repositório em ambiente compartilhado

### 1. Revisar a tabela `funcionarios` no Supabase

Acesse o Supabase Studio → Table Editor → `funcionarios` e verifique se há:

- [ ] CPF real (deve ser substituído por dado fictício, ex.: `000.000.000-00`)
- [ ] E-mail real (substituir por ex.: `funcionario@exemplo.com`)
- [ ] Telefone real (substituir por ex.: `(00) 00000-0000`)
- [ ] Salário real (substituir por valor genérico ou remover)
- [ ] Nome completo real de pessoa identificável

### 2. Revisar outras tabelas sensíveis

- [ ] `profiles` — nome, e-mail
- [ ] `fornecedores` — CNPJ/CPF, e-mail, telefone de contato
- [ ] `chat_mensagens` — conteúdo de mensagens internas

### 3. Recomendação: criar script de seed com dados fictícios

Para evitar que PII real seja inserido manualmente no futuro, crie um script
de seed em `scripts/seed.ts` (ou `seed.sql`) usando dados gerados por
ferramentas como [Faker.js](https://fakerjs.dev/) ou
[Mockaroo](https://www.mockaroo.com/).

Exemplo de dado fictício para funcionário:
```json
{
  "nome": "Maria Aparecida dos Santos",
  "cpf": "000.000.000-00",
  "email": "maria.santos@cartoriohub.exemplo",
  "telefone": "(00) 00000-0000",
  "salario": 0
}
```

## Política de exportação de dados sensíveis

O módulo RH **omite CPF completo e salário** das exportações CSV/PDF
(conforme correção P1.2). O CPF exibido na tela é mascarado (`•••.•••.•••-XX`).

Nunca commite arquivos `.env` ou dumps do banco com dados reais.
