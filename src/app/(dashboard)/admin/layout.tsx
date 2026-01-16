import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { unstable_cache } from "next/cache";

// Cache da query de usuário por 5 minutos - evita query a cada navegação
const getCachedUser = unstable_cache(
  async (email: string) => {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    });
  },
  ["admin-user"],
  { revalidate: 300, tags: ["user"] } // 5 minutos de cache
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  
  // Buscar usuário com cache - não faz query a cada navegação
  const dbUser = await getCachedUser(email);

  if (!dbUser) {
    // Usuário existe no Clerk mas não no banco - redirecionar para sincronizar
    redirect("/auth-redirect");
  }

  // Verificar se é admin
  if (dbUser.role !== "admin") {
    redirect("/tutor");
  }

  return (
    <AdminSidebar userName={dbUser.name} userEmail={dbUser.email}>
      {children}
    </AdminSidebar>
  );
}
