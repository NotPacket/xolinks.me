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

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Instagram OAuth not configured" }, { status: 500 });
    }

    const state = randomBytes(32).toString("hex");

    const cookieStore = await cookies();
    cookieStore.set("instagram_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/instagram`,
      scope: "user_profile",
      response_type: "code",
      state,
    });

    return NextResponse.redirect(`https://api.instagram.com/oauth/authorize?${params}`);
  } catch (error) {
    console.error("Instagram connect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
