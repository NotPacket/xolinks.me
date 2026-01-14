import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { z } from "zod";

const verifyLoginSchema = z.object({
  token: z.string().optional(),
  code: z.string().min(6).max(6).optional(),
}).refine((data) => data.token || data.code, {
  message: "Either token or code is required",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = verifyLoginSchema.safeParse(body);
    if (!result.success) {
      console.error("Validation error:", result.error.issues);
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, code } = result.data;
    console.log("Verify login attempt:", { hasToken: !!token, code: code ? `${code.substring(0, 2)}****` : null });

    // Find the login verification record
    let verification;

    if (token) {
      verification = await prisma.loginVerification.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              displayName: true,
              role: true,
            },
          },
        },
      });
      console.log("Token lookup result:", verification ? "found" : "not found");
    } else if (code) {
      // Find the most recent verification with this code that hasn't expired
      verification = await prisma.loginVerification.findFirst({
        where: {
          code: code,
          isVerified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              displayName: true,
              role: true,
            },
          },
        },
      });
      console.log("Code lookup result:", verification ? "found" : "not found");

      // Debug: List all pending verifications if not found
      if (!verification) {
        const pendingVerifications = await prisma.loginVerification.findMany({
          where: {
            isVerified: false,
            expiresAt: { gt: new Date() },
          },
          select: {
            code: true,
            createdAt: true,
            expiresAt: true,
          },
        });
        console.log("Pending verifications:", pendingVerifications.map(v => ({
          code: `${v.code.substring(0, 2)}****`,
          createdAt: v.createdAt,
          expiresAt: v.expiresAt,
        })));
      }
    }

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Check if already verified
    if (verification.isVerified) {
      return NextResponse.json(
        { error: "This verification has already been used." },
        { status: 400 }
      );
    }

    // Check if expired
    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This verification code has expired. Please log in again." },
        { status: 400 }
      );
    }

    // Mark as verified
    await prisma.loginVerification.update({
      where: { id: verification.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Update last login time
    await prisma.user.update({
      where: { id: verification.userId },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    await createSession(verification.userId);

    console.log("Login verified successfully for user:", verification.user.username);

    return NextResponse.json({
      message: "Login verified successfully",
      user: verification.user,
    });
  } catch (error) {
    console.error("Verify login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
