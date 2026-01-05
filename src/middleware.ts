import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth-redirect",
  "/api/webhooks(.*)",
  "/api/auth(.*)", // Permitir rotas de auth
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Rotas públicas não precisam de autenticação
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Se não está autenticado, redirecionar para login
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // IMPORTANTE: NÃO fazer verificação de role aqui
  // A verificação de permissões é feita nos layouts de admin e tutor
  // que consultam o banco de dados (fonte de verdade)
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
