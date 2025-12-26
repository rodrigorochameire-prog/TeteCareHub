-- ============================================================
-- ✅ VERIFICAR SE MIGRAÇÃO ESTÁ REGISTRADA
-- ============================================================
-- Execute este comando para verificar se a migração 0050 está registrada
-- ============================================================

-- Verificar se a tabela de migrações existe
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = '__drizzle_migrations'
) AS migrations_table_exists;

-- Verificar se a migração 0050 está registrada
SELECT hash, created_at
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration'
   OR hash LIKE '0050%'
ORDER BY created_at DESC;

-- Se a migração NÃO estiver registrada, execute este comando:
-- (Descomente a linha abaixo se necessário)

-- INSERT INTO __drizzle_migrations (hash, created_at)
-- VALUES ('0050_calendar_auto_integration', NOW())
-- ON CONFLICT (hash) DO NOTHING;

-- ============================================================
-- 📊 VERIFICAR ÍNDICES
-- ============================================================

-- Verificar se os índices foram criados
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%');

-- Se os índices NÃO existirem, execute:
-- (Descomente se necessário)

-- CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
-- ON calendar_events(linked_resource_type, linked_resource_id);
--
-- CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
-- ON calendar_events(auto_created);

-- ============================================================
-- ✅ RESUMO FINAL
-- ============================================================

-- Verificar tudo de uma vez
SELECT 
    'Colunas' AS tipo,
    COUNT(*) AS quantidade
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created')

UNION ALL

SELECT 
    'Índices' AS tipo,
    COUNT(*) AS quantidade
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'calendar_events'
  AND (indexname LIKE '%linked_resource%' OR indexname LIKE '%auto_created%')

UNION ALL

SELECT 
    'Migração Registrada' AS tipo,
    COUNT(*) AS quantidade
FROM __drizzle_migrations
WHERE hash = '0050_calendar_auto_integration';
