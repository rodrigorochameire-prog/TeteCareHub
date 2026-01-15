import { NextResponse } from "next/server";
import { db, pets, users } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Testar conexão básica
    const connectionTest = await db.execute(sql`SELECT 1 as test`);
    
    // Contar pets
    const petsCount = await db.execute(sql`SELECT COUNT(*) as count FROM pets`);
    
    // Contar usuários
    const usersCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    
    // Listar primeiros 5 pets (apenas id e nome)
    const samplePets = await db.execute(sql`SELECT id, name, approval_status FROM pets LIMIT 5`);
    
    // Verificar se DATABASE_URL está definida
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPreview = process.env.DATABASE_URL 
      ? process.env.DATABASE_URL.substring(0, 50) + "..."
      : "NOT SET";

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        urlConfigured: hasDbUrl,
        urlPreview: dbUrlPreview,
      },
      counts: {
        pets: petsCount[0]?.count || 0,
        users: usersCount[0]?.count || 0,
      },
      samplePets: samplePets || [],
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        connected: false,
        urlConfigured: !!process.env.DATABASE_URL,
      },
    }, { status: 500 });
  }
}
