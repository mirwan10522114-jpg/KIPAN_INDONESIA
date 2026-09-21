import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/activity-log?table=pengurus&recordId=123&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");
    const recordId = searchParams.get("recordId");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (table) where.table = table;
    if (recordId) where.recordId = parseInt(recordId);

    const logs = await db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: logs, total: logs.length });
  } catch (error) {
    console.error("GET /api/activity-log error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil activity log" }, { status: 500 });
  }
}
