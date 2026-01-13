import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 });
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString("hex");

    // Store state in cookie
    const cookieStore = await cookies();
    cookieStore.set("github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/github`,
      scope: "read:user",
      state,
    });

    return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
  } catch (error) {
    console.error("GitHub connect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
