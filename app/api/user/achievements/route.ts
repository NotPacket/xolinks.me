import { NextResponse } from "next/server";
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

    // Group achievements by category
    const categories: Record<string, typeof allAchievements> = {};
    for (const achievement of allAchievements) {
      if (!categories[achievement.category]) {
        categories[achievement.category] = [];
      }
      categories[achievement.category].push(achievement);
    }

    return NextResponse.json({
      unlocked: unlockedAchievements,
      all: allAchievements,
      byCategory: categories,
      stats: {
        total: allAchievements.length,
        unlocked: unlockedAchievements.length,
        percentage: Math.round(
          (unlockedAchievements.length / allAchievements.length) * 100
        ),
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
