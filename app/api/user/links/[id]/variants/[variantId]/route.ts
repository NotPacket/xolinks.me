import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string; variantId: string }>;
}

// PUT - Update a variant
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: linkId, variantId } = await params;
    const body = await request.json();
    const { name, title, url, weight, isActive } = body;

    // Verify link ownership and Pro status
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: session.userId },
      include: {
        user: { select: { subscriptionTier: true } },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const isPro = link.user.subscriptionTier === "pro" || link.user.subscriptionTier === "business";
    if (!isPro) {
      return NextResponse.json({ error: "A/B testing is a Pro feature" }, { status: 403 });
    }

    // Verify variant exists for this link
    const variant = await prisma.linkVariant.findFirst({
      where: { id: variantId, linkId },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Validate inputs if provided
    if (name !== undefined && (name.length === 0 || name.length > 50)) {
      return NextResponse.json({ error: "Variant name must be 1-50 chars" }, { status: 400 });
    }
    if (title !== undefined && (title.length === 0 || title.length > 255)) {
      return NextResponse.json({ error: "Title must be 1-255 chars" }, { status: 400 });
    }
    if (url !== undefined) {
      if (url.length === 0 || url.length > 2000) {
        return NextResponse.json({ error: "URL must be 1-2000 chars" }, { status: 400 });
      }
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
      }
    }

    const updatedVariant = await prisma.linkVariant.update({
      where: { id: variantId },
      data: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(weight !== undefined && { weight: Math.min(100, Math.max(0, parseInt(weight))) }),
        ...(isActive !== undefined && { isActive: !!isActive }),
      },
    });

    return NextResponse.json({ variant: updatedVariant });
  } catch (error) {
    console.error("Update variant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a variant
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: linkId, variantId } = await params;

    // Verify link ownership
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

    // Verify variant exists for this link
    const variant = link.variants.find((v) => v.id === variantId);
    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Delete the variant
    await prisma.linkVariant.delete({
      where: { id: variantId },
    });

    // If less than 2 variants remain, disable A/B testing
    if (link.variants.length <= 2) {
      await prisma.link.update({
        where: { id: linkId },
        data: { abTestEnabled: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete variant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
