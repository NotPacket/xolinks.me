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
      console.error("LinkedIn OAuth error:", error);
      return NextResponse.redirect(new URL("/dashboard?error=linkedin_denied", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_request", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get("linkedin_oauth_state")?.value;
    cookieStore.delete("linkedin_oauth_state");

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid_state", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/linkedin`,
        client_id: process.env.LINKEDIN_CLIENT_ID || "",
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("LinkedIn token error:", tokenData.error, tokenData.error_description);
      return NextResponse.redirect(new URL("/dashboard?error=token_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const accessToken = tokenData.access_token;

    // Get user info using OpenID Connect userinfo endpoint
    const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.sub) {
      console.error("LinkedIn user data error:", userData);
      return NextResponse.redirect(new URL("/dashboard?error=user_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // LinkedIn doesn't provide username in userinfo, use name as display identifier
    const displayName = userData.name || userData.given_name || "LinkedIn User";
    const username = userData.email?.split("@")[0] || `user_${userData.sub.slice(-8)}`;
    const profileUrl = `https://www.linkedin.com/in/${username}`;

    // Save or update platform connection
    await prisma.platformConnection.upsert({
      where: {
        userId_platform: {
          userId: session.userId,
          platform: "linkedin",
        },
      },
      update: {
        platformUserId: userData.sub,
        platformUsername: username,
        profileUrl: profileUrl,
        displayName: displayName,
        avatarUrl: userData.picture || null,
        accessToken,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        platform: "linkedin",
        platformUserId: userData.sub,
        platformUsername: username,
        profileUrl: profileUrl,
        displayName: displayName,
        avatarUrl: userData.picture || null,
        accessToken,
      },
    });

    // Create the verified link automatically
    const existingLink = await prisma.link.findFirst({
      where: {
        userId: session.userId,
        platform: "linkedin",
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
            platform: "linkedin",
          },
        },
      });

      await prisma.link.create({
        data: {
          userId: session.userId,
          platformConnectionId: connection?.id,
          title: `LinkedIn - ${displayName}`,
          url: profileUrl,
          platform: "linkedin",
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
            platform: "linkedin",
          },
        },
      });

      await prisma.link.update({
        where: { id: existingLink.id },
        data: {
          platformConnectionId: connection?.id,
          url: profileUrl,
          title: `LinkedIn - ${displayName}`,
          isVerified: true,
        },
      });
    }

    return NextResponse.redirect(new URL("/dashboard?success=linkedin_connected", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=callback_error", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }
}
