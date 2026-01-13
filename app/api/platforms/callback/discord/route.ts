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
      return NextResponse.redirect(new URL("/dashboard?error=discord_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("discord_oauth_state")?.value;
    cookieStore.delete("discord_oauth_state");

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/discord`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Discord token error:", tokenData.error);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.id || !userData.username) {
      return NextResponse.redirect(new URL("/dashboard?error=user_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Discord profile URL (to their user page)
    const profileUrl = `https://discord.com/users/${userData.id}`;
    const avatarUrl = userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : null;

    // Save platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "discord",
        },
      },
      update: {
        platformUserId: userData.id,
        platformUsername: userData.username,
        profileUrl,
        displayName: userData.global_name || userData.username,
        avatarUrl,
        accessToken,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "discord",
        platformUserId: userData.id,
        platformUsername: userData.username,
        profileUrl,
        displayName: userData.global_name || userData.username,
        avatarUrl,
        accessToken,
      },
    });

    // Create verified link
    const existingLink = await prisma.link.findFirst({
      where: { userId: session.userId, platform: "discord" },
    });

    const connection = await prisma.platformConnection.findUnique({
      where: { userId_platform: { userId: session.userId, platform: "discord" } },
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
          title: `Discord - ${userData.username}`,
          url: profileUrl,
          platform: "discord",
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
          title: `Discord - ${userData.username}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=discord_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Discord callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
