import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { TutorSidebar } from "@/components/layouts/tutor-sidebar";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = (user.publicMetadata as { role?: string })?.role || "tutor";
  
  // Se for admin, redirecionar para área de admin
  if (role === "admin") {
    redirect("/admin");
  }

  return (
    <TutorSidebar 
      userName={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || "Usuário"} 
      userEmail={user.emailAddresses[0]?.emailAddress || ""}
    >
      {children}
    </TutorSidebar>
  );
}
