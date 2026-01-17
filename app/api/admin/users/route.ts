import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
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
        avatarUrl: true,
        role: true,
        subscriptionTier: true,
        isFeatured: true,
        emailVerified: true,
        totalProfileViews: true,
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
  const allowedStringFields = ["role", "subscriptionTier", "subscriptionStatus", "email", "username"];
  const allowedBooleanFields = ["isFeatured", "emailVerified"];
  const filteredUpdates: Record<string, string | boolean> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (allowedStringFields.includes(key) && typeof value === "string") {
      filteredUpdates[key] = value;
    }
    if (allowedBooleanFields.includes(key) && typeof value === "boolean") {
      filteredUpdates[key] = value;
    }
  }

  // Handle password reset separately
  if (updates.newPassword && typeof updates.newPassword === "string" && updates.newPassword.length >= 6) {
    const passwordHash = await bcrypt.hash(updates.newPassword, 12);
    (filteredUpdates as Record<string, string | boolean>).passwordHash = passwordHash;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: filteredUpdates,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      subscriptionTier: true,
      isFeatured: true,
      emailVerified: true,
    },
  });

  await logAdminAction(
    adminCheck.user.id,
    "update_user",
    "user",
    userId,
    { ...filteredUpdates, passwordChanged: updates.newPassword ? true : false }
  );

  return NextResponse.json({ user });
}

export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  // Prevent deleting yourself
  if (userId === adminCheck.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  // Get user info before deletion for logging
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Delete the user (cascades to related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  await logAdminAction(
    adminCheck.user.id,
    "delete_user",
    "user",
    userId,
    { username: user.username, email: user.email }
  );

  return NextResponse.json({ success: true });
}
