-- Alinha o schema da tabela public.documents com o esperado pela aplicação
-- Alguns ambientes foram criados com colunas `name` e `created_by_id` (rota /api/setup/all-tables).
-- A aplicação (Drizzle + tRPC) espera `title` e `uploaded_by_id`.

DO $$
BEGIN
  -- Renomear created_by_id -> uploaded_by_id (se necessário)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'created_by_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'uploaded_by_id'
  ) THEN
    ALTER TABLE public.documents RENAME COLUMN created_by_id TO uploaded_by_id;
  END IF;

  -- Renomear name -> title (se necessário)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'title'
  ) THEN
    ALTER TABLE public.documents RENAME COLUMN name TO title;
  END IF;
END $$;

