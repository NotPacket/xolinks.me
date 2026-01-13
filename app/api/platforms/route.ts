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
    const connectionsWithMeta = connections.map((conn) => ({
      ...conn,
      platformName: PLATFORMS[conn.platform]?.name || conn.platform,
      platformColor: PLATFORMS[conn.platform]?.color || "#666666",
    }));

    // List available platforms (not yet connected)
    const connectedPlatforms = new Set(connections.map((c) => c.platform));
    const availablePlatforms = Object.entries(PLATFORMS)
      .filter(([id]) => !connectedPlatforms.has(id))
      .map(([id, config]) => ({
        id,
        name: config.name,
        color: config.color,
        oauthSupported: config.oauthSupported,
      }));

    return NextResponse.json({
      connections: connectionsWithMeta,
      availablePlatforms,
    });
  } catch (error) {
    console.error("Get platforms error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
