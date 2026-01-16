import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkAndAwardAchievements } from "@/lib/achievements";

// POST - Check and award achievements for current user
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await checkAndAwardAchievements(session.userId);

    if (result.awarded.length > 0) {
      return NextResponse.json({
        message: `Congratulations! You earned ${result.awarded.length} new achievement(s)`,
        newAchievements: result.awarded,
      });
    }

    return NextResponse.json({
      message: "No new achievements unlocked",
      newAchievements: [],
    });
  } catch (error) {
    console.error("Check achievements error:", error);
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    );
  }
}
