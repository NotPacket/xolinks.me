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
      return NextResponse.redirect(new URL("/dashboard?error=twitch_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("twitch_oauth_state")?.value;
    cookieStore.delete("twitch_oauth_state");

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/twitch`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Twitch token error:", tokenData.error);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;

    // Get user info from Twitch
    const userResponse = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID!,
      },
    });

    const userData = await userResponse.json();
    const user = userData.data?.[0];

    if (!user?.id || !user?.login) {
      return NextResponse.redirect(new URL("/dashboard?error=user_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const profileUrl = `https://twitch.tv/${user.login}`;

    // Save platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "twitch",
        },
      },
      update: {
        platformUserId: user.id,
        platformUsername: user.login,
        profileUrl,
        displayName: user.display_name || user.login,
        avatarUrl: user.profile_image_url,
        accessToken,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "twitch",
        platformUserId: user.id,
        platformUsername: user.login,
        profileUrl,
        displayName: user.display_name || user.login,
        avatarUrl: user.profile_image_url,
        accessToken,
      },
    });

    // Create verified link
    const existingLink = await prisma.link.findFirst({
      where: { userId: session.userId, platform: "twitch" },
    });

    const connection = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId: session.userId, platform: "twitch" } },
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
          title: `Twitch - ${user.display_name || user.login}`,
          url: profileUrl,
          platform: "twitch",
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
          title: `Twitch - ${user.display_name || user.login}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=twitch_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Twitch callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
