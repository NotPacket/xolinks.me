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
      return NextResponse.redirect(new URL("/dashboard?error=spotify_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("spotify_oauth_state")?.value;
    cookieStore.delete("spotify_oauth_state");

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/spotify`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Spotify token error:", tokenData.error);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;

    // Get user info from Spotify
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.id) {
      return NextResponse.redirect(new URL("/dashboard?error=user_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const profileUrl = userData.external_urls?.spotify || `https://open.spotify.com/user/${userData.id}`;
    const avatarUrl = userData.images?.[0]?.url || null;

    // Save platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "spotify",
        },
      },
      update: {
        platformUserId: userData.id,
        platformUsername: userData.id,
        profileUrl,
        displayName: userData.display_name || userData.id,
        avatarUrl,
        accessToken,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "spotify",
        platformUserId: userData.id,
        platformUsername: userData.id,
        profileUrl,
        displayName: userData.display_name || userData.id,
        avatarUrl,
        accessToken,
      },
    });

    // Create verified link
    const existingLink = await prisma.link.findFirst({
      where: { userId: session.userId, platform: "spotify" },
    });

    const connection = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId: session.userId, platform: "spotify" } },
    });

    if (!existingLink) {
      const maxOrder = await prisma.link.aggregate({
        where: { userId: session.userId },
        _max: { displayOrder: true },
      });

      await prisma.link.create({
        data: {
          userId: session.userId,
          platformConnectionId: connection?.id,
          title: `Spotify - ${userData.display_name || userData.id}`,
          url: profileUrl,
          platform: "spotify",
          isActive: true,
          isVerified: true,
          displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        },
      });
    } else {
      await prisma.link.update({
        where: { id: existingLink.id },
        data: {
          platformConnectionId: connection?.id,
          url: profileUrl,
          title: `Spotify - ${userData.display_name || userData.id}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=spotify_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Spotify callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
