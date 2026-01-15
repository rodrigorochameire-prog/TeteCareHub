import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pets, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    database: {
      urlConfigured: Boolean(process.env.DATABASE_URL),
      urlPreview: process.env.DATABASE_URL?.substring(0, 60) + "...",
    },
  };

  try {
    // Test Drizzle connection
    const petCount = await db.select({ count: sql<number>`count(*)` }).from(pets);
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);

    const samplePets = await db
      .select({
        id: pets.id,
        name: pets.name,
        approvalStatus: pets.approvalStatus,
      })
      .from(pets)
      .limit(5);

    results.drizzleConnected = true;
    results.counts = {
      pets: petCount[0]?.count?.toString() || "0",
      users: userCount[0]?.count?.toString() || "0",
    };
    results.samplePets = samplePets;
    results.status = "ok";
  } catch (error) {
    results.status = "error";
    results.drizzleConnected = false;
    results.error = error instanceof Error ? error.message : "Unknown error";
  }

  return NextResponse.json(results);
}
