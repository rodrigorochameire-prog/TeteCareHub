import { NextResponse } from "next/server";
import { db, pets, users, dailyLogs } from "@/lib/db";
import { sql, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, { time: number; count?: number; error?: string }> = {};
  
  // Teste 1: Query simples (sem joins)
  const t1 = Date.now();
  try {
    const [result] = await db.select({ count: count() }).from(pets);
    results["1_count_pets"] = { time: Date.now() - t1, count: result.count };
  } catch (e: any) {
    results["1_count_pets"] = { time: Date.now() - t1, error: e.message };
  }

  // Teste 2: Query simples users
  const t2 = Date.now();
  try {
    const [result] = await db.select({ count: count() }).from(users);
    results["2_count_users"] = { time: Date.now() - t2, count: result.count };
  } catch (e: any) {
    results["2_count_users"] = { time: Date.now() - t2, error: e.message };
  }

  // Teste 3: Query com limit
  const t3 = Date.now();
  try {
    const result = await db.select().from(pets).limit(10);
    results["3_select_pets_limit10"] = { time: Date.now() - t3, count: result.length };
  } catch (e: any) {
    results["3_select_pets_limit10"] = { time: Date.now() - t3, error: e.message };
  }

  // Teste 4: Query de logs
  const t4 = Date.now();
  try {
    const [result] = await db.select({ count: count() }).from(dailyLogs);
    results["4_count_logs"] = { time: Date.now() - t4, count: result.count };
  } catch (e: any) {
    results["4_count_logs"] = { time: Date.now() - t4, error: e.message };
  }

  // Teste 5: Raw SQL (bypassa qualquer abstração)
  const t5 = Date.now();
  try {
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM pets`);
    results["5_raw_sql_count"] = { time: Date.now() - t5, count: Number(result[0]?.count) };
  } catch (e: any) {
    results["5_raw_sql_count"] = { time: Date.now() - t5, error: e.message };
  }

  // Teste 6: Verificar RLS status
  const t6 = Date.now();
  try {
    const result = await db.execute(sql`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('pets', 'users', 'daily_logs', 'pet_tutors')
    `);
    results["6_rls_status"] = { 
      time: Date.now() - t6, 
      count: result.length,
      // @ts-ignore
      data: result 
    };
  } catch (e: any) {
    results["6_rls_status"] = { time: Date.now() - t6, error: e.message };
  }

  // Teste 7: Verificar current_user
  const t7 = Date.now();
  try {
    const result = await db.execute(sql`SELECT current_user, session_user`);
    results["7_current_user"] = { 
      time: Date.now() - t7,
      // @ts-ignore
      data: result[0]
    };
  } catch (e: any) {
    results["7_current_user"] = { time: Date.now() - t7, error: e.message };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    total_time_ms: Object.values(results).reduce((sum, r) => sum + r.time, 0),
    results,
    analysis: analyzeResults(results),
  });
}

function analyzeResults(results: Record<string, any>): string[] {
  const analysis: string[] = [];
  
  for (const [key, value] of Object.entries(results)) {
    if (value.time > 1000) {
      analysis.push(`⚠️ ${key}: ${value.time}ms - MUITO LENTO`);
    } else if (value.time > 500) {
      analysis.push(`⚡ ${key}: ${value.time}ms - Lento`);
    } else if (value.time > 100) {
      analysis.push(`📊 ${key}: ${value.time}ms - Aceitável`);
    }
  }

  if (analysis.length === 0) {
    analysis.push("✅ Todas as queries estão rápidas (<100ms)");
  }

  return analysis;
}
