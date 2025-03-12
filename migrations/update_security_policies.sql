-- Primeiro, torna todos os leads existentes públicos
UPDATE leads
SET is_public = true
WHERE created_at < NOW();

-- Remove políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seus próprios leads" ON leads;

-- Cria nova política de visualização
CREATE POLICY "Política de visualização de leads"
ON leads FOR SELECT
TO authenticated
USING (
  -- Leads antigos são públicos
  (created_at < NOW() AND is_public = true)
  -- Leads novos seguem a regra de visibilidade
  OR (created_at >= NOW() AND (auth.uid() = user_id OR is_public = true))
);

-- Atualiza política de inserção
CREATE POLICY "Usuários podem inserir seus próprios leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Atualiza política de atualização
CREATE POLICY "Usuários podem atualizar seus próprios leads"
ON leads FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Atualiza política de deleção
CREATE POLICY "Usuários podem deletar seus próprios leads"
ON leads FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
); 