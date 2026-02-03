# 📦 Página de Estoque - Documentação

## 📋 Resumo

Página completa de gerenciamento de estoque com CRUD (Create, Read, Update, Delete) integrado ao Supabase.

## 🎯 Funcionalidades

✅ **Adicionar Produtos/Serviços**
- Nome do produto/serviço
- Valor unitário
- Quantidade em estoque

✅ **Visualizar Estoque**
- Tabela com todos os produtos
- Cálculo automático do valor total (unitário × quantidade)
- Listagem ordenada por data

✅ **Editar Produtos**
- Modal para edição de dados
- Atualização em tempo real

✅ **Excluir Produtos**
- Confirmação antes de deletar
- Remoção definitiva do estoque

✅ **Autenticação Integrada**
- Usa a mesma autenticação do index.html
- Sessão compartilhada via Supabase Auth
- Acesso APENAS através do botão em index.html
- Qualquer acesso direto redireciona para login em index.html

## 🗂️ Estrutura do Projeto

```
relatorio-vendas/
├── index.html              # Página principal de vendas
├── estoque.html            # Página de gerenciamento de estoque
├── admin.html              # Página administrativa (existente)
├── SQL_ESTOQUE.sql         # Script SQL para criar tabela
└── vercel_config.json      # Configuração Vercel
```

## 🚀 Como Implementar

### 1️⃣ Criar a Tabela no Supabase

1. Acesse sua conta em [supabase.com](https://supabase.com)
2. Vá para seu projeto
3. Clique em **SQL Editor** (ícone de chave inglesa)
4. Clique em **+ New Query**
5. Copie e cole o conteúdo do arquivo `SQL_ESTOQUE.sql`
6. Clique em **Run** para executar

### 2️⃣ Acessar a Página de Estoque

✅ **Forma correta (ÚNICA):**
1. Abra index.html
2. Faça login
3. Clique no botão **📦 Estoque**

❌ **Não acesse estoque.html diretamente** - será redirecionado para login em index.html

### 3️⃣ Arquivo HTML

O arquivo `estoque.html` já está pronto para uso com:
- Autenticação integrada (compartilhada com index.html)
- Verificação de sessão (redireciona se não autenticado)
- Formulário de entrada
- Tabela dinâmica
- Modais de edição e exclusão
- Tratamento de erros

## 📊 Estrutura da Tabela Supabase

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único |
| `user_id` | UUID | ID do usuário (referencia auth.users) |
| `product_name` | VARCHAR(100) | Nome do produto/serviço |
| `unit_price` | DECIMAL(10,2) | Valor unitário |
| `quantity` | INTEGER | Quantidade em estoque |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

## 🔒 Segurança

- **Row Level Security (RLS)** ativada
- Cada usuário vê apenas seus próprios produtos
- Operações de INSERT, UPDATE, DELETE verificam user_id
- Autenticação via Supabase Auth (compartilhada com index.html)
- Acesso ÚNICO através de botão em index.html

## 🎨 Estilo e Responsividade

- Design consistente com a página de vendas
- Cores: Gradiente roxo (#667eea → #764ba2)
- Totalmente responsivo (mobile-friendly)
- Animações suaves

## 💡 Recursos JavaScript

### Funções Principais

- `loadInventory()` - Carrega lista de produtos
- `addItem()` - Adiciona novo produto
- `openEditModal()` - Abre modal de edição
- `saveEdit()` - Salva alterações
- `openDeleteModal()` - Abre confirmação de exclusão
- `confirmDelete()` - Confirma e executa deleção

## 🔗 Integração com o Projeto Existente

A página `estoque.html` usa a mesma configuração do Supabase:
```javascript
const SUPABASE_URL = "https://excdrnjzwldleyzpdriv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

Compartilha a **sessão de autenticação** com index.html:
```javascript
// Verifica se existe sessão do Supabase
const { data: { session } } = await db.auth.getSession();
// Se não existir, redireciona para index.html
if (!session) window.location.href = 'index.html';
```

## 📝 Exemplo de Uso

1. Faça login em index.html
2. Clique no botão **📦 Estoque**
3. Preencha os campos:
   - Nome: "Consultoria Premium"
   - Valor Unitário: 150.00
   - Quantidade: 5
4. Clique em "Adicionar"
5. Produto aparece na tabela com valor total: R$ 750.00
6. Use botões para editar ou excluir

## 🐛 Troubleshooting

**Problema:** Redirecionado para index.html ao abrir estoque.html
- Comportamento correto! Você precisa fazer login em index.html primeiro

**Problema:** Dados não aparecem
- Verifique se você fez login em index.html
- Confirme se a tabela foi criada no Supabase

**Problema:** Erro ao adicionar produto
- Verifique se os campos estão preenchidos
- Números devem ser válidos
- Verifique o console do navegador (F12)

**Problema:** Modal não abre
- Verifique o console do navegador (F12)
- Limpe o cache do navegador (Ctrl+F5)

## 📱 Acesso Rápido

- Acessar via: **Botão em index.html**
- Requer: **Login em index.html**
- Dados: **Sincronizados em tempo real**

---

**Versão:** 1.0  
**Última atualização:** Fevereiro 2026
