import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { currentUser } from "@clerk/nextjs/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { toTRPCError } from "@/lib/errors";
import type { User } from "@/lib/db/schema";

/**
 * Contexto do tRPC
 */
export interface TRPCContext {
  user: User | null;
}

/**
 * Cria o contexto para cada requisição
 * Usa Clerk para autenticação e busca o usuário no banco pelo email
 */
export async function createTRPCContext(): Promise<TRPCContext> {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return { user: null };
    }

    // Buscar usuário no banco de dados pelo email do Clerk
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      console.error("[tRPC Context] Usuário Clerk sem email");
      return { user: null };
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!dbUser) {
      console.log("[tRPC Context] Usuário não encontrado no banco:", email);
      return { user: null };
    }

    return { user: dbUser };
  } catch (error) {
    console.error("Erro ao criar contexto tRPC:", error);
    return { user: null };
  }
}

/**
 * Inicialização do tRPC
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Em produção, não expor stack trace
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };
  },
});

/**
 * Middleware de tratamento de erros global
 */
const errorHandler = t.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    throw toTRPCError(error);
  }
});

/**
 * Middleware de logging (apenas em desenvolvimento)
 */
const logger = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  if (process.env.NODE_ENV === "development") {
    console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`);
  }

  return result;
});

/**
 * Router e procedures base
 */
export const router = t.router;

// Procedure pública com logging e tratamento de erros
export const publicProcedure = t.procedure.use(logger).use(errorHandler);

/**
 * Middleware de autenticação
 */
const requireAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar logado para acessar este recurso",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Procedure protegida - requer autenticação
 */
export const protectedProcedure = publicProcedure.use(requireAuth);

/**
 * Middleware de autorização admin
 */
const requireAdmin = t.middleware(async ({ ctx, next }) => {
  // Já temos certeza que ctx.user existe porque este middleware
  // é usado após o requireAuth
  if ((ctx as { user: User }).user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado: requer permissão de administrador",
    });
  }

  return next({ ctx });
});

/**
 * Procedure de admin - requer role admin
 */
export const adminProcedure = protectedProcedure.use(requireAdmin);
