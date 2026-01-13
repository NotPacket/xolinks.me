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
      console.error("GitHub OAuth error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=github_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get("github_oauth_state")?.value;
    cookieStore.delete("github_oauth_state");

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;

    // Get user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const userData = await userResponse.json();

    if (!userData.id || !userData.login) {
      return NextResponse.redirect(new URL("/dashboard?error=user_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Save or update platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "github",
        },
      },
      update: {
        platformUserId: String(userData.id),
        platformUsername: userData.login,
        profileUrl: userData.html_url,
        displayName: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        accessToken,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "github",
        platformUserId: String(userData.id),
        platformUsername: userData.login,
        profileUrl: userData.html_url,
        displayName: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        accessToken,
      },
    });

    // Create the verified link automatically
    const existingLink = await prisma.link.findFirst({
      where: {
        userId: session.userId,
        platform: "github",
      },
    });

    if (!existingLink) {
      // Get max display order
      const maxOrder = await prisma.link.aggregate({
        where: { userId: session.userId },
        _max: { displayOrder: true },
      });

      // Get the platform connection we just created
      const connection = await prisma.platformConnection.findUnique({
        where: {
          userId_platform: {
            userId: session.userId,
            platform: "github",
          },
        },
      });

      await prisma.link.create({
        data: {
          userId: session.userId,
          platformConnectionId: connection?.id,
          title: `GitHub - ${userData.login}`,
          url: userData.html_url,
          platform: "github",
          isActive: true,
          isVerified: true,
          displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
        },
      });
    } else {
      // Update existing link to be verified
      const connection = await prisma.platformConnection.findUnique({
        where: {
          userId_platform: {
            userId: session.userId,
            platform: "github",
          },
        },
      });

      await prisma.link.update({
        where: { id: existingLink.id },
        data: {
          platformConnectionId: connection?.id,
          url: userData.html_url,
          title: `GitHub - ${userData.login}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=github_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("GitHub callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
