import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get all variants for a link
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: linkId } = await params;

    // Verify link ownership and Pro status
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: session.userId },
      include: {
        user: { select: { subscriptionTier: true } },
        variants: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const isPro = link.user.subscriptionTier === "pro" || link.user.subscriptionTier === "business";
    if (!isPro) {
      return NextResponse.json({ error: "A/B testing is a Pro feature" }, { status: 403 });
    }

    // Calculate stats for each variant
    const variantsWithStats = link.variants.map((variant) => ({
      ...variant,
      clickRate: variant.impressions > 0 ? ((variant.clicks / variant.impressions) * 100).toFixed(2) : "0.00",
    }));

    return NextResponse.json({
      variants: variantsWithStats,
      abTestEnabled: link.abTestEnabled,
    });
  } catch (error) {
    console.error("Get variants error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new variant
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: linkId } = await params;
    const body = await request.json();
    const { name, title, url, weight } = body;

    // Verify link ownership and Pro status
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: session.userId },
      include: {
        user: { select: { subscriptionTier: true } },
        variants: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const isPro = link.user.subscriptionTier === "pro" || link.user.subscriptionTier === "business";
    if (!isPro) {
      return NextResponse.json({ error: "A/B testing is a Pro feature" }, { status: 403 });
    }

    // Limit to 4 variants per link
    if (link.variants.length >= 4) {
      return NextResponse.json({ error: "Maximum 4 variants per link" }, { status: 400 });
    }

    // Validate inputs
    if (!name || name.length > 50) {
      return NextResponse.json({ error: "Variant name is required (max 50 chars)" }, { status: 400 });
    }
    if (!title || title.length > 255) {
      return NextResponse.json({ error: "Title is required (max 255 chars)" }, { status: 400 });
    }
    if (!url || url.length > 2000) {
      return NextResponse.json({ error: "URL is required (max 2000 chars)" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Validate weight
    const variantWeight = weight !== undefined ? Math.min(100, Math.max(0, parseInt(weight))) : 50;

    const variant = await prisma.linkVariant.create({
      data: {
        linkId,
        name,
        title,
        url,
        weight: variantWeight,
      },
    });

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    console.error("Create variant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update A/B test settings for the link
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: linkId } = await params;
    const body = await request.json();
    const { abTestEnabled } = body;

    // Verify link ownership and Pro status
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: session.userId },
      include: {
        user: { select: { subscriptionTier: true } },
        variants: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const isPro = link.user.subscriptionTier === "pro" || link.user.subscriptionTier === "business";
    if (!isPro) {
      return NextResponse.json({ error: "A/B testing is a Pro feature" }, { status: 403 });
    }

    // Need at least 2 variants to enable A/B testing
    if (abTestEnabled && link.variants.length < 2) {
      return NextResponse.json({ error: "Need at least 2 variants to enable A/B testing" }, { status: 400 });
    }

    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: { abTestEnabled: !!abTestEnabled },
    });

    return NextResponse.json({ abTestEnabled: updatedLink.abTestEnabled });
  } catch (error) {
    console.error("Update A/B test settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
