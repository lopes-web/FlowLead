-- Adiciona coluna user_id e is_public na tabela leads
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Atualiza as políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios leads"
ON leads FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR is_public = true
);

CREATE POLICY "Usuários podem inserir seus próprios leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Usuários podem atualizar seus próprios leads"
ON leads FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Usuários podem deletar seus próprios leads"
ON leads FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
); 