# Instruções para Configurar o Supabase

Para que o sistema funcione corretamente, você precisa executar o script SQL no Supabase para configurar as políticas de segurança e atualizar os leads existentes.

## Passo 1: Acessar o Painel do Supabase

1. Acesse [https://app.supabase.io/](https://app.supabase.io/)
2. Faça login com sua conta
3. Selecione o projeto "LeadFlow"

## Passo 2: Acessar o Editor SQL

1. No menu lateral, clique em "SQL Editor"
2. Clique em "New Query" para criar uma nova consulta

## Passo 3: Executar o Script SQL

1. Cole o seguinte código SQL no editor:

```sql
-- Primeiro, adiciona as colunas se ainda não existirem
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Atualiza todos os leads existentes para serem públicos
UPDATE leads
SET is_public = true
WHERE is_public IS NULL;

-- Remove políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios leads" ON leads;
DROP POLICY IF EXISTS "Política de visualização de leads" ON leads;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios leads" ON leads;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios leads" ON leads;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios leads" ON leads;

-- Ativa RLS na tabela leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Cria política de visualização
CREATE POLICY "Política de visualização de leads"
ON leads FOR SELECT
TO authenticated
USING (
  is_public = true OR auth.uid() = user_id
);

-- Cria política de inserção
CREATE POLICY "Usuários podem inserir seus próprios leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Cria política de atualização
CREATE POLICY "Usuários podem atualizar seus próprios leads"
ON leads FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Cria política de deleção
CREATE POLICY "Usuários podem deletar seus próprios leads"
ON leads FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);
```

2. Clique em "Run" para executar o script

## Passo 4: Verificar a Configuração

1. No menu lateral, clique em "Authentication" e depois em "Policies"
2. Verifique se as políticas foram criadas corretamente para a tabela "leads"
3. No menu lateral, clique em "Table Editor" e selecione a tabela "leads"
4. Verifique se as colunas "user_id" e "is_public" foram adicionadas
5. Verifique se os leads existentes estão marcados como públicos (is_public = true)

## Passo 5: Criar Bucket para Armazenamento de Arquivos

1. No menu lateral, clique em "Storage"
2. Clique em "Create Bucket"
3. Digite "lead-files" como nome do bucket
4. Marque a opção "Public" para tornar o bucket público
5. Clique em "Create Bucket" para criar

Após seguir esses passos, o sistema deve funcionar corretamente com autenticação e controle de acesso aos leads. 