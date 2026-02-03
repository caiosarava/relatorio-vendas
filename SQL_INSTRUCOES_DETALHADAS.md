# 🗄️ INSTRUÇÕES DETALHADAS - EXECUTAR SQL NO SUPABASE

## 📍 PASSO A PASSO

### 1️⃣ Acessar o Painel do Supabase

1. Abra [supabase.com](https://supabase.com)
2. Faça login com sua conta
3. Selecione seu projeto (relatório-vendas)

### 2️⃣ Ir para SQL Editor

No menu lateral esquerdo:
- Clique em **SQL Editor** (ícone de chave inglesa)

OU navegue por:
- Menu principal > Development > SQL

### 3️⃣ Criar Nova Query

- Clique no botão **+ New Query** (ou "New" verde)
- Você verá um editor em branco

### 4️⃣ Copiar e Colar o Script

Copie **TODO** o código abaixo e cole no editor:

```sql
-- SQL para criar a tabela de estoque no Supabase
-- Execute este script no painel SQL do Supabase

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
```

### 5️⃣ Executar o Script

- Clique no botão **Run** (triângulo verde ▶️) no canto inferior direito
- OU pressione **Ctrl + Enter**

### 6️⃣ Verificar Se Funcionou

Você deve ver:
```
✅ Query executed successfully
```

Se houver erro vermelho, verifique:
- Se você copiou todo o código
- Se não há caracteres inválidos
- Tente novamente

### 7️⃣ Confirmar Tabela Criada (Opcional)

Para verificar que tudo funcionou:

1. No SQL Editor, crie uma nova query
2. Execute este comando:
```sql
SELECT * FROM inventory;
```

Você deve ver:
```
| id | user_id | product_name | unit_price | quantity | created_at | updated_at |
|----|---------|--------------|------------|----------|------------|------------|
(nenhuma linha - tabela vazia, mas existe!)
```

---

## 🔍 O QUE CADA PARTE FAZ

### CREATE TABLE
```sql
CREATE TABLE IF NOT EXISTS inventory (
  id BIGSERIAL PRIMARY KEY,                          -- ID único auto-incrementado
  user_id UUID NOT NULL REFERENCES auth.users(id),   -- Referência ao usuário
  product_name VARCHAR(100) NOT NULL,                -- Nome do produto (até 100 chars)
  unit_price DECIMAL(10, 2) NOT NULL,               -- Preço unitário (ex: 150.50)
  quantity INTEGER NOT NULL,                        -- Quantidade em estoque
  created_at TIMESTAMP WITH TIME ZONE DEFAULT ...,  -- Hora de criação (automática)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT ...   -- Hora de atualização (automática)
);
```

### CREATE INDEX
```sql
-- Índices melhoram a velocidade de busca
CREATE INDEX inventory_user_id_idx ON inventory(user_id);      -- Para filtrar por usuário
CREATE INDEX inventory_created_at_idx ON inventory(created_at); -- Para ordenar por data
```

### ROW LEVEL SECURITY
```sql
-- Ativa segurança de nível de linha
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Políticas:
-- 1. SELECT: Só vê seus dados
-- 2. INSERT: Só insere dados seus
-- 3. UPDATE: Só atualiza dados seus
-- 4. DELETE: Só deleta dados seus
```

---

## ⚠️ POSSÍVEIS ERROS E SOLUÇÕES

### ❌ "Table already exists"
**Solução:** Isso é normal! O `IF NOT EXISTS` previne erros se executar 2x
```sql
-- Para resetar (CUIDADO - deleta dados!):
DROP TABLE inventory CASCADE;
```

### ❌ "Column 'user_id' does not exist"
**Solução:** Verifique se `auth.users` existe (deve estar no seu projeto)

### ❌ "Policy name already exists"
**Solução:** Rode o script novamente - as políticas já estão criadas

### ❌ "Permission denied"
**Solução:** Você precisa de permissões de admin. Peça ao dono do projeto.

---

## ✅ CHECKLIST FINAL

- [ ] Acessei [supabase.com](https://supabase.com)
- [ ] Selecionei meu projeto
- [ ] Fui para SQL Editor
- [ ] Criei uma nova query
- [ ] Copiei e colei TODO o script SQL
- [ ] Cliquei em Run
- [ ] Vi a mensagem "Query executed successfully"
- [ ] Executei `SELECT * FROM inventory;` para confirmar

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Verifique a documentação do Supabase: https://supabase.com/docs
2. Procure por "SQL Editor" na documentação
3. Abra a aba "Exceptions" no editor para ver detalhes de erro

---

**Tudo pronto! 🎉**

Agora a tabela está criada e a página `estoque.html` pode usar!
