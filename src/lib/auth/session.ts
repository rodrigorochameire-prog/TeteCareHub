import { auth, currentUser } from "@clerk/nextjs/server";
import { db, users, type User } from "@/lib/db";
import { eq } from "drizzle-orm";

/**
 * Obtém a sessão atual do usuário usando Clerk
 * Busca o usuário no banco de dados pelo email do Clerk
 */
export async function getSession(): Promise<User | null> {
  try {
    // Verificar se está autenticado
    const { userId } = await auth();
    
    if (!userId) {
      console.log("[getSession] No userId from Clerk auth()");
      return null;
    }

    // Obter dados completos do usuário Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log("[getSession] No clerkUser from currentUser()");
      return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      console.log("[getSession] No email found in clerkUser");
      return null;
    }

    console.log("[getSession] Looking for user with email:", email);

    // Buscar usuário no banco pelo email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      console.log("[getSession] Found user:", user.id, user.role);
    } else {
      console.log("[getSession] User not found in database");
    }

    return user ?? null;
  } catch (error) {
    console.error("[getSession] Error:", error);
    return null;
  }
}

/**
 * Verifica se o usuário está autenticado (para uso em Server Components)
 */
export async function requireAuth(): Promise<User> {
  const user = await getSession();

  if (!user) {
    throw new Error("Não autenticado");
  }

  return user;
}

/**
 * Verifica se o usuário é admin
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();

  if (user.role !== "admin") {
    throw new Error("Acesso negado: requer permissão de administrador");
  }

  return user;
}
