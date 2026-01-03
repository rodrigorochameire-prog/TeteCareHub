"use server";

import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

interface ForgotPasswordResult {
  success: boolean;
  message: string;
}

export async function forgotPasswordAction(email: string): Promise<ForgotPasswordResult> {
  try {
    if (!email || !email.includes("@")) {
      return {
        success: false,
        message: "Por favor, forneça um email válido",
      };
    }

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    // Sempre retornar sucesso para não revelar se o email existe
    if (!user) {
      console.log(`[Forgot Password] Email não encontrado: ${email}`);
      return {
        success: true,
        message: "Se o email existir, você receberá as instruções de recuperação",
      };
    }

    // Em produção, enviar email real aqui
    console.log("=".repeat(50));
    console.log("📧 EMAIL DE RECUPERAÇÃO DE SENHA");
    console.log(`Para: ${email}`);
    console.log(`Nome: ${user.name}`);
    console.log("=".repeat(50));

    return {
      success: true,
      message: "Se o email existir, você receberá as instruções de recuperação",
    };
  } catch (error) {
    console.error("[Forgot Password] Erro:", error);
    return {
      success: false,
      message: "Erro ao processar solicitação. Tente novamente.",
    };
  }
}
