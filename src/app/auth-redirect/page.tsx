import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Buscar usuário do banco pelo email do Clerk
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  
  if (!email) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  console.log("[AuthRedirect] Email:", email, "DB Role:", dbUser?.role);

  // Redirecionar baseado no role DO BANCO DE DADOS
  if (dbUser?.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/tutor");
  }
}

