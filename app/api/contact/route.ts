import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { recipientUsername, senderName, senderEmail, subject, message } = await request.json();

    if (!recipientUsername || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Message length validation
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    if (senderName.length > 100) {
      return NextResponse.json(
        { error: "Name too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // Find the recipient user
    const cleanUsername = recipientUsername.replace("@", "").toLowerCase();
    const recipient = await prisma.user.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
      },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Rate limiting: Check if this sender has sent too many messages recently
    const recentMessages = await prisma.contactMessage.count({
      where: {
        senderEmail: senderEmail.toLowerCase(),
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentMessages >= 5) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    // Create the contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        recipientId: recipient.id,
        senderName: senderName.trim(),
        senderEmail: senderEmail.toLowerCase().trim(),
        subject: subject?.trim() || null,
        message: message.trim(),
      },
    });

    // Send email notification to the recipient
    try {
      await resend.emails.send({
        from: "xolinks.me <noreply@xolinks.me>",
        to: recipient.email,
        subject: `New message from ${senderName}${subject ? `: ${subject}` : ""}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="background: linear-gradient(to right, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px;">xolinks.me</h1>
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
              <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 18px;">New Contact Message</h2>
              <p style="color: #6b7280; margin: 0 0 12px 0;"><strong>From:</strong> ${senderName} (${senderEmail})</p>
              ${subject ? `<p style="color: #6b7280; margin: 0 0 12px 0;"><strong>Subject:</strong> ${subject}</p>` : ""}
              <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px;">
                <p style="color: #374151; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>

            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              You can reply directly to this email to respond to ${senderName}.
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px;">
                This message was sent via your xolinks.me profile contact form.
              </p>
            </div>
          </div>
        `,
        replyTo: senderEmail,
      });
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error("Failed to send notification email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      id: contactMessage.id,
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
