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

    return NextResponse.json({ profile: user });
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
