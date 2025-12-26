-- ============================================================
-- 📋 COMANDOS SQL PARA EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard → SQL Editor
-- 2. Copie e cole cada seção de comandos
-- 3. Execute uma seção por vez
-- 4. Verifique os resultados antes de continuar
--
-- ============================================================

-- ============================================================
-- 1️⃣ VERIFICAR ESTADO ATUAL DO BANCO
-- ============================================================

-- Verificar se as colunas já existem na tabela calendar_events
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')
ORDER BY column_name;

-- Verificar migrações já aplicadas
SELECT hash, created_at
FROM __drizzle_migrations
WHERE hash LIKE '0050%' OR hash LIKE '%calendar_auto_integration%'
ORDER BY created_at DESC;

-- Verificar estrutura completa da tabela calendar_events
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
ORDER BY ordinal_position;

-- ============================================================
-- 2️⃣ ADICIONAR COLUNAS DE INTEGRAÇÃO (se não existirem)
-- ============================================================

-- Adicionar coluna linked_resource_type (VARCHAR conforme schema)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'calendar_events' 
        AND column_name = 'linked_resource_type'
    ) THEN
        ALTER TABLE calendar_events
        ADD COLUMN linked_resource_type VARCHAR(100);
        
        RAISE NOTICE 'Coluna linked_resource_type criada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna linked_resource_type já existe.';
    END IF;
END $$;

-- Adicionar coluna linked_resource_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'calendar_events' 
        AND column_name = 'linked_resource_id'
    ) THEN
        ALTER TABLE calendar_events
        ADD COLUMN linked_resource_id INTEGER;
        
        RAISE NOTICE 'Coluna linked_resource_id criada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna linked_resource_id já existe.';
    END IF;
END $$;

-- Adicionar coluna auto_created
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'calendar_events' 
        AND column_name = 'auto_created'
    ) THEN
        ALTER TABLE calendar_events
        ADD COLUMN auto_created BOOLEAN NOT NULL DEFAULT FALSE;
        
        RAISE NOTICE 'Coluna auto_created criada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna auto_created já existe.';
    END IF;
END $$;

-- ============================================================
-- 4️⃣ CRIAR ÍNDICES (para melhorar performance)
-- ============================================================

-- Índice composto para linked_resource_type e linked_resource_id
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

-- Índice para auto_created
CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- ============================================================
-- 5️⃣ REGISTRAR MIGRAÇÃO NO DRIZZLE (se não estiver registrada)
-- ============================================================

-- Verificar se a tabela __drizzle_migrations existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
    ) THEN
        CREATE TABLE IF NOT EXISTS __drizzle_migrations (
            id SERIAL PRIMARY KEY,
            hash VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela __drizzle_migrations criada!';
    END IF;
END $$;

-- Registrar migração 0050 (se não estiver registrada)
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- ============================================================
-- 6️⃣ VERIFICAR RESULTADO FINAL
-- ============================================================

-- Verificar todas as colunas criadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')
ORDER BY column_name;

-- Verificar índices criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%';

-- Verificar migração registrada
SELECT hash, created_at
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';

-- ============================================================
-- 7️⃣ COMANDOS ÚTEIS DE DIAGNÓSTICO
-- ============================================================

-- Contar eventos com recursos vinculados
SELECT 
    linked_resource_type,
    COUNT(*) as total_events,
    COUNT(DISTINCT linked_resource_id) as unique_resources
FROM calendar_events
WHERE linked_resource_type IS NOT NULL
GROUP BY linked_resource_type;

-- Ver eventos criados automaticamente
SELECT 
    COUNT(*) as total_auto_created,
    COUNT(*) FILTER (WHERE auto_created = TRUE) as auto_created_count,
    COUNT(*) FILTER (WHERE auto_created = FALSE) as manual_count
FROM calendar_events;

-- Ver estrutura completa da tabela calendar_events
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
ORDER BY ordinal_position;

-- ============================================================
-- 8️⃣ ROLLBACK (caso precise desfazer)
-- ============================================================
-- ⚠️ CUIDADO: Execute apenas se precisar desfazer as alterações!

/*
-- Remover índices
DROP INDEX IF EXISTS idx_calendar_events_linked_resource;
DROP INDEX IF EXISTS idx_calendar_events_auto_created;

-- Remover colunas
ALTER TABLE calendar_events DROP COLUMN IF EXISTS linked_resource_type;
ALTER TABLE calendar_events DROP COLUMN IF EXISTS linked_resource_id;
ALTER TABLE calendar_events DROP COLUMN IF EXISTS auto_created;

-- (Não há tipo ENUM para remover, pois usamos VARCHAR)

-- Remover registro de migração
DELETE FROM __drizzle_migrations WHERE hash = '0050_calendar_auto_integration';
*/

-- ============================================================
-- ✅ FIM DOS COMANDOS
-- ============================================================
-- 
-- Após executar, verifique:
-- 1. Se as 3 colunas foram criadas
-- 2. Se os índices foram criados
-- 3. Se a migração foi registrada
-- 4. Se não há erros nos logs
--
-- ============================================================
