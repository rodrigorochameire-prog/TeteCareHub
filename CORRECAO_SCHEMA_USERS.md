# ✅ Correção: Schema users - Nomes de Colunas

## 🐛 Problema

O erro mostra que o Drizzle está tentando selecionar colunas com nomes em camelCase (`"openId"`, `"passwordHash"`, etc.), mas o banco PostgreSQL provavelmente tem essas colunas em snake_case (`open_id`, `password_hash`, etc.).

## ✅ Correção Aplicada

Atualizei o schema do Drizzle (`drizzle/schema.ts`) para usar os nomes reais das colunas do banco (snake_case):

- `openId` → `open_id`
- `passwordHash` → `password_hash`
- `loginMethod` → `login_method`
- `emailVerified` → `email_verified`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `lastSignedIn` → `last_signed_in`

## ⚠️ IMPORTANTE

Se o banco de dados foi criado com nomes em camelCase (com aspas), você tem duas opções:

### Opção 1: Usar snake_case no banco (Recomendado)
Se o banco já está em snake_case, a correção acima resolve o problema.

### Opção 2: Se o banco está em camelCase
Se o banco foi criado com nomes em camelCase (como no `supabase-initial-schema.sql`), você precisa reverter a mudança e garantir que o banco tenha essas colunas exatamente como estão no schema.

## 🔄 Próximos Passos

1. **Rebuild do projeto**:
   ```bash
   pnpm build
   ```

2. **Reiniciar o servidor**:
   ```bash
   pnpm start
   ```

3. **Testar login novamente**

Se ainda houver erros, pode ser que o banco tenha uma mistura de nomes. Nesse caso, precisamos verificar a estrutura real da tabela no Supabase.






## 🐛 Problema

O erro mostra que o Drizzle está tentando selecionar colunas com nomes em camelCase (`"openId"`, `"passwordHash"`, etc.), mas o banco PostgreSQL provavelmente tem essas colunas em snake_case (`open_id`, `password_hash`, etc.).

## ✅ Correção Aplicada

Atualizei o schema do Drizzle (`drizzle/schema.ts`) para usar os nomes reais das colunas do banco (snake_case):

- `openId` → `open_id`
- `passwordHash` → `password_hash`
- `loginMethod` → `login_method`
- `emailVerified` → `email_verified`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `lastSignedIn` → `last_signed_in`

## ⚠️ IMPORTANTE

Se o banco de dados foi criado com nomes em camelCase (com aspas), você tem duas opções:

### Opção 1: Usar snake_case no banco (Recomendado)
Se o banco já está em snake_case, a correção acima resolve o problema.

### Opção 2: Se o banco está em camelCase
Se o banco foi criado com nomes em camelCase (como no `supabase-initial-schema.sql`), você precisa reverter a mudança e garantir que o banco tenha essas colunas exatamente como estão no schema.

## 🔄 Próximos Passos

1. **Rebuild do projeto**:
   ```bash
   pnpm build
   ```

2. **Reiniciar o servidor**:
   ```bash
   pnpm start
   ```

3. **Testar login novamente**

Se ainda houver erros, pode ser que o banco tenha uma mistura de nomes. Nesse caso, precisamos verificar a estrutura real da tabela no Supabase.






