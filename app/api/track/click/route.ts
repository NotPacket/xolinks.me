import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST - Track a link click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId } = body;

    if (!linkId) {
      return NextResponse.json({ error: "Link ID required" }, { status: 400 });
    }

    // Get link and user info
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { id: true, userId: true, url: true },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Get request info
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0] || "unknown";

    // Parse device info from user agent
    const deviceType = /mobile/i.test(userAgent) ? "mobile" : /tablet/i.test(userAgent) ? "tablet" : "desktop";
    const browser = getBrowser(userAgent);
    const os = getOS(userAgent);

    // Record the click
    await prisma.linkClick.create({
      data: {
        linkId: link.id,
        userId: link.userId,
        ipAddress: ip.substring(0, 45),
        userAgent: userAgent.substring(0, 500),
        referrer: referer.substring(0, 500),
        deviceType,
        browser,
        os,
      },
    });

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.linkClickDaily.upsert({
      where: {
        linkId_date: {
          linkId: link.id,
          date: today,
        },
      },
      update: {
        totalClicks: { increment: 1 },
      },
      create: {
        linkId: link.id,
        userId: link.userId,
        date: today,
        totalClicks: 1,
        uniqueClicks: 1,
      },
    });

    return NextResponse.json({ success: true, url: link.url });
  } catch (error) {
    console.error("Track click error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getBrowser(ua: string): string {
  if (/firefox/i.test(ua)) return "Firefox";
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/opera|opr/i.test(ua)) return "Opera";
  return "Other";
}

function getOS(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  return "Other";
}
