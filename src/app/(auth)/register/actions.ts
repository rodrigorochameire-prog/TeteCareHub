"use server";

// DEPRECATED: Usamos Clerk para autenticação agora
// Esta action é mantida apenas para compatibilidade
export async function registerAction(): Promise<{ success: boolean; error?: string }> {
  return { 
    success: false, 
    error: "Use o cadastro do Clerk em /sign-up" 
  };
}
