import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/lib/trpc/routers";
import { createTRPCContext } from "@/lib/trpc/init";
import { warmupConnection } from "@/lib/db";

// Configuração para Vercel Edge/Serverless
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Máximo para plano Pro - evitar timeouts em cold start

// Pré-aquecer conexão no cold start (não bloqueia)
warmupConnection();

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError: ({ path, error }) => {
      // Sempre logar erros em produção para debugging
      console.error(
        `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
        error.cause || ""
      );
    },
  });

export { handler as GET, handler as POST };
