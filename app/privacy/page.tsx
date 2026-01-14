import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030712", color: "#fff" }}>
      {/* Navigation */}
      <nav style={{
        borderBottom: "1px solid #1f2937",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <Link href="/" style={{
          fontSize: "24px",
          fontWeight: "bold",
          background: "linear-gradient(to right, #a855f7, #3b82f6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textDecoration: "none"
        }}>
          xolinks.me
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link href="/login" style={{ color: "#9ca3af", textDecoration: "none" }}>
            Sign In
          </Link>
          <Link href="/register" style={{
            padding: "8px 16px",
            background: "linear-gradient(to right, #9333ea, #3b82f6)",
            borderRadius: "8px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "500"
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px 24px"
      }}>
        <h1 style={{
          fontSize: "36px",
          fontWeight: "bold",
          marginBottom: "8px",
          background: "linear-gradient(to right, #a855f7, #3b82f6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "32px" }}>
          Last updated: January 14, 2025
        </p>

        <div style={{ color: "#d1d5db", lineHeight: "1.8" }}>
          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              1. Introduction
            </h2>
            <p style={{ marginBottom: "12px" }}>
              xolinks.me (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our link-in-bio service.
            </p>
            <p>
              By using xolinks.me, you consent to the data practices described in this policy. If you do not agree with our policies, please do not use our Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              2. Information We Collect
            </h2>

            <h3 style={{ fontSize: "18px", fontWeight: "500", color: "#e5e7eb", marginBottom: "12px", marginTop: "20px" }}>
              2.1 Information You Provide
            </h3>
            <ul style={{ marginLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Account Information:</strong> Email address, username, password (encrypted), display name, and bio</li>
              <li style={{ marginBottom: "8px" }}><strong>Profile Content:</strong> Links you add, profile pictures, and customization preferences</li>
              <li style={{ marginBottom: "8px" }}><strong>Communications:</strong> Information you provide when contacting us for support</li>
            </ul>

            <h3 style={{ fontSize: "18px", fontWeight: "500", color: "#e5e7eb", marginBottom: "12px", marginTop: "20px" }}>
              2.2 Information from OAuth Providers
            </h3>
            <p style={{ marginBottom: "12px" }}>
              When you connect third-party accounts (GitHub, Discord, Twitch, Twitter, TikTok, Instagram, YouTube, Spotify), we receive:
            </p>
            <ul style={{ marginLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>Your public profile information (username, display name, profile picture URL)</li>
              <li style={{ marginBottom: "8px" }}>Your unique user ID on that platform</li>
              <li style={{ marginBottom: "8px" }}>OAuth access tokens (stored securely for verification purposes)</li>
            </ul>
            <p>
              We only request the minimum permissions necessary to verify account ownership. We do not post on your behalf or access private content.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "500", color: "#e5e7eb", marginBottom: "12px", marginTop: "20px" }}>
              2.3 Automatically Collected Information
            </h3>
            <ul style={{ marginLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Usage Data:</strong> Pages visited, links clicked, features used</li>
              <li style={{ marginBottom: "8px" }}><strong>Device Information:</strong> Browser type, device type (mobile/desktop), operating system</li>
              <li style={{ marginBottom: "8px" }}><strong>Log Data:</strong> IP address, access times, referring URLs</li>
              <li style={{ marginBottom: "8px" }}><strong>Analytics:</strong> Profile views, link click counts, visitor statistics</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              3. How We Use Your Information
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We use collected information to:
            </p>
            <ul style={{ marginLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Provide, maintain, and improve the Service</li>
              <li style={{ marginBottom: "8px" }}>Create and manage your account</li>
              <li style={{ marginBottom: "8px" }}>Verify ownership of connected social media accounts</li>
              <li style={{ marginBottom: "8px" }}>Display your public profile page to visitors</li>
              <li style={{ marginBottom: "8px" }}>Provide analytics about your profile and link performance</li>
              <li style={{ marginBottom: "8px" }}>Send important notifications about your account</li>
              <li style={{ marginBottom: "8px" }}>Respond to your inquiries and support requests</li>
              <li style={{ marginBottom: "8px" }}>Detect and prevent fraud, abuse, and security issues</li>
              <li style={{ marginBottom: "8px" }}>Comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              4. Information Sharing and Disclosure
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We do NOT sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul style={{ marginLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Public Profile:</strong> Your profile page, including username, display name, bio, avatar, and links are publicly visible</li>
              <li style={{ marginBottom: "8px" }}><strong>Service Providers:</strong> We may share data with third-party vendors who help us operate the Service (hosting, email delivery, analytics)</li>
              <li style={{ marginBottom: "8px" }}><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government request</li>
              <li style={{ marginBottom: "8px" }}><strong>Safety:</strong> We may share information to protect the rights, safety, and property of xolinks.me, our users, or the public</li>
              <li style={{ marginBottom: "8px" }}><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale, user data may be transferred</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              5. Data Security
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We implement appropriate security measures to protect your information:
            </p>
            <ul style={{ marginLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Passwords are hashed using industry-standard algorithms</li>
              <li style={{ marginBottom: "8px" }}>OAuth tokens are encrypted at rest</li>
              <li style={{ marginBottom: "8px" }}>All data transmission uses HTTPS encryption</li>
              <li style={{ marginBottom: "8px" }}>Regular security audits and monitoring</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              6. Cookies and Tracking
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We use cookies and similar technologies to:
            </p>
            <ul style={{ marginLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Maintain your session and authentication state</li>
              <li style={{ marginBottom: "8px" }}>Remember your preferences</li>
              <li style={{ marginBottom: "8px" }}>Analyze usage patterns to improve the Service</li>
              <li style={{ marginBottom: "8px" }}>Secure the Service against abuse</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              You can control cookies through your browser settings. Disabling cookies may affect Service functionality.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              7. Your Rights and Choices
            </h2>
            <p style={{ marginBottom: "12px" }}>
              You have the following rights regarding your data:
            </p>
            <ul style={{ marginLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}><strong>Access:</strong> Request a copy of your personal data</li>
              <li style={{ marginBottom: "8px" }}><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li style={{ marginBottom: "8px" }}><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li style={{ marginBottom: "8px" }}><strong>Disconnect:</strong> Remove connected OAuth accounts at any time</li>
              <li style={{ marginBottom: "8px" }}><strong>Export:</strong> Request an export of your data in a portable format</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              To exercise these rights, contact us at support@xolinks.me or use the account settings in the Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              8. Data Retention
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We retain your information for as long as your account is active or as needed to provide the Service. After account deletion:
            </p>
            <ul style={{ marginLeft: "24px" }}>
              <li style={{ marginBottom: "8px" }}>Profile data is deleted within 30 days</li>
              <li style={{ marginBottom: "8px" }}>Aggregated analytics data may be retained indefinitely</li>
              <li style={{ marginBottom: "8px" }}>Backup copies may persist for up to 90 days</li>
              <li style={{ marginBottom: "8px" }}>Legal compliance records may be retained longer as required</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              9. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will delete it immediately. If you believe a child under 13 has provided us with personal data, please contact us at support@xolinks.me.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              10. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. By using the Service, you consent to the transfer of your information to the United States and other jurisdictions where we operate. We take steps to ensure your data is protected in accordance with this Privacy Policy.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              11. Third-Party Links
            </h2>
            <p>
              Our Service may contain links to third-party websites and services. We are not responsible for the privacy practices of these external sites. We encourage you to read the privacy policies of any third-party services you access through xolinks.me.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              12. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              13. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p style={{ marginTop: "12px", color: "#a855f7" }}>
              support@xolinks.me
            </p>
          </section>

          <section style={{
            marginTop: "48px",
            padding: "24px",
            backgroundColor: "rgba(147, 51, 234, 0.1)",
            border: "1px solid rgba(147, 51, 234, 0.2)",
            borderRadius: "12px"
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "12px" }}>
              Summary of Key Points
            </h3>
            <ul style={{ marginLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>We collect only necessary information to provide the Service</li>
              <li style={{ marginBottom: "8px" }}>We use OAuth for verification, not to access your private data</li>
              <li style={{ marginBottom: "8px" }}>We do NOT sell your personal information</li>
              <li style={{ marginBottom: "8px" }}>Your profile is public; keep sensitive info private</li>
              <li style={{ marginBottom: "8px" }}>You can delete your account and data at any time</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #1f2937",
        padding: "32px 24px",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <span style={{
          fontSize: "20px",
          fontWeight: "bold",
          background: "linear-gradient(to right, #a855f7, #3b82f6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          xolinks.me
        </span>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/terms" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Privacy Policy</Link>
        </div>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          © 2025 xolinks.me. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
