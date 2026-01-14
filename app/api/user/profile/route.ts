import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { THEMES } from "@/lib/themes/config";

// GET - Get current user profile
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        location: true,
        theme: true,
        lastUsernameChange: true,
      },
    });

    // Calculate if username can be changed (once per month)
    let canChangeUsername = true;
    let nextUsernameChangeDate = null;

    if (user?.lastUsernameChange) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      canChangeUsername = user.lastUsernameChange < oneMonthAgo;

      if (!canChangeUsername) {
        const nextChange = new Date(user.lastUsernameChange);
        nextChange.setMonth(nextChange.getMonth() + 1);
        nextUsernameChangeDate = nextChange.toISOString();
      }
    }

    return NextResponse.json({
      user,
      canChangeUsername,
      nextUsernameChangeDate
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, bio, location, theme, username } = body;

    // Validate theme
    if (theme && !THEMES[theme]) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }

    // Validate lengths
    if (displayName && displayName.length > 100) {
      return NextResponse.json({ error: "Display name too long" }, { status: 400 });
    }
    if (bio && bio.length > 500) {
      return NextResponse.json({ error: "Bio too long (max 500 characters)" }, { status: 400 });
    }
    if (location && location.length > 100) {
      return NextResponse.json({ error: "Location too long" }, { status: 400 });
    }

    // Handle username change
    let usernameUpdate = {};
    if (username !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { username: true, lastUsernameChange: true }
      });

      // Check if username is actually changing
      if (currentUser && username !== currentUser.username) {
        // Check if allowed to change (once per month)
        if (currentUser.lastUsernameChange) {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          if (currentUser.lastUsernameChange > oneMonthAgo) {
            const nextChange = new Date(currentUser.lastUsernameChange);
            nextChange.setMonth(nextChange.getMonth() + 1);
            return NextResponse.json({
              error: `You can change your username again on ${nextChange.toLocaleDateString()}`
            }, { status: 400 });
          }
        }

        // Validate username format
        const usernameRegex = /^[a-z0-9_]{3,30}$/;
        if (!usernameRegex.test(username)) {
          return NextResponse.json({
            error: "Username must be 3-30 characters, lowercase letters, numbers, and underscores only"
          }, { status: 400 });
        }

        // Check if username is taken
        const existingUser = await prisma.user.findUnique({
          where: { username }
        });
        if (existingUser) {
          return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }

        // Reserved usernames
        const reserved = ['admin', 'dashboard', 'settings', 'analytics', 'api', 'login', 'register', 'logout', 'help', 'support', 'about', 'terms', 'privacy'];
        if (reserved.includes(username)) {
          return NextResponse.json({ error: "This username is reserved" }, { status: 400 });
        }

        usernameUpdate = {
          username,
          lastUsernameChange: new Date()
        };
      }
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(theme !== undefined && { theme }),
        ...usernameUpdate,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        location: true,
        theme: true,
        lastUsernameChange: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
