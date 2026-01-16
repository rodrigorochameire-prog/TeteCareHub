-- ==========================================
-- Índices de Performance para TeteCare
-- ==========================================

-- Índices para pets (tabela mais consultada)
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_approval_status ON pets(approval_status);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON pets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pets_status_approval ON pets(status, approval_status);

-- Índice composto para busca rápida de pets aprovados ativos
CREATE INDEX IF NOT EXISTS idx_pets_active_approved ON pets(status, approval_status) 
  WHERE approval_status = 'approved';

-- Índices para pet_tutors (relacionamento)
CREATE INDEX IF NOT EXISTS idx_pet_tutors_tutor_id ON pet_tutors(tutor_id);
CREATE INDEX IF NOT EXISTS idx_pet_tutors_pet_id ON pet_tutors(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_tutors_composite ON pet_tutors(tutor_id, pet_id);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices para daily_logs
CREATE INDEX IF NOT EXISTS idx_daily_logs_pet_id ON daily_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_pet_date ON daily_logs(pet_id, log_date DESC);

-- Índices para calendar_events
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_pet_id ON calendar_events(pet_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range ON calendar_events(event_date, end_date);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Índices para behavior_logs
CREATE INDEX IF NOT EXISTS idx_behavior_logs_pet_id ON behavior_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_date ON behavior_logs(log_date DESC);

-- Índices para training_logs
CREATE INDEX IF NOT EXISTS idx_training_logs_pet_id ON training_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_date ON training_logs(training_date DESC);

-- Índices para pet_vaccinations
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON pet_vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_next_date ON pet_vaccinations(next_date);

-- Índices para pet_medications
CREATE INDEX IF NOT EXISTS idx_medications_pet_id ON pet_medications(pet_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON pet_medications(pet_id, is_active);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Índices para whatsapp_config
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_active ON whatsapp_config(admin_id, is_active);

-- ==========================================
-- Estatísticas atualizadas
-- ==========================================
ANALYZE pets;
ANALYZE users;
ANALYZE daily_logs;
ANALYZE calendar_events;
ANALYZE notifications;
ANALYZE pet_tutors;
