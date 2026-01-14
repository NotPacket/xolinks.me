import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, logAdminAction } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  const where = {
    AND: [
      search
        ? {
            OR: [
              { username: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { displayName: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      role ? { role } : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            links: true,
            platformConnections: true,
            linkClicks: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const body = await request.json();
  const { userId, updates } = body;

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  // Only allow certain fields to be updated
  const allowedFields = ["role", "subscriptionTier", "subscriptionStatus"];
  const filteredUpdates: Record<string, string> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && typeof value === "string") {
      filteredUpdates[key] = value;
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: filteredUpdates,
    select: {
      id: true,
      username: true,
      role: true,
      subscriptionTier: true,
    },
  });

  await logAdminAction(
    adminCheck.user.id,
    "update_user",
    "user",
    userId,
    { ...filteredUpdates }
  );

  return NextResponse.json({ user });
}
