-- ============================================================
-- ⚡ COMANDOS SQL RÁPIDOS - EXECUTAR NO SUPABASE SQL EDITOR
-- ============================================================
-- 
-- Execute estes comandos na ordem, um bloco por vez
-- ============================================================

-- 1️⃣ VERIFICAR SE AS COLUNAS JÁ EXISTEM
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'calendar_events'
  AND column_name IN ('linked_resource_type', 'linked_resource_id', 'auto_created');

-- 2️⃣ ADICIONAR COLUNAS (execute apenas se não existirem)
ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS linked_resource_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS linked_resource_id INTEGER,
ADD COLUMN IF NOT EXISTS auto_created BOOLEAN NOT NULL DEFAULT FALSE;

-- 3️⃣ CRIAR ÍNDICES (para melhorar performance)
CREATE INDEX IF NOT EXISTS idx_calendar_events_linked_resource 
ON calendar_events(linked_resource_type, linked_resource_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_auto_created 
ON calendar_events(auto_created);

-- 4️⃣ CRIAR TABELA DE MIGRAÇÕES (se não existir)
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id SERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5️⃣ REGISTRAR MIGRAÇÃO
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('0050_calendar_auto_integration', NOW())
ON CONFLICT (hash) DO NOTHING;

-- 6️⃣ VERIFICAR RESULTADO
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

-- ✅ PRONTO! As colunas foram criadas com sucesso.
