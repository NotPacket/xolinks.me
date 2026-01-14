import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "xolinks.me <noreply@xolinks.me>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string, username: string) {
  if (!resend) {
    console.error("Email not configured: RESEND_API_KEY is missing");
    return { success: false, error: "Email not configured" };
  }

  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  console.log("Sending email with:", { from: FROM_EMAIL, to: email, hasApiKey: !!process.env.RESEND_API_KEY });

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your email - xolinks.me",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #a855f7; font-size: 28px; margin: 0;">xolinks.me</h1>
              </div>

              <!-- Main Card -->
              <div style="background: linear-gradient(135deg, rgba(88, 28, 135, 0.3), rgba(30, 58, 138, 0.3)); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 32px;">
                <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px 0;">Welcome, @${username}!</h2>
                <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Thanks for signing up! Please verify your email address to unlock all features of your xolinks.me profile.
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea, #3b82f6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 10px;">
                    Verify Email Address
                  </a>
                </div>

                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="color: #a855f7; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                  ${verifyUrl}
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 32px;">
                <p style="color: #6b7280; font-size: 13px; margin: 0;">
                  This link expires in 24 hours. If you didn't create an account, you can ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send verification email:", JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    console.error("Email not configured: RESEND_API_KEY is missing");
    return { success: false, error: "Email not configured" };
  }

  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your password - xolinks.me",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #a855f7; font-size: 28px; margin: 0;">xolinks.me</h1>
              </div>

              <!-- Main Card -->
              <div style="background: linear-gradient(135deg, rgba(88, 28, 135, 0.3), rgba(30, 58, 138, 0.3)); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 16px; padding: 32px;">
                <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 16px 0;">Reset Your Password</h2>
                <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  We received a request to reset your password. Click the button below to choose a new password.
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea, #3b82f6); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 10px;">
                    Reset Password
                  </a>
                </div>

                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="color: #a855f7; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                  ${resetUrl}
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 32px;">
                <p style="color: #6b7280; font-size: 13px; margin: 0;">
                  This link expires in 1 hour. If you didn't request this, you can ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
