import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

// GET - Get analytics for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get profile views
    const profileViews = await prisma.profileView.findMany({
      where: {
        userId: session.userId,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // Get link clicks by day
    const linkClicks = await prisma.linkClickDaily.findMany({
      where: {
        userId: session.userId,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // Get total stats
    let totalViews = 0;
    for (const v of profileViews) {
      totalViews += v.totalViews;
    }

    let totalClicks = 0;
    for (const c of linkClicks) {
      totalClicks += c.totalClicks;
    }

    // Get clicks per link
    const linkStats = await prisma.linkClickDaily.groupBy({
      by: ["linkId"],
      where: {
        userId: session.userId,
        date: { gte: startDate },
      },
      _sum: {
        totalClicks: true,
      },
    });

    // Get link details for stats
    const linkIds: string[] = [];
    for (const s of linkStats) {
      linkIds.push(s.linkId);
    }

    const links = await prisma.link.findMany({
      where: { id: { in: linkIds } },
      select: { id: true, title: true, url: true, platform: true },
    });

    const linkStatsWithDetails: Array<{
      linkId: string;
      title: string;
      url: string;
      platform: string | null;
      clicks: number;
    }> = [];

    for (const stat of linkStats) {
      const link = links.find((l) => l.id === stat.linkId);
      linkStatsWithDetails.push({
        linkId: stat.linkId,
        title: link?.title || "Unknown",
        url: link?.url || "",
        platform: link?.platform || null,
        clicks: stat._sum.totalClicks || 0,
      });
    }

    linkStatsWithDetails.sort((a, b) => b.clicks - a.clicks);

    // Get device breakdown
    const deviceStats = await prisma.linkClick.groupBy({
      by: ["deviceType"],
      where: {
        userId: session.userId,
        clickedAt: { gte: startDate },
      },
      _count: true,
    });

    // Get browser breakdown
    const browserStats = await prisma.linkClick.groupBy({
      by: ["browser"],
      where: {
        userId: session.userId,
        clickedAt: { gte: startDate },
      },
      _count: true,
    });

    // Format daily data for charts
    const dailyData: Record<string, { views: number; clicks: number }> = {};

    // Initialize all days
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = { views: 0, clicks: 0 };
    }

    // Fill in views
    for (const v of profileViews) {
      const dateStr = v.date.toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].views = v.totalViews;
      }
    }

    // Fill in clicks
    for (const c of linkClicks) {
      const dateStr = c.date.toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].clicks += c.totalClicks;
      }
    }

    const chartData: Array<{ date: string; views: number; clicks: number }> = [];
    for (const [date, data] of Object.entries(dailyData)) {
      chartData.push({
        date,
        views: data.views,
        clicks: data.clicks,
      });
    }

    const deviceStatsFormatted: Array<{ device: string; count: number }> = [];
    for (const d of deviceStats) {
      deviceStatsFormatted.push({
        device: d.deviceType || "Unknown",
        count: d._count,
      });
    }

    const browserStatsFormatted: Array<{ browser: string; count: number }> = [];
    for (const b of browserStats) {
      browserStatsFormatted.push({
        browser: b.browser || "Unknown",
        count: b._count,
      });
    }

    return NextResponse.json({
      summary: {
        totalViews,
        totalClicks,
        clickRate: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0",
      },
      chartData,
      linkStats: linkStatsWithDetails,
      deviceStats: deviceStatsFormatted,
      browserStats: browserStatsFormatted,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
