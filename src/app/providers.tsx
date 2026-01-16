"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState, Suspense } from "react";
import superjson from "superjson";
import { trpc } from "@/lib/trpc/client";
import { ThemeProvider } from "@/contexts/theme-context";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// Loading spinner minimalista
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache agressivo para melhor performance
            staleTime: 60 * 1000, // 1 minuto - dados frescos por mais tempo
            gcTime: 10 * 60 * 1000, // 10 minutos - manter em cache
            refetchOnWindowFocus: false, // Não refetch ao focar janela
            refetchOnMount: false, // Não refetch ao montar componente
            refetchOnReconnect: false, // Não refetch ao reconectar
            retry: 2, // 2 tentativas em caso de erro
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
            networkMode: "offlineFirst", // Usar cache primeiro
          },
          mutations: {
            retry: 1,
            networkMode: "offlineFirst",
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          // Batching para melhor performance
          maxURLLength: 2083,
        }),
      ],
    })
  );

  return (
    <ClerkProvider
      localization={ptBR}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
            <Toaster 
              richColors 
              position="top-right" 
              toastOptions={{
                className: "glass",
                duration: 3000,
              }}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ClerkProvider>
  );
}
