"use server";

// DEPRECATED: Usamos Clerk para autenticação agora
// Esta action é mantida apenas para compatibilidade
export async function loginAction(): Promise<{ success: boolean; error?: string }> {
  return { 
    success: false, 
    error: "Use o login do Clerk em /sign-in" 
  };
}
