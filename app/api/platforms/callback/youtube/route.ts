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
      console.error("YouTube OAuth error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=youtube_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("youtube_oauth_state")?.value;
    cookieStore.delete("youtube_oauth_state");

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID!,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/youtube`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("YouTube token error:", tokenData);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;

    // Get YouTube channel info
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const channelData = await channelResponse.json();

    if (!channelData.items?.[0]) {
      return NextResponse.redirect(new URL("/dashboard?error=no_channel", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const channel = channelData.items[0];
    const channelId = channel.id;
    const customUrl = channel.snippet.customUrl;
    const channelTitle = channel.snippet.title;
    const thumbnailUrl = channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url;

    const profileUrl = customUrl
      ? `https://youtube.com/${customUrl}`
      : `https://youtube.com/channel/${channelId}`;

    // Save or update platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "youtube",
        },
      },
      update: {
        platformUserId: channelId,
        platformUsername: customUrl || channelId,
        profileUrl,
        displayName: channelTitle,
        avatarUrl: thumbnailUrl,
        accessToken,
        refreshToken: tokenData.refresh_token,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "youtube",
        platformUserId: channelId,
        platformUsername: customUrl || channelId,
        profileUrl,
        displayName: channelTitle,
        avatarUrl: thumbnailUrl,
        accessToken,
        refreshToken: tokenData.refresh_token,
      },
    });

    // Create verified link
    const existingLink = await prisma.link.findFirst({
      where: { userId: session.userId, platform: "youtube" },
    });

    if (!existingLink) {
      const maxOrder = await prisma.link.aggregate({
        where: { userId: session.userId },
        _max: { displayOrder: true },
      });

      const connection = await prisma.platformConnection.findUnique({
        where: { userId_platform: { userId: session.userId, platform: "youtube" } },
      });

      await prisma.link.create({
        data: {
          userId: session.userId,
          platformConnectionId: connection?.id,
          title: `YouTube - ${channelTitle}`,
          url: profileUrl,
          platform: "youtube",
          isActive: true,
          isVerified: true,
          displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        },
      });
    } else {
      const connection = await prisma.platformConnection.findUnique({
        where: { userId_platform: { userId: session.userId, platform: "youtube" } },
      });

      await prisma.link.update({
        where: { id: existingLink.id },
        data: {
          platformConnectionId: connection?.id,
          url: profileUrl,
          title: `YouTube - ${channelTitle}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=youtube_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("YouTube callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
