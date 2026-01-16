-- ==========================================
-- Índices de Performance para Daily Logs
-- ==========================================

-- Índice composto para source + date (query mais comum)
CREATE INDEX IF NOT EXISTS idx_daily_logs_source_date 
  ON daily_logs(source, log_date DESC);

-- Índice para busca por criador
CREATE INDEX IF NOT EXISTS idx_daily_logs_created_by 
  ON daily_logs(created_by_id);

-- Índice composto para filtros combinados
CREATE INDEX IF NOT EXISTS idx_daily_logs_pet_source_date 
  ON daily_logs(pet_id, source, log_date DESC);

-- Índice para logs recentes (últimos 7 dias)
CREATE INDEX IF NOT EXISTS idx_daily_logs_recent 
  ON daily_logs(log_date DESC) 
  WHERE log_date > CURRENT_DATE - INTERVAL '7 days';

-- Atualizar estatísticas
ANALYZE daily_logs;
