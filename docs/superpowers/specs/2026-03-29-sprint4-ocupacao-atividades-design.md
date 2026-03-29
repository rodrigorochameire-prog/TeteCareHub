# Sprint 4 — Mapa de Ocupação + Atividades

**Data:** 2026-03-29

---

## 1. Modelo de Dados

### Nova tabela: `activities`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| name | varchar(100) | Ex: "Passeio", "Brincadeira" |
| icon | varchar(50) | Nome do ícone lucide (opcional) |
| isActive | boolean | Disponível para seleção (default true) |
| displayOrder | integer | Ordem de exibição (default 0) |
| createdAt | timestamp | |

### Nova tabela: `pet_activity_logs`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| petId | integer FK → pets | |
| activityId | integer FK → activities | null se customizada |
| customName | varchar(100) | Nome se atividade customizada |
| logDate | date | Dia da atividade |
| notes | text | Observações |
| createdById | integer FK → users | |
| createdAt | timestamp | |

### Nova tabela: `daycare_settings`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| key | varchar(50) unique | Ex: "max_capacity" |
| value | varchar(200) | Ex: "15" |
| updatedAt | timestamp | |

Seed: `{ key: "max_capacity", value: "15" }`

---

## 2. Mapa de Ocupação

### Dashboard card (`/admin`)

- Card "Ocupação" no dashboard existente
- Barra visual: "12/15" com porcentagem
- Cores: verde (<70%), amarelo (70-90%), vermelho (>90%)
- Lista compacta dos pets presentes (avatar + nome)
- Link "Ver mapa" → `/admin/occupancy`

### Página dedicada (`/admin/occupancy`)

- Grid visual: slots de capacidade (configurável), cada slot mostra avatar+nome ou "Livre"
- Slot vazio clicável → abre check-in dialog
- Slot ocupado clicável → abre check-out dialog
- Resumo no topo: capacidade total, ocupados, livres, hospedados
- Seção abaixo: hospedados separados (com período)
- Dados: usa `trpc.checkin.list` para pets checked-in + `trpc.unifiedCalendar.getDaySummary`

---

## 3. Atividades

### Configuração de atividades (`/admin/settings`)

- CRUD de atividades pré-definidas: nome, ícone, ordem, ativo/inativo
- Seed inicial: Passeio, Brincadeira, Banho, Soneca, Socialização, Alimentação, Treinamento

### Registro no check-out

- Dialog de check-out existente (`calendar-checkout-dialog.tsx`) ganha seção "Atividades do dia"
- Multi-select de atividades pré-definidas (checkboxes)
- Campo texto para atividade customizada
- Ao salvar check-out: cria `pet_activity_logs` para cada atividade selecionada

### Tab Comportamento do hub

- Nova seção "Atividades Recentes" no topo da tab
- Lista de atividades por dia, agrupadas por data
- Cada item: ícone + nome + notas + data
- Botão "Adicionar atividade" → dialog inline (select atividade + data + notas)

---

## 4. Fora do Escopo

- Relatórios de ocupação mensal
- Mapa de salas/espaços (subdivisão da capacidade)
- Gamificação de atividades

---

## 5. Riscos e Mitigações

| Risco | Mitigação |
|-------|----------|
| Grid de ocupação com capacidade variável | CSS grid com `grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))` |
| Check-out com atividades pode ser lento | Inserção batch de pet_activity_logs |
| Capacidade pode mudar durante o dia | Buscar daycare_settings a cada render, cache com staleTime curto |
