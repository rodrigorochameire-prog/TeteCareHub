# Sprint 1 — Cadastro Unificado + Ficha Hub + Permissoes

**Data:** 2026-03-28
**Abordagem:** Camada sobre o existente (sem refactor das paginas atuais)

---

## 1. Modelo de Dados

### Nova tabela: `invitations`

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid PK | |
| token | varchar unique | Token unico para o link |
| tutor_id | uuid FK → users | Tutor pre-cadastrado pelo admin |
| pet_ids | uuid[] | Pets pre-cadastrados vinculados |
| dashboard_access | boolean | Se o tutor tera acesso ao painel |
| status | enum | `pending` / `completed` / `expired` |
| created_by | uuid FK → users | Admin que criou |
| expires_at | timestamp | Validade do link (7 dias) |
| completed_at | timestamp | Quando o tutor completou |

### Alteracoes em tabelas existentes

**`users`:**
- `+onboarding_status`: enum (`not_started` / `in_progress` / `completed`)
- `+invited_by`: uuid FK → users

**Tabelas editaveis pelo tutor** (pet_vaccinations, pet_medications, preventive_treatments, pet_food_plans, pet_weight_history, behavior_logs, training_logs, documents, calendar_events):
- `+created_by`: uuid FK → users
- `+source`: enum (`admin` / `tutor`)

**`pets`:**
- `+admin_locked_fields`: jsonb — lista de campos que o admin preencheu e o tutor nao pode sobrescrever

### Migracao de dados existentes
- Todos os registros existentes recebem `source = 'admin'` e `created_by = null`
- `admin_locked_fields` populado com campos nao-nulos de cada pet

---

## 2. Fluxo de Convite

### Lado do Admin

1. Admin cadastra tutor em `/admin/tutors/new` (nome, telefone, email)
2. Admin cadastra pet(s) em `/admin/pets/new` (dados basicos)
3. Admin vincula pet(s) ao tutor e define `dashboard_access: true/false`
4. Admin clica "Enviar Convite" → sistema gera `invitation` com token unico
5. Link copiado ou enviado via WhatsApp (`wa.me/{phone}?text=...`)

### Lado do Tutor — Pagina publica `/invite/[token]`

Wizard em 4 passos:

**Passo 1 — Seus Dados**
- Dados do admin: read-only (cinza)
- Campos complementares: endereco, contato emergencia, observacoes
- Se `dashboard_access = true`: campo para criar senha (Clerk)
- Se `dashboard_access = false`: sem campo de senha

**Passo 2 — Seu(s) Pet(s)**
- Lista pets pre-cadastrados pelo admin
- Dados do admin: read-only
- Campos complementares: alergias, preferencias alimentares, vet referencia, medos, observacoes
- Tutor nao pode criar novos pets aqui

**Passo 3 — Plano**
- Exibe plano(s) atribuido(s) pelo admin (read-only, informativo)
- Resumo de creditos/diarias

**Passo 4 — Confirmacao**
- Resumo completo
- Checkbox de termos
- Botao "Confirmar Cadastro"

### Pos-confirmacao
- `invitation.status` → `completed`
- `user.onboarding_status` → `completed`
- `dashboard_access = true`: conta Clerk ativada, tutor pode logar em `/tutor`
- `dashboard_access = false`: pagina "Cadastro concluido, obrigado!"
- Admin recebe notificacao

---

## 3. Ficha do Pet como Hub

### Tabs

| Tab | Conteudo | Acoes rapidas |
|-----|----------|---------------|
| Geral | Dados cadastrais, foto, tutor(es), status, plano | Botao WhatsApp |
| Saude | Vacinas, remedios ativos, preventivos, alertas | Adicionar vacina/remedio |
| Alimentacao | Plano alimentar, porcoes, estoque, reacoes, treats | Registrar refeicao |
| Comportamento | Logs, sociabilidade, energia, compatibilidade | Novo log |
| Treinamento | Comandos, sessoes, skills matrix | Nova sessao |
| Calendario | Eventos filtrados por pet | Novo evento |
| Documentos | Carteira vacinacao, exames, receitas, fotos | Upload |

### Estrutura de componentes

```
PetHubPage
├── PetHubHeader (foto, nome, raca, status, botao WhatsApp wa.me)
└── Tabs
    ├── PetGeneralTab
    ├── PetHealthTab
    ├── PetFoodTab
    ├── PetBehaviorTab
    ├── PetTrainingTab
    ├── PetCalendarTab
    └── PetDocumentsTab
```

Cada tab consome os routers tRPC existentes filtrados por `petId`.
Paginas independentes (`/admin/health`, `/admin/food`, etc.) continuam existindo para visao geral de todos os pets.

### Diferencas Admin vs Tutor

- **Admin:** todas as tabs, todos os dados, edita tudo
- **Tutor:** so seus pets, dados `source=admin` com badge "Creche" (read-only), dados `source=tutor` editaveis

---

## 4. WhatsApp na Ficha

Botao no header da ficha do pet: `wa.me/{tutor_phone}?text=Ola {tutor_nome}, sobre o {pet_nome}...`
Abre WhatsApp Web/app direto. Sem API, sem template, sem tracking.

---

## 5. Permissoes

### Regra central
> O tutor acrescenta, nunca substitui.

### Backend — Middleware tRPC `enforceOwnership`

- **Create**: tutor pode → `source = 'tutor'`, `created_by = userId`
- **Update**: tutor so atualiza `source = 'tutor' AND created_by = userId`
- **Delete**: tutor so deleta `source = 'tutor' AND created_by = userId`
- **Admin**: sem restricao

### Frontend

- `source = 'admin'`: badge cinza "Creche", sem editar/deletar
- `source = 'tutor'`: badge azul "Tutor", botoes normais
- Listagem mista ordenada por data

### Campos do pet (caso especial)

- Campo `null` (admin nao preencheu) → tutor pode preencher
- Campo com valor (admin preencheu) → read-only para tutor (em `admin_locked_fields`)
- Campo que tutor preencheu → tutor pode editar

### Isolamento

Todas as queries do tutor filtradas por `pet_tutors.tutor_id = currentUserId`. Tutor nunca ve pets de outros.

---

## 6. Fora do Escopo (Sprints 2-4)

- Planos & pagamentos editaveis
- Notificacoes automaticas com antecedencia (vacinas, remedios)
- Calendario redesenhado com check-in/out visual, hospedagem, filtros
- Mapa de ocupacao (15 pets)
- Comportamento: adicao de atividades customizadas
- Variaveis editaveis globais

---

## 7. Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|----------|
| Migracao de dados (adicionar source/created_by) | Script de migracao: tudo existente = `source: admin` |
| Criacao de conta Clerk via API | Clerk Backend SDK suporta `clerkClient.users.createUser()` |
| Seguranca do token de convite | Expiracao 7 dias, invalidacao apos uso, UUID v4 |
| Complexidade das tabs | Componentes independentes, reutilizam routers existentes |
