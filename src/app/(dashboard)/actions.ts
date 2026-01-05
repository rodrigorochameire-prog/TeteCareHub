"use server";

export async function logoutAction() {
  // O logout com Clerk é feito no cliente usando useClerk().signOut()
  // Esta action é mantida por compatibilidade
  return { success: true };
}
