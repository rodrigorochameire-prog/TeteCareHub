# Sprint 5 — Financeiro Completo

**Data:** 2026-03-29

---

## 1. Modelo de Dados

### Nova tabela: `expense_categories`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| name | varchar(100) | Ex: "Limpeza" |
| icon | varchar(50) | Ícone lucide |
| isDefault | boolean | Categoria padrão (não pode deletar) |
| isActive | boolean | default true |
| createdAt | timestamp | |

Seed: Limpeza, Manutenção, Decoração, Obras, Equipamentos, Alimentação (pets próprios), Veterinário, Outros

### Nova tabela: `expenses`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| categoryId | integer FK → expense_categories | |
| description | varchar(200) | Ex: "Desinfetante 5L" |
| amount | integer | Valor em centavos |
| date | date | Data da despesa |
| supplier | varchar(100) | Fornecedor (opcional) |
| receiptUrl | text | Foto nota/recibo (Supabase Storage) |
| notes | text | |
| createdById | integer FK → users | |
| createdAt | timestamp | |

### Sem alterações em tabelas existentes

Reutiliza transactions (receita), payment_requests (pagamentos), pets.credits (saldo), pet_plans (planos).

---

## 2. Dashboard Financeiro (`/admin/finances`)

Reescrever com dados reais:

### Topo — 4 cards resumo do mês
- Receita: soma pagamentos aprovados + créditos manuais
- Despesas: soma expenses
- Lucro: receita - despesas (verde/vermelho)
- Inadimplência: pets com 0 créditos + plano ativo

### Gráfico principal
Receita vs Despesas vs Lucro — últimos 6 meses. Dados reais de transactions + expenses.

### Semáforo de inadimplência
- Verde: créditos > 3
- Amarelo: créditos 1-3
- Vermelho: créditos 0 com plano ativo
- Cada pet: nome, tutor, créditos, último pagamento, botão "Cobrar via WhatsApp"

### Últimas transações
Lista das 10 últimas (pagamentos + despesas intercalados, ordenados por data).

---

## 3. Despesas (`/admin/expenses`)

### Topo — Resumo do mês
- Total gasto, comparação com mês anterior (percentual)
- Gasto por categoria (barras horizontais)

### Lista de despesas
- Cards em linha: data, categoria (badge), descrição, valor, fornecedor
- Filtros: período, categoria
- Botão "Nova Despesa" → dialog: categoria, descrição, valor (R$), data, fornecedor, upload nota, observações

### Gestão de categorias
- Botão "Gerenciar categorias" → dialog com lista
- Adicionar categoria (nome + ícone)
- Categorias padrão: não podem ser deletadas, só desativadas

---

## 4. Fixes Módulos Existentes

### Planos (`/admin/plans`)
- Verificar e corrigir conexão com router plansManagement (já criado no Sprint 2)
- Testar CRUD completo

### Pacotes (`/admin/packages`)
- Conectar botão "Adicionar créditos" ao `trpc.credits.addToPet`

### Gráficos financeiros
- Substituir dados mock por queries reais em transactions + expenses

---

## 5. Relatório Mensal (`/admin/reports/finance`)

### Seletor de período
Mês/ano

### Seções do relatório
1. Receita: total, por pet, por plano (mensalista/avulso), por método (PIX/cartão/dinheiro)
2. Despesas: total, por categoria, top 5 maiores
3. Lucro líquido: receita - despesas, margem %
4. Inadimplência: pets inadimplentes, valor pendente, média de atraso
5. Projeção: média últimos 3 meses

### Exportação
- PDF (jsPDF ou similar)
- Excel (xlsx/exceljs)

---

## 6. Cobrança via WhatsApp

### Locais de integração
- Dashboard financeiro: botão "Cobrar" no semáforo
- Hub do pet: alerta no card créditos quando zerado

### Template de mensagem
"Olá {tutor}! Os créditos do {pet} na TeteCare estão zerados. Para continuar o atendimento, por favor realize o pagamento do plano {plano} (R$ {valor}). Chave PIX: {pix_key}. Obrigado!"

Admin pode editar template nas configurações.

---

## 7. Fora do Escopo

- Emissão de nota fiscal
- Integração com sistemas contábeis
- Pagamento online (Stripe já existe para tutores, manter como está)
- Controle de estoque de insumos (além do registro de custo)

---

## 8. Riscos e Mitigações

| Risco | Mitigação |
|-------|----------|
| Exportação PDF pesada no client | Gerar no servidor se necessário, ou usar jsPDF lightweight |
| Gráficos com muitos dados | Limitar a 12 meses, agregar por mês |
| Template WhatsApp com chave PIX | Campo configurável em daycare_settings |
| Planos page usando router inexistente | Router plansManagement já existe (Sprint 2), verificar registro |
