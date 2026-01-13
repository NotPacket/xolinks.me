import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db";

// DELETE - Disconnect a platform
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform } = await params;

    // Find and delete the connection
    const connection = await prisma.platformConnection.findUnique({
      where: {
        userId_platform: {
          userId: session.userId,
          platform,
        },
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Update any links to mark them as unverified
    await prisma.link.updateMany({
      where: {
        platformConnectionId: connection.id,
      },
      data: {
        platformConnectionId: null,
        isVerified: false,
      },
    });

    // Delete the connection
    await prisma.platformConnection.delete({
      where: { id: connection.id },
    });

    return NextResponse.json({ message: "Platform disconnected" });
  } catch (error) {
    console.error("Disconnect platform error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
