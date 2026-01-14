import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./session";
import prisma from "@/lib/db";

export async function requireAdmin(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, username: true },
  });

  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, string | number | boolean | null>,
  ipAddress?: string
) {
  await prisma.adminLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      ipAddress,
    },
  });
}
