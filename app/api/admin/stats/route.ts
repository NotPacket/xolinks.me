import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  // Get overall stats
  const [
    totalUsers,
    totalLinks,
    totalClicks,
    totalViews,
    newUsersToday,
    newUsersThisWeek,
    activeUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.link.count(),
    prisma.linkClick.count(),
    prisma.profileView.aggregate({ _sum: { totalViews: true } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  // Get recent signups
  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      createdAt: true,
      role: true,
      _count: {
        select: {
          links: true,
          platformConnections: true,
        },
      },
    },
  });

  // Get top users by link clicks
  const topUsers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      linkClicks: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      _count: {
        select: {
          links: true,
          linkClicks: true,
          profileViews: true,
        },
      },
    },
  });

  // Platform connection stats
  const platformStats = await prisma.platformConnection.groupBy({
    by: ["platform"],
    _count: { platform: true },
  });

  return NextResponse.json({
    stats: {
      totalUsers,
      totalLinks,
      totalClicks,
      totalViews: totalViews._sum.totalViews || 0,
      newUsersToday,
      newUsersThisWeek,
      activeUsers,
    },
    recentUsers,
    topUsers,
    platformStats: platformStats.map((p: { platform: string; _count: { platform: number } }) => ({
      platform: p.platform,
      count: p._count.platform,
    })),
  });
}
