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
    const totalViews = profileViews.reduce((sum, v) => sum + v.totalViews, 0);
    const totalClicks = linkClicks.reduce((sum, c) => sum + c.totalClicks, 0);

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
    const linkIds = linkStats.map((s) => s.linkId);
    const links = await prisma.link.findMany({
      where: { id: { in: linkIds } },
      select: { id: true, title: true, url: true, platform: true },
    });

    const linkStatsWithDetails = linkStats.map((stat) => {
      const link = links.find((l) => l.id === stat.linkId);
      return {
        linkId: stat.linkId,
        title: link?.title || "Unknown",
        url: link?.url || "",
        platform: link?.platform,
        clicks: stat._sum.totalClicks || 0,
      };
    }).sort((a, b) => b.clicks - a.clicks);

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
    profileViews.forEach((v) => {
      const dateStr = v.date.toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].views = v.totalViews;
      }
    });

    // Fill in clicks
    linkClicks.forEach((c) => {
      const dateStr = c.date.toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].clicks += c.totalClicks;
      }
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      views: data.views,
      clicks: data.clicks,
    }));

    return NextResponse.json({
      summary: {
        totalViews,
        totalClicks,
        clickRate: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0",
      },
      chartData,
      linkStats: linkStatsWithDetails,
      deviceStats: deviceStats.map((d) => ({
        device: d.deviceType || "Unknown",
        count: d._count,
      })),
      browserStats: browserStats.map((b) => ({
        browser: b.browser || "Unknown",
        count: b._count,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
