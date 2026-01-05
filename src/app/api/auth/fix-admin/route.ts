import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

// Rota temporária para garantir que o admin está configurado corretamente
export async function GET(request: NextRequest) {
  const adminEmail = "rodrigorochameire@gmail.com";
  
  try {
    // Verificar se usuário existe
    let user = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    });

    if (!user) {
      // Criar usuário admin
      const [newUser] = await db
        .insert(users)
        .values({
          name: "Rodrigo",
          email: adminEmail,
          role: "admin",
          emailVerified: true,
          approvalStatus: "approved",
        })
        .returning();

      return NextResponse.json({
        message: "Admin criado com sucesso",
        user: newUser,
      });
    }

    // Atualizar para admin e aprovado se necessário
    if (user.role !== "admin" || user.approvalStatus !== "approved") {
      const [updated] = await db
        .update(users)
        .set({
          role: "admin",
          approvalStatus: "approved",
          updatedAt: new Date(),
        })
        .where(eq(users.email, adminEmail))
        .returning();

      return NextResponse.json({
        message: "Admin atualizado com sucesso",
        user: updated,
      });
    }

    return NextResponse.json({
      message: "Admin já está configurado corretamente",
      user,
    });
  } catch (error) {
    console.error("[FixAdmin] Error:", error);
    return NextResponse.json(
      { error: "Erro ao configurar admin" },
      { status: 500 }
    );
  }
}

