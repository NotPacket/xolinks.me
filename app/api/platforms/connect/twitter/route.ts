import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";

// Twitter OAuth 2.0 with PKCE
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "Twitter OAuth not configured" }, { status: 500 });
    }

    const state = randomBytes(32).toString("hex");

    // PKCE: Generate code verifier and challenge
    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

    const cookieStore = await cookies();
    cookieStore.set("twitter_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });
    cookieStore.set("twitter_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/platforms/callback/twitter`,
      scope: "tweet.read users.read offline.access",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return NextResponse.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
  } catch (error) {
    console.error("Twitter connect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
