# Sprint 3 — Calendário Redesenhado + Notificações Automáticas

**Data:** 2026-03-29
**Abordagem:** Calendário unificado com 3 visões + engine de notificações via cron

---

## 1. Modelo de Dados

### Nova tabela: `notification_rules`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| eventType | varchar(30) | `vaccine` / `preventive` / `medication` / `booking` / `plan_renewal` |
| daysBeforeDefault | integer | Padrão de antecedência |
| daysBeforeCustom | integer | Override do admin (null = usa padrão) |
| notifyApp | boolean | Alertar no app (default true) |
| notifyWhatsapp | boolean | Alertar via WhatsApp (default false) |
| isActive | boolean | Regra ativa |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Nova tabela: `notification_log`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| ruleId | integer FK → notification_rules | Regra que disparou |
| petId | integer FK → pets | |
| userId | integer FK → users | Destinatário |
| channel | varchar(20) | `app` / `whatsapp` |
| referenceType | varchar(30) | `vaccine` / `preventive` / etc. |
| referenceId | integer | ID do registro |
| sentAt | timestamp | |
| status | varchar(20) | `sent` / `failed` / `pending` |

Dedup: antes de disparar, verifica se já existe log para referenceType+referenceId+userId.

### Sem alterações em tabelas existentes

Calendário agrega dados de daily_logs, calendar_events, pet_vaccinations, preventive_treatments, booking_requests.

---

## 2. Calendário Geral (`/admin/calendar`)

### Layout

**Topo:** Barra de controles
- Toggle de visão: Dia | Semana | Mês (default: Dia)
- Navegação: ← Anterior | Hoje | Próximo →
- Filtros: Tipo (multi-select: check-in, checkout, vacina, remédio, preventivo, hospedagem) + Pet (select) + Tutor (select)
- Painel de alertas: próximos vencimentos com cores (verde >7d, amarelo 3-7d, vermelho <3d)

### Visão Diária (principal)

- Timeline vertical com horários (6h-20h)
- Cada pet com check-in: barra horizontal entrada → saída
- **Creche:** mostra horário entrada e horário saída no mesmo dia
- **Hospedagem:** barra contínua mostrando intervalo completo (data+hora entrada → data+hora saída)
- Vacinas/remédios vencendo: cards de alerta no topo
- Resumo: "12 pets na creche · 2 hospedados · 3 vacinas vencendo"

### Visão Semanal

- Grid 7 colunas (Seg-Dom)
- Cards compactos por dia com hora e tipo
- Hospedagem: barra que cruza múltiplos dias

### Visão Mensal

- Grid de dias com dots coloridos por tipo
- Clicar num dia: expande lista de eventos
- Contagem de pets por dia

### Fontes de dados unificadas

Query backend que retorna formato padronizado:
```typescript
{
  id: string;           // "vaccine-15" ou "checkin-234"
  type: string;         // checkin, checkout, vaccine, preventive, medication, booking, event
  title: string;
  petId: number;
  petName: string;
  tutorName: string;
  startDate: Date;
  endDate?: Date;       // para hospedagem e períodos
  startTime?: string;   // "08:30" para creche
  endTime?: string;     // "17:00" para creche
  color: string;        // cor por tipo
  metadata?: Record<string, unknown>;
}
```

### Check-in/out pelo calendário

- Clicar slot vazio na visão diária → dialog "Check-in" (selecionar pet, hora, observações)
- Clicar pet na creche → dialog "Check-out" (hora saída, observações)
- Reutiliza mutations existentes do checkin router

---

## 3. Tab Calendário do Pet (Hub)

Mesma engine do calendário geral mas filtrada por petId:
- Visão mensal com dots (já existe do Sprint 1, melhorar)
- Lista de próximos eventos abaixo
- Incluir alertas de vencimento do pet específico

---

## 4. Notificações Automáticas

### Engine (cron job)

Execução: 1x por dia via Vercel Cron (ou Inngest se já configurado)

Lógica:
1. Buscar `notification_rules` ativas
2. Para cada regra, calcular data alvo: hoje + diasAntecedência (custom ou default)
3. Buscar registros que vencem nessa data:
   - `pet_vaccinations.nextDueDate`
   - `preventive_treatments.nextDueDate`
   - `pet_plans.renewalDay` do mês atual
4. Para cada match, verificar `notification_log` (dedup)
5. Se não enviado:
   - notifyApp → criar `notifications` para admin e tutor
   - notifyWhatsapp → enviar via WhatsAppService para tutor

### Mensagens WhatsApp

- **Vacina:** "Olá {tutor}! A vacina {nome} do {pet} vence em {dias} dias ({data}). Agende com seu veterinário."
- **Preventivo:** "Olá {tutor}! O {tipo} ({produto}) do {pet} vence em {dias} dias ({data}). Não esqueça de reaplicar!"
- **Renovação plano:** "Olá {tutor}! O plano {nome} do {pet} renova dia {dia}."

### Padrões iniciais (seed)

| Tipo | Dias antes | App | WhatsApp |
|------|-----------|-----|----------|
| vaccine | 30 | sim | sim |
| preventive | 7 | sim | sim |
| medication | 3 | sim | não |
| plan_renewal | 5 | sim | sim |

### Painel de alertas no calendário

No topo do calendário geral:
- Cards compactos: pet, tipo, data, dias restantes
- Cores: verde (>7d), amarelo (3-7d), vermelho (<3d ou vencido)
- Botão "Notificar agora" (envio manual imediato)

---

## 5. Configuração de Notificações

Página simples em `/admin/settings` ou seção em `/admin/notifications`:
- Lista de regras com toggles (app/whatsapp/ativo)
- Campo editável para dias de antecedência
- Admin pode ajustar por tipo de evento

---

## 6. Fora do Escopo (Sprint 4)

- Mapa de ocupação (15 pets)
- Comportamento: atividades customizadas
- Notificações por email
- Recorrência automática de eventos

---

## 7. Riscos e Mitigações

| Risco | Mitigação |
|-------|----------|
| Cron job não executar | Usar Vercel Cron com endpoint em /api/cron/notifications, verificar com CRON_SECRET |
| WhatsApp falhar | Registrar em notification_log com status=failed, retry na próxima execução |
| Query unificada lenta (muitas fontes) | Limitar range de datas na query, cache com staleTime |
| Hospedagem cruzando múltiplos dias | Renderizar barra que cruza dias na visão semanal/mensal |
