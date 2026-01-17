import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter") || "all"; // all, unread, archived

    const where = {
      recipientId: session.userId,
      ...(filter === "unread" && { isRead: false, isArchived: false }),
      ...(filter === "archived" && { isArchived: true }),
      ...(filter === "all" && { isArchived: false }),
    };

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          senderName: true,
          senderEmail: true,
          subject: true,
          message: true,
          isRead: true,
          isArchived: true,
          createdAt: true,
        },
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({
        where: { recipientId: session.userId, isRead: false, isArchived: false },
      }),
    ]);

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageIds, action } = await request.json();

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "Message IDs required" },
        { status: 400 }
      );
    }

    if (!["markRead", "markUnread", "archive", "unarchive"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Verify ownership of all messages
    const messages = await prisma.contactMessage.findMany({
      where: {
        id: { in: messageIds },
        recipientId: session.userId,
      },
    });

    if (messages.length !== messageIds.length) {
      return NextResponse.json(
        { error: "Some messages not found or unauthorized" },
        { status: 403 }
      );
    }

    const updateData = {
      ...(action === "markRead" && { isRead: true }),
      ...(action === "markUnread" && { isRead: false }),
      ...(action === "archive" && { isArchived: true }),
      ...(action === "unarchive" && { isArchived: false }),
    };

    await prisma.contactMessage.updateMany({
      where: {
        id: { in: messageIds },
        recipientId: session.userId,
      },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update messages error:", error);
    return NextResponse.json(
      { error: "Failed to update messages" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("id");

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const message = await prisma.contactMessage.findFirst({
      where: {
        id: messageId,
        recipientId: session.userId,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
