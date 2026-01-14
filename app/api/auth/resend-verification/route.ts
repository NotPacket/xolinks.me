import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, username: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Check for existing tokens and rate limit (1 email per 2 minutes)
    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        type: "email_verification",
        createdAt: { gt: new Date(Date.now() - 2 * 60 * 1000) }, // Last 2 minutes
      },
    });

    if (existingToken) {
      return NextResponse.json(
        { error: "Please wait 2 minutes before requesting another verification email" },
        { status: 429 }
      );
    }

    // Delete any existing verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: "email_verification",
      },
    });

    // Generate new token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to database
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: "email_verification",
        expiresAt,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, token, user.username);

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent! Check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
