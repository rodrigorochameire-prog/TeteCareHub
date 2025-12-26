# 📚 O que significa "Migração" no Banco de Dados?

## 🎯 Conceito Básico

**Migração** = Mudanças na estrutura do banco de dados (tabelas, colunas, índices, etc.)

É como uma "versão" do seu banco de dados. Cada migração adiciona, modifica ou remove algo.

---

## 🔍 O que você acabou de fazer?

Você executou a **migração 0050** que adicionou 3 novas colunas na tabela `calendar_events`:

1. **`linked_resource_type`** (VARCHAR)
   - Armazena o tipo de recurso vinculado ao evento
   - Exemplos: `'medication'`, `'vaccine'`, `'preventive_flea'`, etc.

2. **`linked_resource_id`** (BIGINT)
   - Armazena o ID do recurso vinculado
   - Exemplo: Se o evento está vinculado a um medicamento com ID 123, aqui fica `123`

3. **`auto_created`** (BOOLEAN)
   - Indica se o evento foi criado automaticamente pelo sistema
   - `true` = criado automaticamente (ex: quando você agenda um medicamento)
   - `false` = criado manualmente pelo usuário

---

## 🎨 Por que isso é importante?

### Antes da Migração:
```
calendar_events
├── id
├── title
├── description
├── event_date
└── ... (outras colunas)
```

### Depois da Migração:
```
calendar_events
├── id
├── title
├── description
├── event_date
├── linked_resource_type  ← NOVO!
├── linked_resource_id     ← NOVO!
├── auto_created          ← NOVO!
└── ... (outras colunas)
```

---

## 🔗 Como funciona a Integração?

Agora o sistema pode:

1. **Criar eventos automaticamente** quando você:
   - Agenda um medicamento → Cria evento no calendário
   - Agenda uma vacina → Cria evento no calendário
   - Registra um preventivo → Cria evento no calendário

2. **Rastrear a origem** de cada evento:
   - Saber qual medicamento/vacina gerou o evento
   - Poder editar o recurso original a partir do calendário

3. **Distinguir eventos**:
   - Automáticos (criados pelo sistema)
   - Manuais (criados pelo usuário)

---

## 📊 Exemplo Prático

### Cenário: Você agenda um medicamento

**Antes:**
- Medicamento criado ✅
- Evento no calendário criado ✅
- Mas não há ligação entre eles ❌

**Depois (com a migração):**
- Medicamento criado (ID: 123) ✅
- Evento no calendário criado ✅
- **Ligação criada:**
  - `linked_resource_type = 'medication'`
  - `linked_resource_id = 123`
  - `auto_created = true`

Agora, quando você clicar no evento no calendário, o sistema sabe que ele está vinculado ao medicamento #123 e pode abrir os detalhes do medicamento!

---

## ✅ Status da Migração

- ✅ **Colunas criadas** - As 3 colunas estão no banco
- ✅ **Índices criados** - Performance otimizada
- ✅ **Migração registrada** - O Drizzle sabe que foi aplicada

**Resultado:** Seu banco de dados está atualizado e pronto para usar a integração automática com o calendário!

---

## 🚀 Próximos Passos

Agora que a migração está completa, você pode:
1. Usar a aplicação normalmente
2. Os eventos serão criados automaticamente quando necessário
3. O calendário mostrará todos os cuidados do pet de forma integrada
