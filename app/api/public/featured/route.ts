import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get featured users for homepage
export async function GET() {
  try {
    const featuredUsers = await prisma.user.findMany({
      where: {
        isFeatured: true,
        emailVerified: true, // Only show verified users
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        achievements: {
          include: {
            achievement: {
              select: {
                icon: true,
                name: true,
              },
            },
          },
          take: 3,
          orderBy: {
            unlockedAt: "desc",
          },
        },
        _count: {
          select: {
            links: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { totalProfileViews: "desc" },
      take: 8, // Limit to 8 featured users on homepage
    });

    return NextResponse.json({
      featured: featuredUsers.map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        linkCount: user._count.links,
        achievements: user.achievements.map((ua) => ({
          icon: ua.achievement.icon,
          name: ua.achievement.name,
        })),
      })),
    });
  } catch (error) {
    console.error("Get public featured error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured users" },
      { status: 500 }
    );
  }
}
