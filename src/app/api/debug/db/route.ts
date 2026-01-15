import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    supabase: {
      configured: isSupabaseConfigured(),
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + "...",
    },
    database: {
      urlConfigured: Boolean(process.env.DATABASE_URL),
      urlPreview: process.env.DATABASE_URL?.substring(0, 50) + "...",
    },
  };

  // Test Supabase REST API
  try {
    const { data: pets, error: petsError } = await supabaseAdmin
      .from("pets")
      .select("id, name, approval_status")
      .limit(5);

    if (petsError) {
      results.supabaseError = petsError.message;
    } else {
      results.supabaseConnected = true;
      results.samplePets = pets;
    }

    const { count: petsCount } = await supabaseAdmin
      .from("pets")
      .select("*", { count: "exact", head: true });

    const { count: usersCount } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    results.counts = {
      pets: petsCount,
      users: usersCount,
    };

    results.status = "ok";
  } catch (error) {
    results.status = "error";
    results.error = error instanceof Error ? error.message : "Unknown error";
  }

  return NextResponse.json(results);
}
