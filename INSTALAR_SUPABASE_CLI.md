# 🚀 INSTALAÇÃO DO SUPABASE CLI

## 📋 PRÉ-REQUISITOS

- macOS (já confirmado)
- Homebrew (gerenciador de pacotes)

---

## 🔧 INSTALAÇÃO

### Opção 1: Via Homebrew (Recomendado)

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase
```

### Opção 2: Via npm (se preferir)

```bash
npm install -g supabase
```

### Opção 3: Download Manual

1. Acesse: https://github.com/supabase/cli/releases
2. Baixe o binário para macOS
3. Adicione ao PATH

---

## ✅ VERIFICAR INSTALAÇÃO

Após instalar, verifique:

```bash
supabase --version
```

Deve retornar algo como: `supabase version 1.x.x`

---

## 🔐 CONFIGURAÇÃO

### 1. Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### 2. Linkar Projeto

```bash
supabase link --project-ref siwapjqndevuwsluncnr
```

**Nota**: O `project-ref` é a parte do URL do seu projeto Supabase:
- URL: `https://siwapjqndevuwsluncnr.supabase.co`
- Project Ref: `siwapjqndevuwsluncnr`

### 3. Executar Script RLS

```bash
supabase db execute -f SQL_RLS_FINAL_COMPLETO.sql
```

---

## 🆘 TROUBLESHOOTING

### Erro: "command not found"
- Verifique se o PATH está configurado corretamente
- Reinicie o terminal após instalar

### Erro: "Homebrew not found"
- Instale o Homebrew primeiro: https://brew.sh

### Erro: "Permission denied"
- Use `sudo` se necessário (não recomendado)
- Ou instale via npm sem sudo

---

## 📝 PRÓXIMOS PASSOS

Após instalar e configurar:

1. ✅ Login: `supabase login`
2. ✅ Linkar: `supabase link --project-ref siwapjqndevuwsluncnr`
3. ✅ Executar: `supabase db execute -f SQL_RLS_FINAL_COMPLETO.sql`






## 📋 PRÉ-REQUISITOS

- macOS (já confirmado)
- Homebrew (gerenciador de pacotes)

---

## 🔧 INSTALAÇÃO

### Opção 1: Via Homebrew (Recomendado)

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase
```

### Opção 2: Via npm (se preferir)

```bash
npm install -g supabase
```

### Opção 3: Download Manual

1. Acesse: https://github.com/supabase/cli/releases
2. Baixe o binário para macOS
3. Adicione ao PATH

---

## ✅ VERIFICAR INSTALAÇÃO

Após instalar, verifique:

```bash
supabase --version
```

Deve retornar algo como: `supabase version 1.x.x`

---

## 🔐 CONFIGURAÇÃO

### 1. Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para autenticação.

### 2. Linkar Projeto

```bash
supabase link --project-ref siwapjqndevuwsluncnr
```

**Nota**: O `project-ref` é a parte do URL do seu projeto Supabase:
- URL: `https://siwapjqndevuwsluncnr.supabase.co`
- Project Ref: `siwapjqndevuwsluncnr`

### 3. Executar Script RLS

```bash
supabase db execute -f SQL_RLS_FINAL_COMPLETO.sql
```

---

## 🆘 TROUBLESHOOTING

### Erro: "command not found"
- Verifique se o PATH está configurado corretamente
- Reinicie o terminal após instalar

### Erro: "Homebrew not found"
- Instale o Homebrew primeiro: https://brew.sh

### Erro: "Permission denied"
- Use `sudo` se necessário (não recomendado)
- Ou instale via npm sem sudo

---

## 📝 PRÓXIMOS PASSOS

Após instalar e configurar:

1. ✅ Login: `supabase login`
2. ✅ Linkar: `supabase link --project-ref siwapjqndevuwsluncnr`
3. ✅ Executar: `supabase db execute -f SQL_RLS_FINAL_COMPLETO.sql`






