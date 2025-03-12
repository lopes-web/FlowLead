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