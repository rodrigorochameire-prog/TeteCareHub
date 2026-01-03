import { getSupabaseAdmin } from "./client";

const BUCKET_NAME = "pet-photos";

/**
 * Faz upload de uma imagem para o Supabase Storage
 */
export async function uploadImage(
  file: File,
  folder: string = "pets"
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin();

  // Gerar nome único para o arquivo
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error("Erro no upload:", error);
    throw new Error(`Falha no upload: ${error.message}`);
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Faz upload de uma imagem a partir de um Buffer
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = "pets"
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin();

  // Gerar nome único para o arquivo
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueName, buffer, {
      cacheControl: "3600",
      upsert: false,
      contentType,
    });

  if (error) {
    console.error("Erro no upload:", error);
    throw new Error(`Falha no upload: ${error.message}`);
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Deleta uma imagem do Supabase Storage
 */
export async function deleteImage(path: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error("Erro ao deletar:", error);
    throw new Error(`Falha ao deletar: ${error.message}`);
  }
}

/**
 * Lista imagens de uma pasta
 */
export async function listImages(folder: string = "pets"): Promise<string[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folder);

  if (error) {
    console.error("Erro ao listar:", error);
    return [];
  }

  return data.map((file) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${folder}/${file.name}`);
    return urlData.publicUrl;
  });
}
