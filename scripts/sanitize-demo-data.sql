-- Script para substituir dados pessoais reais por dados fictícios
-- Execute no SQL Editor do Supabase Studio antes de usar este ambiente como demo
--
-- ATENÇÃO: ajuste o filtro WHERE conforme os registros reais encontrados.
-- Padrão dos demais registros: email @cartoriohub.local, telefone (48) 99999-xxxx

-- Funcionários com e-mail externo (Gmail, Hotmail, Outlook, Yahoo, etc.)
UPDATE funcionarios
SET
  nome          = 'Colaborador Fictício',
  cpf           = '000.000.000-00',
  email         = 'colaborador@cartoriohub.local',
  telefone      = '(48) 99999-0000',
  salario       = 0
WHERE email ILIKE '%@gmail.%'
   OR email ILIKE '%@hotmail.%'
   OR email ILIKE '%@outlook.%'
   OR email ILIKE '%@yahoo.%'
   OR telefone ~ '^[0-9]{10,11}$';   -- telefone sem máscara

-- Fornecedores com e-mail externo
UPDATE fornecedores
SET
  email         = 'contato@fornecedor.local',
  telefone      = '(48) 3333-0000'
WHERE email ILIKE '%@gmail.%'
   OR email ILIKE '%@hotmail.%'
   OR email ILIKE '%@outlook.%'
   OR email ILIKE '%@yahoo.%';

-- Profiles (usuários do sistema) com e-mail externo
UPDATE profiles
SET email = 'usuario@cartoriohub.local'
WHERE email ILIKE '%@gmail.%'
   OR email ILIKE '%@hotmail.%'
   OR email ILIKE '%@outlook.%'
   OR email ILIKE '%@yahoo.%';

-- Verificação: retorna linhas que ainda podem conter PII após a sanitização
SELECT 'funcionarios' AS tabela, id, nome, email, telefone
FROM funcionarios
WHERE email NOT ILIKE '%@cartoriohub.local'
  AND email NOT ILIKE '%@%.local'
  AND email IS NOT NULL
UNION ALL
SELECT 'fornecedores', id, nome, email, telefone
FROM fornecedores
WHERE email NOT ILIKE '%@cartoriohub.local'
  AND email NOT ILIKE '%@%.local'
  AND email IS NOT NULL;
