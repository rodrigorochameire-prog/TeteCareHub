import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = (user.publicMetadata as { role?: string })?.role || "tutor";

  // Verificar se é admin
  if (role !== "admin") {
    redirect("/tutor");
  }

  return (
    <AdminSidebar 
      userName={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || "Admin"} 
      userEmail={user.emailAddresses[0]?.emailAddress || ""}
    >
      {children}
    </AdminSidebar>
  );
}
