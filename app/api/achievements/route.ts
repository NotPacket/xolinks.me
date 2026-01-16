import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getAllAchievementsWithProgress } from "@/lib/achievements";

// GET - Get all achievements (with progress if authenticated)
export async function GET() {
  try {
    const session = await getSession();

    if (session) {
      // Return achievements with user's progress
      const achievements = await getAllAchievementsWithProgress(session.userId);
      return NextResponse.json({ achievements });
    }

    // Return all achievements without progress for unauthenticated users
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { requirement: "asc" }],
    });

    return NextResponse.json({
      achievements: achievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        requirement: a.requirement,
        unlocked: false,
        unlockedAt: null,
      })),
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
