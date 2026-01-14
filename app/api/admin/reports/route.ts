import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || undefined;

  const where = status ? { status } : {};

  const [reports, total] = await Promise.all([
    prisma.moderationFlag.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        description: true,
        status: true,
        resolution: true,
        createdAt: true,
        resolvedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        flaggedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
    prisma.moderationFlag.count({ where }),
  ]);

  return NextResponse.json({
    reports,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const body = await request.json();
  const { reportId, status, resolution, action } = body;

  if (!reportId || !status) {
    return NextResponse.json({ error: "Report ID and status are required" }, { status: 400 });
  }

  const validStatuses = ["pending", "reviewing", "resolved", "dismissed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Get the report to find the user
  const existingReport = await prisma.moderationFlag.findUnique({
    where: { id: reportId },
    select: { userId: true, user: { select: { username: true } } },
  });

  if (!existingReport) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  let actionMessage = "Report updated";
  const actionsTaken: string[] = [];

  // Execute the selected action
  if (action && status === "resolved") {
    const targetUserId = existingReport.userId;

    switch (action) {
      case "warn":
        // For now, just log the warning - could send email notification
        actionsTaken.push("Warning issued");
        actionMessage = `Warning sent to @${existingReport.user.username}`;
        break;

      case "suspend_7d":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            subscriptionStatus: "suspended",
            // Store suspension end date in a way we can check
          },
        });
        actionsTaken.push("Suspended for 7 days");
        actionMessage = `@${existingReport.user.username} suspended for 7 days`;
        break;

      case "suspend_30d":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            subscriptionStatus: "suspended",
          },
        });
        actionsTaken.push("Suspended for 30 days");
        actionMessage = `@${existingReport.user.username} suspended for 30 days`;
        break;

      case "ban":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            subscriptionStatus: "banned",
            role: "banned",
          },
        });
        actionsTaken.push("User banned");
        actionMessage = `@${existingReport.user.username} has been permanently banned`;
        break;

      case "delete_links":
        const deletedLinks = await prisma.link.deleteMany({
          where: { userId: targetUserId },
        });
        actionsTaken.push(`Deleted ${deletedLinks.count} links`);
        actionMessage = `Deleted ${deletedLinks.count} links from @${existingReport.user.username}`;
        break;

      case "reset_profile":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            displayName: null,
            bio: null,
            avatarUrl: null,
          },
        });
        actionsTaken.push("Profile reset");
        actionMessage = `Profile reset for @${existingReport.user.username}`;
        break;

      case "unsuspend":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            subscriptionStatus: "active",
          },
        });
        actionsTaken.push("Suspension removed");
        actionMessage = `Suspension removed for @${existingReport.user.username}`;
        break;

      case "unban":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            subscriptionStatus: "active",
            role: "user",
          },
        });
        actionsTaken.push("Ban removed");
        actionMessage = `@${existingReport.user.username} has been unbanned`;
        break;

      default:
        break;
    }
  }

  // Update the report status
  const report = await prisma.moderationFlag.update({
    where: { id: reportId },
    data: {
      status,
      resolution: resolution || (actionsTaken.length > 0 ? actionsTaken.join(", ") : null),
      resolvedById: status === "resolved" || status === "dismissed" ? adminCheck.user.id : null,
      resolvedAt: status === "resolved" || status === "dismissed" ? new Date() : null,
    },
    select: {
      id: true,
      status: true,
      resolution: true,
      resolvedAt: true,
    },
  });

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId: adminCheck.user.id,
      action: action ? `report_${action}` : `report_${status}`,
      targetType: "moderation_flag",
      targetId: reportId,
      details: { resolution, action, actionsTaken },
    },
  });

  return NextResponse.json({ report, message: actionMessage });
}
