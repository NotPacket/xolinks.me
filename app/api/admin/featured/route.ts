import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

// GET - Get all featured users
export async function GET() {
  try {
    const featuredUsers = await prisma.user.findMany({
      where: { isFeatured: true },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        totalProfileViews: true,
        _count: {
          select: {
            links: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { totalProfileViews: "desc" },
    });

    return NextResponse.json({
      featured: featuredUsers.map((user) => ({
        ...user,
        linkCount: user._count.links,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("Get featured error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured users" },
      { status: 500 }
    );
  }
}

// PUT - Toggle featured status for a user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (admin?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, isFeatured } = await request.json();

    if (!userId || typeof isFeatured !== "boolean") {
      return NextResponse.json(
        { error: "Missing userId or isFeatured" },
        { status: 400 }
      );
    }

    // Update user's featured status
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isFeatured },
      select: {
        id: true,
        username: true,
        displayName: true,
        isFeatured: true,
      },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.userId,
        action: isFeatured ? "FEATURE_USER" : "UNFEATURE_USER",
        targetType: "user",
        targetId: userId,
        details: { username: user.username },
      },
    });

    return NextResponse.json({
      success: true,
      user,
      message: isFeatured
        ? `${user.displayName || user.username} is now featured`
        : `${user.displayName || user.username} has been removed from featured`,
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    return NextResponse.json(
      { error: "Failed to update featured status" },
      { status: 500 }
    );
  }
}
