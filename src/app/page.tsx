import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LandingPage } from "@/components/landing-page";

export default async function HomePage() {
  const { userId, sessionClaims } = await auth();

  // Se não estiver autenticado, mostra a landing page
  if (!userId) {
    return <LandingPage />;
  }

  // Se autenticado, redireciona baseado no role
  const publicMeta = (sessionClaims as { publicMetadata?: { role?: string } })?.publicMetadata || {};
  const role = publicMeta.role || "tutor";

  if (role === "admin") {
    redirect("/admin");
  }

  redirect("/tutor");
}
