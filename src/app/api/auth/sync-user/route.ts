import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    // Verificar se usuário já existe
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Criar novo usuário (tutor) com status pendente
      const [newUser] = await db
        .insert(users)
        .values({
          name: name || email.split("@")[0],
          email,
          role: "user",
          emailVerified: true, // Clerk já verifica o email
          approvalStatus: "pending", // Novo tutor precisa de aprovação
        })
        .returning();

      user = newUser;
      console.log("[SyncUser] Novo usuário criado:", email, "- Status: pending");
    } else {
      console.log("[SyncUser] Usuário existente:", email, "- Role:", user.role, "- Status:", user.approvalStatus);
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      approvalStatus: user.approvalStatus,
    });
  } catch (error) {
    console.error("[SyncUser] Error:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar usuário" },
      { status: 500 }
    );
  }
}

