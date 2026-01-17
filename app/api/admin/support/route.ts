import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return adminCheck.error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const priority = searchParams.get("priority");

  const where = {
    ...(status && { status }),
    ...(category && { category }),
    ...(priority && { priority }),
  };

  const [tickets, total, stats] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            subscriptionTier: true,
          },
        },
        resolver: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    }),
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusCounts = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };
  stats.forEach((s) => {
    statusCounts[s.status as keyof typeof statusCounts] = s._count;
  });

  return NextResponse.json({
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: statusCounts,
  });
}

export async function PUT(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return adminCheck.error;

  const body = await request.json();
  const { ticketId, status, priority, adminNotes } = body;

  if (!ticketId) {
    return NextResponse.json({ error: "Ticket ID required" }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (status) {
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = status;

    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = adminCheck.user.id;
    }
  }

  if (priority) {
    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    updateData.priority = priority;
  }

  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
        },
      },
      resolver: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
  });

  return NextResponse.json({ ticket: updatedTicket });
}

export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck.error) return adminCheck.error;

  const { searchParams } = new URL(request.url);
  const ticketId = searchParams.get("id");

  if (!ticketId) {
    return NextResponse.json({ error: "Ticket ID required" }, { status: 400 });
  }

  await prisma.supportTicket.delete({
    where: { id: ticketId },
  });

  return NextResponse.json({ success: true });
}
