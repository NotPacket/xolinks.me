import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    if (!clientKey) {
      return NextResponse.json({ error: "TikTok OAuth not configured" }, { status: 500 });
    }

    const state = randomBytes(32).toString("hex");

    // PKCE for TikTok
    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

    const cookieStore = await cookies();
    cookieStore.set("tiktok_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
    cookieStore.set("tiktok_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    const params = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/tiktok`,
      response_type: "code",
      scope: "user.info.basic",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return NextResponse.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`);
  } catch (error) {
    console.error("TikTok connect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
