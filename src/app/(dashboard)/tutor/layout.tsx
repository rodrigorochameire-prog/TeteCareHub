import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { TutorSidebar } from "@/components/layouts/tutor-sidebar";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Se for admin NO BANCO DE DADOS, redirecionar para área de admin
  if (dbUser?.role === "admin") {
    redirect("/admin");
  }

  return (
    <TutorSidebar 
      userName={dbUser?.name || clerkUser.firstName || "Usuário"} 
      userEmail={email}
    >
      {children}
    </TutorSidebar>
  );
}
