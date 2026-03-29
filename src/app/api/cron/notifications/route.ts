import { NextRequest, NextResponse } from "next/server";
import { runNotificationCheck } from "@/lib/services/notification-engine";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron invocations)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runNotificationCheck();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Cron notification error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
