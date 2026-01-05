import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { LandingPage } from "@/components/landing-page";

export default async function HomePage() {
  const { userId } = await auth();

  // Se não estiver autenticado, mostra a landing page
  if (!userId) {
    return <LandingPage />;
  }

  // Se autenticado, buscar o role do usuário
  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role || "tutor";

  if (role === "admin") {
    redirect("/admin");
  }

  redirect("/tutor");
}
