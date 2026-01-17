import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { PLATFORMS } from "@/lib/platforms/config";

// GET - List all platform connections for current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await prisma.platformConnection.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        platform: true,
        platformUsername: true,
        profileUrl: true,
        displayName: true,
        avatarUrl: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Add platform metadata
    const connectionsWithMeta = connections.map((conn: typeof connections[number]) => ({
      ...conn,
      platformName: PLATFORMS[conn.platform]?.name || conn.platform,
      platformColor: PLATFORMS[conn.platform]?.color || "#666666",
    }));

    // Get user subscription tier for Pro-only platforms
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true },
    });
    const isPro = user?.subscriptionTier === "pro" || user?.subscriptionTier === "business";

    // List available platforms (not yet connected)
    const connectedPlatforms = new Set(connections.map((c: typeof connections[number]) => c.platform));
    const availablePlatforms = Object.entries(PLATFORMS)
      .filter(([id]) => !connectedPlatforms.has(id))
      .map(([id, config]) => ({
        id,
        name: config.name,
        color: config.color,
        oauthSupported: config.oauthSupported,
        proOnly: config.proOnly || false,
      }));

    return NextResponse.json({
      connections: connectionsWithMeta,
      availablePlatforms,
      isPro,
    });
  } catch (error) {
    console.error("Get platforms error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
