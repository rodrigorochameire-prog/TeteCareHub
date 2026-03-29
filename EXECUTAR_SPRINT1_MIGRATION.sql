-- Sprint 1: Cadastro Unificado + Ficha Hub + Permissoes
-- Executar no Supabase Dashboard > SQL Editor

-- 1. Tabela de convites
CREATE TABLE IF NOT EXISTS invitations (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) NOT NULL UNIQUE,
  tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_ids JSONB NOT NULL DEFAULT '[]',
  dashboard_access BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_by INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invitations_token_idx ON invitations(token);
CREATE INDEX IF NOT EXISTS invitations_tutor_id_idx ON invitations(tutor_id);
CREATE INDEX IF NOT EXISTS invitations_status_idx ON invitations(status);

-- 2. Campos novos na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(20) NOT NULL DEFAULT 'not_started';
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by INTEGER REFERENCES users(id);

-- 3. Campo novo na tabela pets
ALTER TABLE pets ADD COLUMN IF NOT EXISTS admin_locked_fields JSONB DEFAULT '[]';

-- 4. Campos source e created_by_user_id nas tabelas editaveis
ALTER TABLE pet_vaccinations ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE pet_vaccinations ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE pet_medications ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE pet_medications ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE preventive_treatments ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE preventive_treatments ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE pet_food_plans ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE pet_food_plans ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE pet_weight_history ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE pet_weight_history ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE behavior_logs ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE behavior_logs ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);

ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'admin';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS created_by_user_id INTEGER REFERENCES users(id);
