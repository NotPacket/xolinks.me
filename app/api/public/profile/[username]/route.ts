import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Remove @ if present
    const cleanUsername = username.replace("@", "").toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        theme: true,
        links: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            title: true,
            url: true,
            platform: true,
            icon: true,
          },
        },
        achievements: {
          where: { displayOnProfile: true },
          orderBy: { unlockedAt: "desc" },
          include: {
            achievement: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Track profile view (fire and forget)
    trackProfileView(user.id).catch(console.error);

    // Format achievements for response
    const achievements = user.achievements.map((ua) => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category,
      unlockedAt: ua.unlockedAt,
    }));

    return NextResponse.json({
      profile: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
        links: user.links,
        achievements,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function trackProfileView(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.profileView.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      totalViews: { increment: 1 },
    },
    create: {
      userId,
      date: today,
      totalViews: 1,
      uniqueViews: 1,
    },
  });
}
