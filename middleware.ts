import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle /@username URLs - rewrite to /profile/username
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2); // Remove /@
    return NextResponse.rewrite(new URL(`/profile/${username}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
