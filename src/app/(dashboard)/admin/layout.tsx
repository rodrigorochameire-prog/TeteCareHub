import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function AdminLayout({
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

  // Verificar se é admin NO BANCO DE DADOS
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/tutor");
  }

  return (
    <AdminSidebar 
      userName={dbUser.name || clerkUser.firstName || "Admin"} 
      userEmail={email}
    >
      {children}
    </AdminSidebar>
  );
}
