import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { z } from "zod";

const verifyLoginSchema = z.object({
  token: z.string().optional(),
  code: z.string().min(6).max(6).optional(),
  email: z.string().email().optional(),
}).refine((data) => data.token || (data.code && data.email), {
  message: "Either token, or code with email is required",
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

    const { token, code, email } = result.data;
    console.log("Verify login attempt:", { hasToken: !!token, code: code ? `${code.substring(0, 2)}****` : null, email: email ? `${email.substring(0, 3)}***` : null });

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
    } else if (code && email) {
      // First find the user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });

      if (!user) {
        console.log("User not found for email");
        return NextResponse.json(
          { error: "Invalid or expired verification code." },
          { status: 400 }
        );
      }

      // Find the verification for this specific user with this code
      verification = await prisma.loginVerification.findFirst({
        where: {
          userId: user.id,
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
      console.log("Code lookup result for user:", verification ? "found" : "not found");

      // Debug: List pending verification for this user if not found
      if (!verification) {
        const pendingVerification = await prisma.loginVerification.findFirst({
          where: {
            userId: user.id,
            isVerified: false,
            expiresAt: { gt: new Date() },
          },
          select: {
            code: true,
            createdAt: true,
            expiresAt: true,
          },
        });
        if (pendingVerification) {
          console.log("User's pending verification:", {
            code: `${pendingVerification.code.substring(0, 2)}****`,
            createdAt: pendingVerification.createdAt,
            expiresAt: pendingVerification.expiresAt,
          });
        } else {
          console.log("No pending verification found for user");
        }
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
