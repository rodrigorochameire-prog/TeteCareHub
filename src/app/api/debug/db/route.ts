import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pets, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    // Test database connection
    const dbUrl = process.env.DATABASE_URL || "";
    const urlPreview = dbUrl.substring(0, 50) + "...";

    // Count pets and users
    const petCount = await db.select({ count: sql<number>`count(*)` }).from(pets);
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);

    // Get sample pets
    const samplePets = await db
      .select({
        id: pets.id,
        name: pets.name,
        approvalStatus: pets.approvalStatus,
      })
      .from(pets)
      .limit(5);

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        urlPreview,
      },
      counts: {
        pets: petCount[0]?.count?.toString() || "0",
        users: userCount[0]?.count?.toString() || "0",
      },
      samplePets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
