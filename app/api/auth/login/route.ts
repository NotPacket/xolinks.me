import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { loginSchema } from "@/lib/validation/schemas";
import { randomBytes, randomInt } from "crypto";
import { sendLoginVerificationEmail } from "@/lib/email";

function parseUserAgent(userAgent: string | null) {
  if (!userAgent) return { browser: "Unknown", deviceType: "Unknown" };

  let browser = "Unknown";
  let deviceType = "Desktop";

  // Detect browser
  if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Edg")) {
    browser = "Microsoft Edge";
  } else if (userAgent.includes("Chrome")) {
    browser = "Chrome";
  } else if (userAgent.includes("Safari")) {
    browser = "Safari";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browser = "Opera";
  }

  // Detect device type
  if (userAgent.includes("Mobile") || userAgent.includes("Android")) {
    deviceType = "Mobile";
  } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
    deviceType = "Tablet";
  }

  return { browser, deviceType };
}

function generateCode(): string {
  // Generate a cryptographically secure 6-digit numeric code
  return randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        passwordHash: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is suspended
    if (user.role === "suspended") {
      return NextResponse.json(
        { error: "Account suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email address first." },
        { status: 403 }
      );
    }

    // Get device info
    const userAgent = request.headers.get("user-agent");
    const { browser, deviceType } = parseUserAgent(userAgent);

    // Get IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown";

    // Delete any existing unverified login verifications for this user
    await prisma.loginVerification.deleteMany({
      where: {
        userId: user.id,
        isVerified: false,
      },
    });

    // Generate verification token and code
    const token = randomBytes(32).toString("hex");
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Generated login verification:", {
      userId: user.id,
      code: `${code.substring(0, 2)}****`,
      expiresAt,
    });

    // Create login verification record
    const verification = await prisma.loginVerification.create({
      data: {
        userId: user.id,
        token,
        code,
        ipAddress,
        userAgent: userAgent || undefined,
        deviceType,
        browser,
        expiresAt,
      },
    });

    console.log("Saved verification to database:", {
      id: verification.id,
      code: `${verification.code.substring(0, 2)}****`,
    });

    // Send verification email
    const emailResult = await sendLoginVerificationEmail(
      user.email,
      token,
      code,
      {
        browser,
        deviceType,
        ipAddress,
      }
    );

    if (!emailResult.success) {
      console.error("Failed to send login verification email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      requiresVerification: true,
      message: "Please check your email for a verification code.",
      email: email, // Full email for verification
      maskedEmail: email.replace(/(.{2})(.*)(@.*)/, "$1***$3"), // Masked for display
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
