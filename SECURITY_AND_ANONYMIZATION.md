# Arquitetura de Segurança, Criação de Usuários e Anonimização de Dados

Este documento descreve a análise de arquitetura para a criação de usuários, acesso ao aplicativo e disponibilização de dados de vendas de forma anônima para análise de tomada de decisão.

---

## 1. Contexto e Diagnóstico do Sistema Atual

### **Fluxo de Criação de Usuários e Autenticação**
1. **Cadastro (`index.html`)**:
   - O usuário realiza cadastro via Supabase Auth (`signUp`).
   - Um perfil correspondente é criado na tabela `profiles` com `id` (FK para `auth.users`), `name`, `venture_name` e `email`.
2. **Registro e Atualização de Vendas (`index.html`)**:
   - Cada venda inserida guarda o `user_id` e dados do produto, valor, quantidade e meio de pagamento.
   - Além disso, envia dados para o webhook do Google Sheets para backup/planilha externa.
3. **Acesso Administrativo (`admin.html`)**:
   - Painel administrativo consulta dados agregados de `sales` e `profiles` do Supabase para exibir estatísticas globais, gráficos e tabelas de vendas/usuários.

---

## 2. Mudanças de Segurança e Anonimização Implementadas

### **A. Análise e Dashboard Anônimo (`admin.html`)**
- **Modo Anônimo Ativado por Padrão**: O painel administrativo foi equipado com um controle (*toggle*) **🕵️ Modo Anônimo**.
- **Pseudonimização Determinística Baseada em Hash**:
  - Usuários e empreendimentos são convertidos de forma consistente em pseudônimos (ex: `USU #88B3`, `EMP #A4F1`).
  - Permite a análise de vendas e comportamento de cohortes ao longo do tempo sem revelar a identidade real (PII) dos empreendedores.
- **Tabelas e Gráficos Anônimos**:
  - **Filtro de Usuários**: Exibe pseudônimos dos usuários e empreendimentos no modo anônimo.
  - **Tabela de Vendas e Tabela de Usuários**: Substitui Nomes, Emails e Nomes de Empreendimentos por identificadores pseudonimizados.
  - **Gráficos por Empreendimento**: Agrupa vendas mantendo a separação por empreendimento, mas utilizando a legenda anonimizada.

### **B. Proteção na Entrada de Dados e Integração com Webhook (`index.html`)**
- Na criação/edição de vendas, o payload enviado ao Google Sheets e ao banco armazena referências anonimizadas (`username` e `venturename` pseudonimizados e e-mail genérico `anonimo@ecosol.org` no webhook).

---

## 3. Diretrizes de Segurança e Políticas RLS no Supabase (Banco de Dados)

Para garantir a privacidade e segurança em nível de banco de dados, recomenda-se a aplicação das seguintes políticas no Supabase (SQL Editor):

### **1. Habilitar Row Level Security (RLS)**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
```

### **2. Políticas de Acesso para Usuários Comuns (Aplicativo `index.html`)**
```sql
-- Usuários podem ler apenas o próprio perfil
CREATE POLICY "Leitura de perfil próprio" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Usuários podem inserir apenas o próprio perfil
CREATE POLICY "Inserção de perfil próprio" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas o próprio perfil
CREATE POLICY "Atualização de perfil próprio" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Usuários podem ver apenas suas próprias vendas
CREATE POLICY "Leitura das próprias vendas" ON sales
FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir apenas vendas com seu user_id
CREATE POLICY "Inserção das próprias vendas" ON sales
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem editar e excluir apenas suas próprias vendas
CREATE POLICY "Edição das próprias vendas" ON sales
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Exclusão das próprias vendas" ON sales
FOR DELETE USING (auth.uid() = user_id);
```

### **3. View Anonimizada para Análise de Dados e BI**
Para disponibilização de relatórios externos e dashboards de decisão sem expor dados pessoais:

```sql
CREATE OR REPLACE VIEW anonymous_sales_analytics AS
SELECT
    s.id AS sale_id,
    s.date,
    s.product,
    s.quantity,
    s.unit_price,
    s.total,
    s.payment_methods,
    s.card_type,
    'EMP #' || SUBSTRING(MD5(COALESCE(p.venture_name, p.id::text)) FROM 1 FOR 4) AS anonymous_venture_code,
    'USU #' || SUBSTRING(MD5(s.user_id::text) FROM 1 FOR 4) AS anonymous_user_code
FROM sales s
LEFT JOIN profiles p ON s.user_id = p.id;
```

---

## 4. Benefícios Conquistados
1. **Conformidade com a LGPD e Privacidade**: Protege dados pessoais dos usuários contra exposição indevida.
2. **Capacidade Analítica Preservada**: Permite a tomada de decisão estratégica e visualização de métricas do negócio (Receita, Top Produtos, Meios de Pagamento) mantendo os agrupamentos consistentes.
3. **Flexibilidade Administrativa**: Permite ao gestor alternar para o modo identificado apenas quando estritamente necessário.
