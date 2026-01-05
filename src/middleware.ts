import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "tetecare_session";

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/api/trpc",
];

// Verificar se é uma rota pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(route + "/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  );
}

// Verificar token JWT
async function verifyToken(token: string): Promise<{ userId: number; role: string } | null> {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;
    
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return {
      userId: payload.userId as number,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas - permitir acesso
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Obter token do cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Se não há token, redirecionar para login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar token
  const payload = await verifyToken(token);

  if (!payload) {
    // Token inválido - redirecionar para login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const { role } = payload;

  // Rotas de admin - verificar se é admin
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/tutor", request.url));
    }
  }

  // Rotas de tutor - verificar se é tutor
  if (pathname.startsWith("/tutor")) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Nota: A verificação de approvalStatus é feita no layout/página
    // porque requer consulta ao banco de dados
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
