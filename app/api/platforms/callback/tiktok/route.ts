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
      console.error("TikTok OAuth error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=tiktok_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("tiktok_oauth_state")?.value;
    const codeVerifier = cookieStore.get("tiktok_code_verifier")?.value;
    cookieStore.delete("tiktok_oauth_state");
    cookieStore.delete("tiktok_code_verifier");

    if (!storedState || storedState !== state || !codeVerifier) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/tiktok`,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("TikTok token error:", tokenData);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const userData = await userResponse.json();

    if (!userData.data?.user) {
      return NextResponse.redirect(new URL("/dashboard?error=user_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const user = userData.data.user;
    const username = user.username || user.display_name;

    // Save or update platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "tiktok",
        },
      },
      update: {
        platformUserId: user.open_id,
        platformUsername: username,
        profileUrl: `https://tiktok.com/@${username}`,
        displayName: user.display_name || username,
        avatarUrl: user.avatar_url,
        accessToken,
        refreshToken: tokenData.refresh_token,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "tiktok",
        platformUserId: user.open_id,
        platformUsername: username,
        profileUrl: `https://tiktok.com/@${username}`,
        displayName: user.display_name || username,
        avatarUrl: user.avatar_url,
        accessToken,
        refreshToken: tokenData.refresh_token,
      },
    });

    // Create verified link
    const existingLink = await prisma.link.findFirst({
      where: { userId: session.userId, platform: "tiktok" },
    });

    if (!existingLink) {
      const maxOrder = await prisma.link.aggregate({
        where: { userId: session.userId },
        _max: { displayOrder: true },
      });

      const connection = await prisma.platformConnection.findUnique({
        where: { userId_platform: { userId: session.userId, platform: "tiktok" } },
      });

      await prisma.link.create({
        data: {
          userId: session.userId,
          platformConnectionId: connection?.id,
          title: `TikTok - @${username}`,
          url: `https://tiktok.com/@${username}`,
          platform: "tiktok",
          isActive: true,
          isVerified: true,
          displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        },
      });
    } else {
      const connection = await prisma.platformConnection.findUnique({
        where: { userId_platform: { userId: session.userId, platform: "tiktok" } },
      });

      await prisma.link.update({
        where: { id: existingLink.id },
        data: {
          platformConnectionId: connection?.id,
          url: `https://tiktok.com/@${username}`,
          title: `TikTok - @${username}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=tiktok_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("TikTok callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
