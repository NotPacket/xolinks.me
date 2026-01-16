import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const updateThemeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  backgroundColor: z.string().min(4).max(50).optional(),
  textColor: z.string().min(4).max(50).optional(),
  buttonColor: z.string().min(4).max(50).optional(),
  buttonTextColor: z.string().min(4).max(50).optional(),
  accentColor: z.string().min(4).max(50).optional().nullable(),
  fontFamily: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific theme
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const theme = await prisma.customTheme.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error("Get theme error:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

// PUT - Update a theme
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateThemeSchema.parse(body);

    // Check theme ownership
    const existingTheme = await prisma.customTheme.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // If setting this theme as active, deactivate others
    if (validatedData.isActive) {
      await prisma.customTheme.updateMany({
        where: {
          userId: session.userId,
          id: { not: id },
        },
        data: { isActive: false },
      });

      // Also update the user's theme to "custom"
      await prisma.user.update({
        where: { id: session.userId },
        data: { theme: `custom:${id}` },
      });
    }

    const theme = await prisma.customTheme.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ theme });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid theme data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Update theme error:", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a theme
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check theme ownership
    const existingTheme = await prisma.customTheme.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // If this was the active theme, reset user's theme to default
    if (existingTheme.isActive) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { theme: "space" },
      });
    }

    await prisma.customTheme.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete theme error:", error);
    return NextResponse.json(
      { error: "Failed to delete theme" },
      { status: 500 }
    );
  }
}
