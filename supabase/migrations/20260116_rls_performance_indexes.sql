-- ============================================
-- OTIMIZAÇÃO DE PERFORMANCE - RLS E ÍNDICES
-- Execute este script COMPLETO no Supabase Dashboard
-- ============================================

-- ============================================
-- PARTE 1: ÍNDICES CRÍTICOS PARA RLS
-- ============================================

-- Índice na coluna auth_id (usada pelo RLS para identificar usuário)
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- Índice na coluna role (usada pelo is_admin() do RLS)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índice composto para verificação de admin (mais eficiente)
CREATE INDEX IF NOT EXISTS idx_users_auth_role ON users(auth_id, role);

-- Índices para pet_tutors (usada pelo is_tutor_of_pet())
CREATE INDEX IF NOT EXISTS idx_pet_tutors_tutor_id ON pet_tutors("tutorId");
CREATE INDEX IF NOT EXISTS idx_pet_tutors_pet_id ON pet_tutors("petId");
CREATE INDEX IF NOT EXISTS idx_pet_tutors_composite ON pet_tutors("tutorId", "petId");

-- Índices para pets
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_approval_status ON pets(approval_status);

-- Índices para daily_logs
CREATE INDEX IF NOT EXISTS idx_daily_logs_pet_id ON daily_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date DESC);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- PARTE 2: OTIMIZAR FUNÇÕES RLS
-- Substitui funções PL/pgSQL lentas por SQL puro
-- ============================================

-- Função is_admin otimizada - usa SQL puro (mais rápido)
CREATE OR REPLACE FUNCTION public.is_admin(user_auth_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = user_auth_id AND role = 'admin'
  );
$$;

-- Função is_tutor_of_pet otimizada
CREATE OR REPLACE FUNCTION public.is_tutor_of_pet(user_auth_id uuid, pet_id_param int)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.pet_tutors pt ON pt."tutorId" = u.id
    WHERE u.auth_id = user_auth_id AND pt."petId" = pet_id_param
  );
$$;

-- ============================================
-- PARTE 3: ATUALIZAR ESTATÍSTICAS
-- ============================================

ANALYZE users;
ANALYZE pets;
ANALYZE pet_tutors;
ANALYZE daily_logs;
ANALYZE notifications;
ANALYZE pet_vaccinations;
ANALYZE pet_medications;

-- ============================================
-- PARTE 4: VERIFICAR RLS (OPCIONAL)
-- Descomente se quiser desativar RLS temporariamente
-- para testar se é realmente o RLS causando lentidão
-- ============================================

-- Para TESTAR se o problema é RLS, descomente:
-- ALTER TABLE pets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_logs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE pet_tutors DISABLE ROW LEVEL SECURITY;

-- Para reativar depois:
-- ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pet_tutors ENABLE ROW LEVEL SECURITY;
