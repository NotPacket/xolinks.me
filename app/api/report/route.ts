import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, reason, description } = body;

    if (!username || !reason) {
      return NextResponse.json({ error: "Username and reason are required" }, { status: 400 });
    }

    // Find the user being reported
    const reportedUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    if (!reportedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the moderation flag (report)
    await prisma.moderationFlag.create({
      data: {
        userId: reportedUser.id,
        reason: reason,
        description: description || null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, message: "Report submitted successfully" });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
