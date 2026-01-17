import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const CATEGORIES = ["general", "bug", "feature", "billing", "account"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { email, name, subject, message, category } = body;

    // If logged in, use session info
    let userId = session?.userId;
    let userEmail = email;
    let userName = name;

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true, displayName: true, username: true },
      });
      if (user) {
        userEmail = email || user.email;
        userName = name || user.displayName || user.username;
      }
    }

    // Validation
    if (!userEmail || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject too long (max 200 characters)" },
        { status: 400 }
      );
    }

    if (message.length > 10000) {
      return NextResponse.json(
        { error: "Message too long (max 10000 characters)" },
        { status: 400 }
      );
    }

    const validCategory = CATEGORIES.includes(category) ? category : "general";

    // Rate limiting: Max 3 tickets per hour per email
    const recentTickets = await prisma.supportTicket.count({
      where: {
        email: userEmail.toLowerCase(),
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });

    if (recentTickets >= 3) {
      return NextResponse.json(
        { error: "Too many tickets submitted. Please try again later." },
        { status: 429 }
      );
    }

    // Auto-detect priority based on keywords
    let priority = "medium";
    const lowerMessage = message.toLowerCase();
    const lowerSubject = subject.toLowerCase();

    if (
      lowerMessage.includes("urgent") ||
      lowerMessage.includes("asap") ||
      lowerMessage.includes("emergency") ||
      lowerSubject.includes("urgent")
    ) {
      priority = "high";
    } else if (
      lowerMessage.includes("payment") ||
      lowerMessage.includes("billing") ||
      lowerMessage.includes("charge") ||
      category === "billing"
    ) {
      priority = "high";
    } else if (category === "bug") {
      priority = "medium";
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        email: userEmail.toLowerCase(),
        name: userName || null,
        subject: subject.trim(),
        message: message.trim(),
        category: validCategory,
        priority,
      },
    });

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: "xolinks.me Support <support@xolinks.me>",
        to: userEmail,
        subject: `Support Ticket #${ticket.id.slice(-8)} - ${subject}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="background: linear-gradient(to right, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px;">xolinks.me</h1>
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
              <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px;">We've received your message!</h2>
              <p style="color: #6b7280; margin: 0 0 12px 0;">
                Hi${userName ? ` ${userName}` : ""},
              </p>
              <p style="color: #6b7280; margin: 0 0 12px 0;">
                Thanks for reaching out. We've received your support ticket and will get back to you as soon as possible.
              </p>

              <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px;">
                <p style="color: #374151; margin: 0 0 8px 0;"><strong>Ticket ID:</strong> #${ticket.id.slice(-8)}</p>
                <p style="color: #374151; margin: 0 0 8px 0;"><strong>Subject:</strong> ${subject}</p>
                <p style="color: #374151; margin: 0 0 8px 0;"><strong>Category:</strong> ${validCategory}</p>
                <p style="color: #374151; margin: 0;"><strong>Priority:</strong> ${priority}</p>
              </div>
            </div>

            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              We typically respond within 24-48 hours. You can reply to this email if you need to add more information.
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} xolinks.me. All rights reserved.
              </p>
            </div>
          </div>
        `,
        replyTo: "support@xolinks.me",
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    // Notify support team (optional - could send to a support email)
    try {
      if (process.env.SUPPORT_EMAIL) {
        await resend.emails.send({
          from: "xolinks.me Support <noreply@xolinks.me>",
          to: process.env.SUPPORT_EMAIL,
          subject: `[${priority.toUpperCase()}] New Support Ticket: ${subject}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #111827;">New Support Ticket</h2>

              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                <p><strong>From:</strong> ${userName || "Anonymous"} (${userEmail})</p>
                <p><strong>Category:</strong> ${validCategory}</p>
                <p><strong>Priority:</strong> ${priority}</p>
                <p><strong>User ID:</strong> ${userId || "Not logged in"}</p>
              </div>

              <h3>Subject</h3>
              <p>${subject}</p>

              <h3>Message</h3>
              <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          `,
          replyTo: userEmail,
        });
      }
    } catch (notifyError) {
      console.error("Failed to notify support team:", notifyError);
    }

    return NextResponse.json({
      success: true,
      message: "Support ticket submitted successfully",
      ticketId: ticket.id,
    });
  } catch (error) {
    console.error("Support ticket error:", error);
    return NextResponse.json(
      { error: "Failed to submit support ticket" },
      { status: 500 }
    );
  }
}

// GET - Get user's own tickets (if logged in)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        subject: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
