# Sprint 5 — Financeiro Completo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema financeiro completo — despesas com categorias, dashboard com dados reais, semáforo de inadimplência com cobrança WhatsApp, relatório mensal exportável PDF/Excel, e fixes nos módulos existentes.

**Architecture:** Novas tabelas expenses + expense_categories. Router de despesas. Dashboard de finanças reescrito com dados reais. Relatório financeiro com exportação. Cobrança WhatsApp integrada. Fixes no planos page e packages add credits.

**Tech Stack:** Next.js 14, tRPC, Drizzle ORM, shadcn/ui, Recharts (gráficos), jsPDF (PDF), xlsx (Excel), WhatsAppService, Supabase Storage

---

## File Structure

### New Files

```
src/lib/db/
  schema-expenses.ts                  — Tabelas expense_categories, expenses

src/lib/validations/
  expenses.ts                         — Zod schemas

src/lib/trpc/routers/
  expenses.ts                         — CRUD despesas + categorias + relatórios

src/app/(dashboard)/admin/
  expenses/page.tsx                   — Página de despesas
  reports/finance/page.tsx            — Relatório financeiro mensal

src/components/finance/
  finance-summary-cards.tsx           — 4 cards resumo (receita, despesas, lucro, inadimplência)
  finance-chart.tsx                   — Gráfico receita vs despesas
  delinquency-panel.tsx               — Semáforo de inadimplência com WhatsApp
  expense-dialog.tsx                  — Dialog criar/editar despesa
  category-manager-dialog.tsx         — Dialog gerenciar categorias
  finance-report.tsx                  — Componente do relatório
  export-utils.ts                     — Funções de exportação PDF/Excel
```

### Modified Files

```
src/lib/db/index.ts                   — Exportar novas tabelas
src/lib/trpc/routers/index.ts         — Registrar novo router
src/lib/validations.ts                — Exportar novas validations
src/app/(dashboard)/admin/finances/page.tsx — Reescrever com dados reais
src/app/(dashboard)/admin/packages/page.tsx — Fix: conectar add credits
src/components/layouts/admin-sidebar.tsx — Links despesas + relatório
src/components/pet-hub/pet-general-tab.tsx — Alerta cobrança WhatsApp no card créditos
```

---

## Task 1: Schema + Validations + Router de Despesas

**Files:**
- Create: `src/lib/db/schema-expenses.ts`
- Create: `src/lib/validations/expenses.ts`
- Create: `src/lib/trpc/routers/expenses.ts`
- Modify: `src/lib/db/index.ts`, `src/lib/validations.ts`, `src/lib/trpc/routers/index.ts`

### Schema

`schema-expenses.ts` com 2 tabelas: `expenseCategories` e `expenses`. Seguir padrão de schema-activities.ts.

### Validations

`expenses.ts`:
- createExpenseSchema: categoryId, description, amount (centavos), date, supplier?, receiptUrl?, notes?
- updateExpenseSchema: id + partial
- createCategorySchema: name, icon?
- updateCategorySchema: id, name?, icon?, isActive?

### Router

`expenses.ts` com procedures:
- `listCategories` (admin) — todas categorias ativas
- `listAllCategories` (admin) — incluindo inativas
- `createCategory` (admin)
- `updateCategory` (admin)
- `toggleCategory` (admin) — ativar/desativar (não deletar se isDefault)
- `list` (admin) — listar despesas com filtro por período e categoria, join com categoria
- `create` (admin) — criar despesa
- `update` (admin) — atualizar
- `delete` (admin) — deletar
- `monthlySummary` (admin) — input: { month, year }. Retorna: total, por categoria, comparação mês anterior
- `monthlyChart` (admin) — últimos 6 meses: receita (de transactions) + despesas + lucro por mês

Para `monthlyChart`: agregar `transactions` (type='credit_purchase') para receita e `expenses` para despesas, agrupar por mês.

### Migração via MCP + seed categorias padrão

### Commit
```bash
git commit -am "feat: add expenses schema, validations, router with categories"
```

---

## Task 2: Página de Despesas (`/admin/expenses`)

**Files:**
- Create: `src/app/(dashboard)/admin/expenses/page.tsx`
- Create: `src/components/finance/expense-dialog.tsx`
- Create: `src/components/finance/category-manager-dialog.tsx`
- Modify: `src/components/layouts/admin-sidebar.tsx`

### Página

"use client" page com:
- Resumo do mês no topo: total gasto, comparação %, gasto por categoria (barras)
- Filtros: período (mês/ano), categoria (select)
- Lista de despesas como cards em linha: data, categoria badge, descrição, valor R$, fornecedor
- Editar/deletar por despesa
- Botão "Nova Despesa" → ExpenseDialog
- Botão "Categorias" → CategoryManagerDialog

### ExpenseDialog

Dialog com: categoria select, descrição, valor (R$ input → centavos), data, fornecedor, upload recibo (Supabase Storage), observações.
Submit: `trpc.expenses.create` ou `trpc.expenses.update`.

### CategoryManagerDialog

Dialog com lista de categorias. Cada uma: nome, ícone, toggle ativo. Botão adicionar nova. Categorias default não deletáveis.

### Sidebar

Adicionar "Despesas" no grupo "Financeiro" com ícone Receipt.

### Commit
```bash
git commit -am "feat: add expenses page with dialog, categories, sidebar link"
```

---

## Task 3: Dashboard Financeiro — Dados Reais

**Files:**
- Create: `src/components/finance/finance-summary-cards.tsx`
- Create: `src/components/finance/finance-chart.tsx`
- Create: `src/components/finance/delinquency-panel.tsx`
- Rewrite: `src/app/(dashboard)/admin/finances/page.tsx`

### finance-summary-cards.tsx

4 cards compactos:
- Receita (verde): soma de transactions type='credit_purchase' no mês
- Despesas (vermelho): soma de expenses no mês
- Lucro (verde/vermelho): receita - despesas
- Inadimplência (amarelo): contagem de pets com credits=0 + pet_plan ativo

Query: usar `trpc.expenses.monthlySummary` + dados de finanças existentes

### finance-chart.tsx

Gráfico de barras (Recharts BarChart) com 3 séries: Receita, Despesas, Lucro — últimos 6 meses.
Query: `trpc.expenses.monthlyChart`
O projeto já usa Recharts — seguir padrão existente.

### delinquency-panel.tsx

Lista de pets com semáforo:
- Query pets com seus créditos e pet_plans
- Verde (>3 créditos), Amarelo (1-3), Vermelho (0 com plano ativo)
- Cada pet: avatar, nome, tutor, créditos, último pagamento
- Botão "Cobrar" → envia WhatsApp com template de cobrança
- Usa WhatsAppService ou Inngest event

Para buscar dados: criar procedure `getDelinquencyReport` no expenses router que junta pets + credits + pet_plans + último pagamento de payment_requests.

### Reescrever finances page

Substituir os gráficos mock por componentes reais:
- FinanceSummaryCards no topo
- FinanceChart abaixo
- DelinquencyPanel
- Últimas transações (lista mista despesas + pagamentos)

Read a página atual para manter tabs úteis e remover mock data.

### Commit
```bash
git commit -am "feat: rewrite finances dashboard with real data, charts, delinquency"
```

---

## Task 4: Fixes — Planos page + Packages add credits

**Files:**
- Modify: `src/app/(dashboard)/admin/plans/page.tsx`
- Modify: `src/app/(dashboard)/admin/packages/page.tsx`

### Fix Plans page

Read `src/app/(dashboard)/admin/plans/page.tsx` e `src/lib/trpc/routers/index.ts`.
Verificar se `plansManagement` está registrado. Se sim, testar que a página funciona.
Se o router está registrado mas a página tem erros, corrigir os nomes das procedures.

### Fix Packages add credits

Read `src/app/(dashboard)/admin/packages/page.tsx`. Encontrar o handler vazio do botão "Adicionar créditos" (~line 389). Conectar ao `trpc.credits.addToPet.useMutation()`.

Input: `{ petId: number, credits: number, reason?: string }`

Read `src/lib/trpc/routers/credits.ts` para confirmar o input exato de `addToPet`.

### Commit
```bash
git commit -am "fix: plans page router connection + packages add credits handler"
```

---

## Task 5: Relatório Financeiro + Exportação

**Files:**
- Create: `src/app/(dashboard)/admin/reports/finance/page.tsx`
- Create: `src/components/finance/finance-report.tsx`
- Create: `src/components/finance/export-utils.ts`

### Página de relatório

Seletor mês/ano no topo. Renderiza FinanceReport component.

### FinanceReport component

Seções:
1. Receita: total, tabela por pet (nome, plano, valor pago), por método de pagamento
2. Despesas: total, tabela por categoria, top 5 maiores
3. Lucro: receita - despesas, margem %
4. Inadimplência: lista de inadimplentes com valor pendente
5. Projeção: média receita/despesa dos últimos 3 meses

Dados: combinar queries de expenses.monthlySummary + finances.monthlyReport + getDelinquencyReport

### export-utils.ts

Duas funções:

`exportToPDF(reportData)`:
- Usar jsPDF (instalar: `npm install jspdf`)
- Gerar documento com título, tabelas formatadas, totais
- Download automático

`exportToExcel(reportData)`:
- Usar xlsx (instalar: `npm install xlsx`)
- 3 abas: Receita, Despesas, Resumo
- Download automático

Verificar se essas libs já estão no package.json antes de instalar.

### Botões na página

"Exportar PDF" e "Exportar Excel" no topo, ao lado do seletor de período.

### Sidebar

Adicionar "Relatório Financeiro" no grupo "Financeiro" com ícone FileBarChart.

### Commit
```bash
git commit -am "feat: add financial report page with PDF/Excel export"
```

---

## Task 6: Cobrança WhatsApp + Template configurável

**Files:**
- Modify: `src/components/finance/delinquency-panel.tsx` (já criado na Task 3)
- Modify: `src/components/pet-hub/pet-general-tab.tsx`

### Cobrança no delinquency panel

O botão "Cobrar" no semáforo já foi criado na Task 3. Implementar a lógica:
- Buscar telefone do tutor do pet
- Usar `WhatsAppService.fromEnv()` ou Inngest event `whatsapp/send.message`
- Template: "Olá {tutor}! Os créditos do {pet} na TeteCare estão zerados..."
- Toast de confirmação
- Registrar em whatsapp_messages

Read `src/lib/services/whatsapp.ts` e `src/lib/inngest/client.ts` para implementar.

### Alerta no hub do pet

No card "Plano e Créditos" em `pet-general-tab.tsx`:
- Se créditos = 0 e pet tem plano ativo: mostrar alerta vermelho com botão "Cobrar tutor"
- Botão abre wa.me link (simples, como já feito no header antigo)

### Template configurável

Adicionar em `daycare_settings` uma key `whatsapp_collection_template` com o template padrão.
No delinquency panel, buscar o template de settings antes de enviar.

### Commit
```bash
git commit -am "feat: add WhatsApp collection with configurable template"
```

---

## Task 7: Migração DB + TypeScript check + Deploy

- [ ] Migração via MCP (expense_categories + expenses + seed)
- [ ] Instalar jsPDF e xlsx se necessário
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — sem erros
- [ ] Commit final
- [ ] Merge para main + push + deploy Vercel
