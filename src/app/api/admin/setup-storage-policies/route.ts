import { NextResponse } from "next/server";
import { Pool } from "pg";

const SQL_COMMANDS = `
-- Habilitar RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: Extrair pet_id do caminho
CREATE OR REPLACE FUNCTION storage.extract_pet_id(file_path TEXT)
RETURNS INTEGER AS $$
DECLARE
  parts TEXT[];
BEGIN
  parts := string_to_array(file_path, '/');
  IF array_length(parts, 1) >= 2 AND parts[1] = 'pets' THEN
    RETURN parts[2]::INTEGER;
  END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função auxiliar: Verificar se usuário é admin
CREATE OR REPLACE FUNCTION storage.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid()::text 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar: Verificar se usuário é tutor do pet
CREATE OR REPLACE FUNCTION storage.is_pet_tutor(pet_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pet_tutors pt
    JOIN public.users u ON pt.tutor_id = u.id
    WHERE pt.pet_id = pet_id_param 
    AND u.auth_id = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Limpar políticas antigas
DROP POLICY IF EXISTS "pet_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "pet_photos_delete" ON storage.objects;
DROP POLICY IF EXISTS "documents_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_update" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete" ON storage.objects;
DROP POLICY IF EXISTS "wall_media_select" ON storage.objects;
DROP POLICY IF EXISTS "wall_media_insert" ON storage.objects;
DROP POLICY IF EXISTS "wall_media_update" ON storage.objects;
DROP POLICY IF EXISTS "wall_media_delete" ON storage.objects;

-- POLÍTICAS pet-photos
CREATE POLICY "pet_photos_select" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'pet-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

CREATE POLICY "pet_photos_insert" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'pet-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

CREATE POLICY "pet_photos_update" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'pet-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

CREATE POLICY "pet_photos_delete" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'pet-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

-- POLÍTICAS documents
CREATE POLICY "documents_select" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

CREATE POLICY "documents_insert" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

CREATE POLICY "documents_update" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

CREATE POLICY "documents_delete" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (storage.is_admin() OR storage.is_pet_tutor(storage.extract_pet_id(name)))
);

-- POLÍTICAS wall-media
CREATE POLICY "wall_media_select" ON storage.objects 
FOR SELECT USING (bucket_id = 'wall-media' AND auth.role() = 'authenticated');

CREATE POLICY "wall_media_insert" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'wall-media' 
  AND auth.role() = 'authenticated'
  AND storage.is_admin()
);

CREATE POLICY "wall_media_update" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'wall-media' 
  AND auth.role() = 'authenticated'
  AND storage.is_admin()
);

CREATE POLICY "wall_media_delete" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'wall-media' 
  AND auth.role() = 'authenticated'
  AND storage.is_admin()
);
`;

export async function POST() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL não configurada" },
      { status: 500 }
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    
    // Executar cada comando separadamente
    const commands = SQL_COMMANDS.split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    const results: string[] = [];
    
    for (const command of commands) {
      try {
        await client.query(command);
        results.push(`✅ Executado: ${command.substring(0, 50)}...`);
      } catch (err: unknown) {
        const error = err as Error;
        results.push(`⚠️ Erro: ${command.substring(0, 30)}... - ${error.message}`);
      }
    }

    client.release();

    // Verificar políticas criadas
    const policiesResult = await pool.query(`
      SELECT policyname, cmd 
      FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage'
      ORDER BY policyname
    `);

    return NextResponse.json({
      success: true,
      message: "Políticas RLS configuradas",
      results,
      policies: policiesResult.rows,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL não configurada" },
      { status: 500 }
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Verificar políticas existentes
    const policiesResult = await pool.query(`
      SELECT policyname, cmd, permissive, roles
      FROM pg_policies 
      WHERE tablename = 'objects' AND schemaname = 'storage'
      ORDER BY policyname
    `);

    // Verificar buckets
    const bucketsResult = await pool.query(`
      SELECT id, name, public 
      FROM storage.buckets 
      ORDER BY name
    `);

    return NextResponse.json({
      policies: policiesResult.rows,
      buckets: bucketsResult.rows,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

