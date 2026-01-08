import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auth-redirect",
  "/login",
  "/register",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isTutorRoute = createRouteMatcher(["/tutor(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Permitir rotas públicas sem verificação
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Proteger todas as outras rotas
  const { userId, sessionClaims } = await auth();

  // Se não estiver autenticado, redirecionar para sign-in
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Usuário está autenticado - verificar role apenas para redirecionamentos entre áreas
  const publicMeta = (sessionClaims as any)?.publicMetadata || (sessionClaims as any)?.public_metadata || {};
  const userRole = publicMeta?.role || "tutor";
  
  console.log("[Middleware] Path:", req.nextUrl.pathname, "userId:", userId, "role:", userRole);

  // Redirecionar admin tentando acessar área de tutor
  if (isTutorRoute(req) && userRole === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Redirecionar tutor tentando acessar área de admin
  if (isAdminRoute(req) && userRole !== "admin") {
    return NextResponse.redirect(new URL("/tutor", req.url));
  }

  // Permitir acesso
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
