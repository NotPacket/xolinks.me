import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Instagram OAuth error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=instagram_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("instagram_oauth_state")?.value;
    cookieStore.delete("instagram_oauth_state");

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/instagram`,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error_message) {
      console.error("Instagram token error:", tokenData);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/${userId}?fields=id,username&access_token=${accessToken}`
    );

    const userData = await userResponse.json();

    if (!userData.id || !userData.username) {
      return NextResponse.redirect(new URL("/dashboard?error=user_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Save or update platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "instagram",
        },
      },
      update: {
        platformUserId: String(userData.id),
        platformUsername: userData.username,
        profileUrl: `https://instagram.com/${userData.username}`,
        displayName: userData.username,
        accessToken,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "instagram",
        platformUserId: String(userData.id),
        platformUsername: userData.username,
        profileUrl: `https://instagram.com/${userData.username}`,
        displayName: userData.username,
        accessToken,
      },
    });

    // Create verified link
    const existingLink = await prisma.link.findFirst({
      where: { userId: session.userId, platform: "instagram" },
    });

    if (!existingLink) {
      const maxOrder = await prisma.link.aggregate({
        where: { userId: session.userId },
        _max: { displayOrder: true },
      });

      const connection = await prisma.platformConnection.findUnique({
        where: { userId_platform: { userId: session.userId, platform: "instagram" } },
      });

      await prisma.link.create({
        data: {
          userId: session.userId,
          platformConnectionId: connection?.id,
          title: `Instagram - @${userData.username}`,
          url: `https://instagram.com/${userData.username}`,
          platform: "instagram",
          isActive: true,
          isVerified: true,
          displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        },
      });
    } else {
      const connection = await prisma.platformConnection.findUnique({
        where: { userId_platform: { userId: session.userId, platform: "instagram" } },
      });

      await prisma.link.update({
        where: { id: existingLink.id },
        data: {
          platformConnectionId: connection?.id,
          url: `https://instagram.com/${userData.username}`,
          title: `Instagram - @${userData.username}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=instagram_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Instagram callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
