import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const createThemeSchema = z.object({
  name: z.string().min(1).max(100),
  backgroundColor: z.string().min(4).max(50),
  textColor: z.string().min(4).max(50),
  buttonColor: z.string().min(4).max(50),
  buttonTextColor: z.string().min(4).max(50),
  accentColor: z.string().min(4).max(50).optional(),
  fontFamily: z.string().max(100).optional(),
});

// GET - Get user's custom themes
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const themes = await prisma.customTheme.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error("Get themes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

// POST - Create a new custom theme
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createThemeSchema.parse(body);

    // Limit custom themes per user (e.g., 10 for free users)
    const existingThemes = await prisma.customTheme.count({
      where: { userId: session.userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionTier: true },
    });

    const maxThemes = user?.subscriptionTier === "pro" ? 50 : 5;

    if (existingThemes >= maxThemes) {
      return NextResponse.json(
        {
          error: `Maximum ${maxThemes} custom themes allowed. ${user?.subscriptionTier !== "pro" ? "Upgrade to Pro for more!" : ""}`,
        },
        { status: 400 }
      );
    }

    const theme = await prisma.customTheme.create({
      data: {
        userId: session.userId,
        ...validatedData,
      },
    });

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid theme data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Create theme error:", error);
    return NextResponse.json(
      { error: "Failed to create theme" },
      { status: 500 }
    );
  }
}
