import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getSession } from "@/lib/auth/session";
import type { User } from "@/lib/db/schema";

/**
 * Contexto do tRPC
 */
export interface TRPCContext {
  user: User | null;
}

/**
 * Cria o contexto para cada requisição
 */
export async function createTRPCContext(): Promise<TRPCContext> {
  const user = await getSession();
  return { user };
}

/**
 * Inicialização do tRPC
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Router e procedures
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Procedure protegida - requer autenticação
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
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
 * Procedure de admin - requer role admin
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado: requer permissão de administrador",
    });
  }

  return next({ ctx });
});
