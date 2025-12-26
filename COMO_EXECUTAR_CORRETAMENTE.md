# ⚠️ ERRO DE SINTAXE - SOLUÇÃO

## 🔴 PROBLEMA

O erro `syntax error at or near "POLICY"` ocorre quando você tenta executar o SQL na interface errada.

---

## ✅ SOLUÇÃO CORRETA

### **NÃO use**: Storage → Policies → New Policy

### **USE**: SQL Editor

---

## 📋 PASSO A PASSO CORRETO

### 1. Acessar SQL Editor

1. No Supabase Dashboard, no menu lateral
2. Clique em **"SQL Editor"** (NÃO em "Storage")
3. Clique em **"New Query"**

### 2. Copiar e Colar SQL

1. Abra o arquivo **`POLITICAS_SQL_VALIDADO.sql`**
2. **Selecione TODO o conteúdo** (Cmd+A)
3. **Copie** (Cmd+C)
4. **Cole no SQL Editor** (Cmd+V)

### 3. Executar

1. Clique no botão **"RUN"** (⚡) no canto superior direito
2. OU pressione `Cmd+Enter` (Mac) ou `Ctrl+Enter` (Windows/Linux)
3. Aguarde a execução (1-2 minutos)

---

## 🎯 DIFERENÇA IMPORTANTE

### ❌ ERRADO (causa o erro):
```
Dashboard → Storage → [Bucket] → Policies → New Policy
→ Colar SQL aqui
```

### ✅ CORRETO:
```
Dashboard → SQL Editor → New Query
→ Colar SQL aqui
```

---

## 📝 ARQUIVO PARA USAR

Use o arquivo **`POLITICAS_SQL_VALIDADO.sql`** que foi criado com sintaxe validada.

---

## 🆘 SE AINDA DER ERRO

Execute apenas um bucket por vez para testar:

1. Copie apenas a seção do bucket "pets" (linhas 7-54)
2. Cole no SQL Editor
3. Execute
4. Se funcionar, continue com os outros buckets

---

## ✅ VALIDAÇÃO

Após executar, valide:

```sql
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```

**Resultado esperado**: `total_policies = 48`

---

**Lembre-se**: Use o **SQL Editor**, não a interface de Policies! 🚀






## 🔴 PROBLEMA

O erro `syntax error at or near "POLICY"` ocorre quando você tenta executar o SQL na interface errada.

---

## ✅ SOLUÇÃO CORRETA

### **NÃO use**: Storage → Policies → New Policy

### **USE**: SQL Editor

---

## 📋 PASSO A PASSO CORRETO

### 1. Acessar SQL Editor

1. No Supabase Dashboard, no menu lateral
2. Clique em **"SQL Editor"** (NÃO em "Storage")
3. Clique em **"New Query"**

### 2. Copiar e Colar SQL

1. Abra o arquivo **`POLITICAS_SQL_VALIDADO.sql`**
2. **Selecione TODO o conteúdo** (Cmd+A)
3. **Copie** (Cmd+C)
4. **Cole no SQL Editor** (Cmd+V)

### 3. Executar

1. Clique no botão **"RUN"** (⚡) no canto superior direito
2. OU pressione `Cmd+Enter` (Mac) ou `Ctrl+Enter` (Windows/Linux)
3. Aguarde a execução (1-2 minutos)

---

## 🎯 DIFERENÇA IMPORTANTE

### ❌ ERRADO (causa o erro):
```
Dashboard → Storage → [Bucket] → Policies → New Policy
→ Colar SQL aqui
```

### ✅ CORRETO:
```
Dashboard → SQL Editor → New Query
→ Colar SQL aqui
```

---

## 📝 ARQUIVO PARA USAR

Use o arquivo **`POLITICAS_SQL_VALIDADO.sql`** que foi criado com sintaxe validada.

---

## 🆘 SE AINDA DER ERRO

Execute apenas um bucket por vez para testar:

1. Copie apenas a seção do bucket "pets" (linhas 7-54)
2. Cole no SQL Editor
3. Execute
4. Se funcionar, continue com os outros buckets

---

## ✅ VALIDAÇÃO

Após executar, valide:

```sql
SELECT COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```

**Resultado esperado**: `total_policies = 48`

---

**Lembre-se**: Use o **SQL Editor**, não a interface de Policies! 🚀






