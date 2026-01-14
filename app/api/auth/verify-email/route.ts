import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Check if token is expired (24 hours)
    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
      return NextResponse.json({ error: "Token has expired. Please request a new verification email." }, { status: 400 });
    }

    // Check if it's an email verification token
    if (verificationToken.type !== "email_verification") {
      return NextResponse.json({ error: "Invalid token type" }, { status: 400 });
    }

    // Update user's email verified status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

// GET endpoint for when users click the link
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }

  // Find the verification token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired_token", request.url));
  }

  if (verificationToken.type !== "email_verification") {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }

  // Update user's email verified status
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: true },
  });

  // Delete the used token
  await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

  // Redirect to dashboard with success message
  return NextResponse.redirect(new URL("/dashboard?verified=true", request.url));
}
