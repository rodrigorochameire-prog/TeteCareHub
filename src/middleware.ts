import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/register(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/auth-redirect",
  "/api/webhooks(.*)",
  "/api/trpc(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isTutorRoute = createRouteMatcher(["/tutor(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Rotas públicas - permitir acesso
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Não autenticado - redirecionar para login
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Para verificar o role, precisamos fazer uma chamada separada
  // O middleware não deve bloquear com base no role aqui
  // Os layouts já fazem essa verificação com currentUser()
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
