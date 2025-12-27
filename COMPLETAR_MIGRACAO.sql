<<<<<<< Current (Your changes)
-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================


-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================



-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================


-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================



-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================


-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================



-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================


-- ============================================================
-- ✅ COMPLETAR MIGRAÇÃO - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- As colunas já existem! Agora só precisamos:
-- 1. Criar os índices (se não existirem)
-- 2. Registrar a migração (se não estiver registrada)
-- ============================================================

-- 1️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ REGISTRAR MIGRAÇÃO 0050
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ VERIFICAR RESULTADO FINAL
SELECT 
    '✅ Colunas' AS item,
    COUNT(*)::text AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    '✅ Índices' AS item,
    COUNT(*)::text AS status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    '✅ Migração Registrada' AS item,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SIM'
        ELSE 'NÃO'
    END AS status
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 📝 NOTA SOBRE O TIPO linked_resource_id
-- ============================================================
-- 
-- Você tem linked_resource_id como BIGINT no banco,
-- mas o schema Drizzle usa INTEGER.
-- 
-- Isso NÃO é um problema! BIGINT é compatível com INTEGER.
-- O PostgreSQL faz a conversão automaticamente.
-- 
-- Se quiser manter consistência, pode alterar para INTEGER:
-- (mas não é necessário)
--
-- ALTER TABLE calendar_events 
-- ALTER COLUMN linked_resource_id TYPE INTEGER 
-- USING linked_resource_id::INTEGER;
--
-- ============================================================





=======
>>>>>>> Incoming (Background Agent changes)
