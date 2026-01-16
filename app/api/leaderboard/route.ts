import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "views"; // views, clicks
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const orderBy =
      sortBy === "clicks"
        ? { totalLinkClicks: "desc" as const }
        : { totalProfileViews: "desc" as const };

    const users = await prisma.user.findMany({
      where: {
        // Only show users with public profiles (verified email and at least one active link)
        emailVerified: true,
        links: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        totalProfileViews: true,
        totalLinkClicks: true,
        createdAt: true,
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
      orderBy,
      take: limit,
    });

    // Format the response
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      totalProfileViews: user.totalProfileViews,
      totalLinkClicks: user.totalLinkClicks,
      linkCount: user._count.links,
      topAchievements: user.achievements.map((ua) => ({
        icon: ua.achievement.icon,
        name: ua.achievement.name,
      })),
      joinedAt: user.createdAt,
    }));

    return NextResponse.json({
      leaderboard,
      sortBy,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
