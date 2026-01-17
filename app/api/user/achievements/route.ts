import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getUserAchievements, getAllAchievementsWithProgress } from "@/lib/achievements";

// GET - Get current user's achievements
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unlockedAchievements = await getUserAchievements(session.userId);
    const allAchievements = await getAllAchievementsWithProgress(session.userId);

    // Get display preferences for unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.userId },
      select: {
        achievementId: true,
        displayOnProfile: true,
        unlockedAt: true,
      },
    });

    // Create a map of achievement display preferences
    const displayPrefs = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.displayOnProfile])
    );

    // Add display preference to unlocked achievements
    const unlockedWithDisplay = unlockedAchievements.map((a) => ({
      ...a,
      displayOnProfile: displayPrefs.get(a.id) ?? true,
    }));

    // Add display preference to all achievements and rename unlocked to isUnlocked for frontend
    const allWithDisplay = allAchievements.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category,
      requirement: a.requirement,
      isUnlocked: a.unlocked,
      unlockedAt: a.unlockedAt,
      displayOnProfile: a.unlocked ? (displayPrefs.get(a.id) ?? true) : false,
    }));

    // Group achievements by category
    const categories: Record<string, typeof allWithDisplay> = {};
    for (const achievement of allWithDisplay) {
      if (!categories[achievement.category]) {
        categories[achievement.category] = [];
      }
      categories[achievement.category].push(achievement);
    }

    return NextResponse.json({
      unlocked: unlockedWithDisplay,
      all: allWithDisplay,
      byCategory: categories,
      stats: {
        total: allAchievements.length,
        unlocked: unlockedAchievements.length,
        percentage: allAchievements.length > 0
          ? Math.round((unlockedAchievements.length / allAchievements.length) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error("Get user achievements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

// PUT - Toggle achievement display on profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { achievementId, displayOnProfile } = await request.json();

    if (!achievementId || typeof displayOnProfile !== "boolean") {
      return NextResponse.json(
        { error: "Achievement ID and displayOnProfile are required" },
        { status: 400 }
      );
    }

    // Find the user's achievement
    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: session.userId,
          achievementId,
        },
      },
    });

    if (!userAchievement) {
      return NextResponse.json(
        { error: "Achievement not found or not unlocked" },
        { status: 404 }
      );
    }

    // Update the display preference
    const updated = await prisma.userAchievement.update({
      where: { id: userAchievement.id },
      data: { displayOnProfile },
      include: {
        achievement: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      achievement: {
        id: updated.achievement.id,
        name: updated.achievement.name,
        icon: updated.achievement.icon,
        displayOnProfile: updated.displayOnProfile,
      },
    });
  } catch (error) {
    console.error("Toggle achievement display error:", error);
    return NextResponse.json(
      { error: "Failed to update achievement display" },
      { status: 500 }
    );
  }
}
