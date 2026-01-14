import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, username: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, you will receive a password reset link.",
      });
    }

    // Check for existing tokens and rate limit (1 email per 5 minutes)
    const existingToken = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        type: "password_reset",
        createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
      },
    });

    if (existingToken) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, you will receive a password reset link.",
      });
    }

    // Delete any existing password reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: "password_reset",
      },
    });

    // Generate new token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: "password_reset",
        expiresAt,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
