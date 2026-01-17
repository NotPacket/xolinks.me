import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { createLinkSchema, reorderLinksSchema } from "@/lib/validation/schemas";
import { getPlatformConfig } from "@/lib/platforms/config";

// GET - Fetch all links for current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: { userId: session.userId },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        title: true,
        url: true,
        platform: true,
        icon: true,
        displayOrder: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new link
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createLinkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check if platform is Pro-only
    if (result.data.platform) {
      const platformConfig = getPlatformConfig(result.data.platform);
      if (platformConfig?.proOnly) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { subscriptionTier: true },
        });

        const isPro = user?.subscriptionTier === "pro" || user?.subscriptionTier === "business";
        if (!isPro) {
          return NextResponse.json(
            { error: `${platformConfig.name} links require a Pro subscription` },
            { status: 403 }
          );
        }
      }
    }

    // Get current max display order
    const maxOrder = await prisma.link.aggregate({
      where: { userId: session.userId },
      _max: { displayOrder: true },
    });

    const link = await prisma.link.create({
      data: {
        userId: session.userId,
        title: result.data.title,
        url: result.data.url,
        platform: result.data.platform,
        icon: result.data.icon,
        displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Reorder links
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = reorderLinksSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Update all links in a transaction
    await prisma.$transaction(
      result.data.links.map((link: { id: string; displayOrder: number }) =>
        prisma.link.updateMany({
          where: { id: link.id, userId: session.userId },
          data: { displayOrder: link.displayOrder },
        })
      )
    );

    return NextResponse.json({ message: "Links reordered successfully" });
  } catch (error) {
    console.error("Reorder links error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
