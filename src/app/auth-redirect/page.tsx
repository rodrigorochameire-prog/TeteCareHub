import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function AuthRedirectPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string })?.role || "tutor";

  console.log("[AuthRedirect] User:", user?.emailAddresses[0]?.emailAddress, "Role:", role);

  if (role === "admin") {
    redirect("/admin");
  }

  redirect("/tutor");
}
