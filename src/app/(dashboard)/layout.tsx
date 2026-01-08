import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // O layout apenas verifica autenticação
  // Cada sub-layout (admin/tutor) adiciona sua própria sidebar
  return <>{children}</>;
}
