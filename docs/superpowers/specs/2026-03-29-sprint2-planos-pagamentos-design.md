# Sprint 2 — Planos, Pagamentos e Edição Inline

**Data:** 2026-03-29
**Abordagem:** Planos como entidade + fluxo de pagamento com comprovante + edição inline com toggle

---

## 1. Modelo de Dados

### Nova tabela: `plans` (planos base da creche)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| name | varchar(100) | Ex: "Mensalista 20", "Avulso 5" |
| type | varchar(20) | `mensalista` / `avulso` / `diaria` |
| includedDays | integer | Diárias incluídas (ex: 20) |
| price | integer | Valor em centavos (ex: 80000 = R$800) |
| description | text | Descrição do plano |
| isActive | boolean | Plano disponível para novos pets |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Nova tabela: `pet_plans` (plano atribuído a cada pet)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| petId | integer FK → pets | |
| planId | integer FK → plans | Plano base |
| customName | varchar(100) | Nome customizado (null = usa o do plano) |
| customDays | integer | Diárias ajustadas (null = usa o do plano) |
| customPrice | integer | Valor ajustado em centavos (null = usa o do plano) |
| status | varchar(20) | `active` / `paused` / `cancelled` |
| startDate | date | Início do plano |
| renewalDay | integer | Dia do mês que renova (mensalistas) |
| notes | text | Observações do admin |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Nova tabela: `payment_requests` (solicitações de pagamento do tutor)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | serial PK | |
| petPlanId | integer FK → pet_plans | |
| tutorId | integer FK → users | Quem enviou |
| amount | integer | Valor em centavos |
| daysRequested | integer | Diárias solicitadas |
| method | varchar(20) | `pix` / `cartao` / `dinheiro` / `transferencia` |
| proofUrl | text | URL do comprovante (Supabase Storage) |
| status | varchar(20) | `pending` / `approved` / `rejected` |
| adminNotes | text | Observação do admin |
| reviewedBy | integer FK → users | Admin que revisou |
| reviewedAt | timestamp | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### Alterações em tabelas existentes

**`daily_logs`**: adicionar campo `absenceType` (varchar: `falta` / `feriado` / `cancelado`) para marcar faltas que consomem diárias.

**`pets`**: campo `credits` continua como saldo direto, atualizado por transações e faltas.

---

## 2. Gestão de Planos

### Planos base (`/admin/plans`)

- CRUD de planos: nome, tipo (mensalista/avulso/diária), diárias incluídas, valor, descrição
- Ativar/desativar planos
- Reutiliza a página existente se houver, senão cria nova

### Atribuição de plano ao pet

- No hub do pet, card "Plano e Créditos" → botão "Alterar plano"
- Dialog com:
  - Select do plano base (planos ativos)
  - Campos de customização (diárias, valor) pré-preenchidos
  - Data de início, dia de renovação (para mensalistas)
  - Notas
- Ao salvar: cria/atualiza `pet_plans` para o pet

### Seleção de plano no cadastro de pet

- Na página de cadastro de pet (`/admin/pets/new`), adicionar select de plano
- Ao criar pet com plano, cria `pet_plans` automaticamente

---

## 3. Fluxo de Pagamento

### Tutor → Admin (com comprovante)

1. Tutor no hub do pet → card "Plano e Créditos" → botão "Adicionar créditos"
2. Dialog:
   - Diárias desejadas (pré-preenchido com o plano)
   - Valor correspondente (calculado)
   - Método de pagamento (PIX, cartão, dinheiro, transferência)
   - Upload de comprovante (foto/PDF via Supabase Storage)
3. Submete → `payment_requests` com status `pending`
4. Tutor vê histórico com status (pendente/aprovado/rejeitado)

### Admin → Aprovação

1. Página `/admin/payments` — lista solicitações pendentes
2. Badge na sidebar com contagem de pendentes
3. Ao clicar:
   - Vê dados completos: tutor, pet, plano, valor, comprovante (visualizável)
   - Botões: Aprovar / Rejeitar
4. Aprovar:
   - `payment_requests.status` → `approved`
   - Cria `transaction`
   - Incrementa `pets.credits`
   - Notificação ao tutor
5. Rejeitar:
   - `payment_requests.status` → `rejected`
   - Admin preenche motivo (`adminNotes`)
   - Notificação ao tutor

### Registro manual (admin)

- Hub do pet → card "Plano e Créditos" → botão "Registrar pagamento"
- Dialog: diárias, valor, método, observação
- Credita imediatamente (sem fluxo de aprovação)
- Cria `transaction` + incrementa `pets.credits`

---

## 4. Edição Inline

### Toggle "Modo edição"

- Botão no header do hub: "Editar" (ícone lápis) → ativa modo edição
- Quando ativo: botão muda para "Concluir" (ícone check)
- Só visível para admin
- Estado gerenciado via React state no PetHubPage, passado como prop para os componentes

### Campos editáveis

Quando modo edição ativo:
- Campos ganham `border-dashed border-primary/30 cursor-pointer` como indicador visual
- Ao clicar: valor vira `<Input>` inline
- Enter ou blur = salva via `trpc.pets.update` mutation
- Esc = cancela
- Toast de confirmação ao salvar

Campos editáveis no header:
- Nome do pet, peso

Campos editáveis na tab Geral:
- Qualquer campo do perfil (raça, sexo, porte, pelagem, castrado, notas, etc.)

Card Plano e Créditos:
- Créditos (ajuste manual direto)

### Componente InlineEdit

Componente reutilizável:
```
<InlineEdit
  value={pet.weight}
  field="weight"
  petId={pet.id}
  editable={isEditMode}
  type="number"
  format={(v) => `${v}kg`}
/>
```

---

## 5. Controle de Faltas

### Marcação de falta

- No hub do pet, tab Calendário ou via daily log
- Admin marca um dia como "Falta" → cria daily_log com `absenceType = 'falta'`
- Falta consome 1 diária do saldo (`pets.credits -= 1`)

### Visualização

- Card "Plano e Créditos" mostra: "15/20 diárias usadas (3 faltas)"
- Faltas destacadas no calendário com cor diferente (vermelho/laranja)

---

## 6. Visão do Tutor

### Hub do pet (tutor)

- Card "Plano e Créditos": saldo, nome do plano, diárias usadas/total
- Botão "Adicionar créditos" → dialog com upload de comprovante
- Histórico de pagamentos (aprovados/pendentes/rejeitados)
- Tudo read-only (sem edição inline, sem toggle)

### Página `/tutor/payments`

- Lista de solicitações enviadas com status
- Botão para nova solicitação
- Visualização do comprovante enviado
- Filtro por pet (se tutor tem múltiplos pets)

---

## 7. Fora do Escopo (Sprints 3-4)

- Pagamento online (Stripe)
- Notificações automáticas de vencimento de plano
- Renovação automática de mensalistas
- Calendário redesenhado com check-in/out visual
- Mapa de ocupação

---

## 8. Riscos e Mitigações

| Risco | Mitigação |
|-------|----------|
| Upload de comprovante (Supabase Storage) | Projeto já tem integração com Supabase Storage para documentos |
| Edição inline complexa | Componente InlineEdit reutilizável, testado com campos simples primeiro |
| Concorrência de créditos (admin e tutor alterando ao mesmo tempo) | Operações atômicas no banco (UPDATE credits = credits + N) |
| Planos existentes na tabela credit_packages | Migrar dados ou manter ambas tabelas com bridge |
