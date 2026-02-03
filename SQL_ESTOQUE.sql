-- SQL para criar a tabela de estoque no Supabase
-- Execute este script no painel SQL do Supabase (Database > SQL Editor)
-- 
-- CONFIGURAÇÃO DE ACESSO:
-- - A página estoque.html é acessada APENAS através de um botão em index.html
-- - Usuários fazem login uma única vez em index.html
-- - A sessão do Supabase Auth é compartilhada entre as páginas
-- - Qualquer tentativa de acessar estoque.html diretamente sem autenticação redireciona para index.html

-- Criar tabela de inventário
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name VARCHAR(100) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS inventory_user_id_idx ON inventory(user_id);
CREATE INDEX IF NOT EXISTS inventory_created_at_idx ON inventory(created_at);

-- Configurar Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios itens
CREATE POLICY "Users can view their own inventory items"
ON inventory FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir apenas em sua própria conta
CREATE POLICY "Users can insert their own inventory items"
ON inventory FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar apenas seus próprios itens
CREATE POLICY "Users can update their own inventory items"
ON inventory FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar apenas seus próprios itens
CREATE POLICY "Users can delete their own inventory items"
ON inventory FOR DELETE
USING (auth.uid() = user_id);
