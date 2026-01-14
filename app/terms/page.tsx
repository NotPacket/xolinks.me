import Link from "next/link";

export default function TermsOfService() {
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
          Terms of Service
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "32px" }}>
          Last updated: January 14, 2025
        </p>

        <div style={{ color: "#d1d5db", lineHeight: "1.8" }}>
          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ marginBottom: "12px" }}>
              By accessing or using xolinks.me (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Service after any modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              2. Description of Service
            </h2>
            <p style={{ marginBottom: "12px" }}>
              xolinks.me is a link-in-bio platform that allows users to create a personalized page containing links to their social media profiles and other online content. Our Service emphasizes verified links through OAuth authentication to help protect users from impersonation and scams.
            </p>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              3. User Accounts
            </h2>
            <p style={{ marginBottom: "12px" }}>
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul style={{ marginLeft: "24px", marginBottom: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Provide accurate and complete registration information</li>
              <li style={{ marginBottom: "8px" }}>Maintain the security of your account credentials</li>
              <li style={{ marginBottom: "8px" }}>Notify us immediately of any unauthorized use of your account</li>
              <li style={{ marginBottom: "8px" }}>Accept responsibility for all activities under your account</li>
            </ul>
            <p>
              You must be at least 13 years old to create an account and use the Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              4. User Content and Conduct
            </h2>
            <p style={{ marginBottom: "12px" }}>
              You retain ownership of any content you submit to the Service. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in connection with the Service.
            </p>
            <p style={{ marginBottom: "12px" }}>
              You agree NOT to use the Service to:
            </p>
            <ul style={{ marginLeft: "24px", marginBottom: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Post illegal, harmful, threatening, abusive, or harassing content</li>
              <li style={{ marginBottom: "8px" }}>Impersonate any person or entity</li>
              <li style={{ marginBottom: "8px" }}>Distribute malware, phishing links, or other harmful content</li>
              <li style={{ marginBottom: "8px" }}>Violate any applicable laws or regulations</li>
              <li style={{ marginBottom: "8px" }}>Infringe on the intellectual property rights of others</li>
              <li style={{ marginBottom: "8px" }}>Engage in spam or fraudulent activities</li>
              <li style={{ marginBottom: "8px" }}>Attempt to gain unauthorized access to the Service or other accounts</li>
            </ul>
            <p>
              We reserve the right to remove any content and terminate accounts that violate these Terms.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              5. Verified Links and OAuth
            </h2>
            <p style={{ marginBottom: "12px" }}>
              Our Service uses OAuth authentication to verify ownership of linked social media accounts. By connecting your accounts:
            </p>
            <ul style={{ marginLeft: "24px", marginBottom: "12px" }}>
              <li style={{ marginBottom: "8px" }}>You authorize us to access basic profile information from connected platforms</li>
              <li style={{ marginBottom: "8px" }}>You confirm that you are the legitimate owner of those accounts</li>
              <li style={{ marginBottom: "8px" }}>You understand that verification status depends on successful OAuth authentication</li>
            </ul>
            <p>
              We are not responsible for any issues arising from third-party OAuth providers.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              6. Intellectual Property
            </h2>
            <p style={{ marginBottom: "12px" }}>
              The Service, including its original content, features, and functionality, is owned by xolinks.me and is protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              7. Termination
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:
            </p>
            <ul style={{ marginLeft: "24px", marginBottom: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Violation of these Terms</li>
              <li style={{ marginBottom: "8px" }}>Requests by law enforcement</li>
              <li style={{ marginBottom: "8px" }}>Discontinuation of the Service</li>
              <li style={{ marginBottom: "8px" }}>Extended periods of inactivity</li>
            </ul>
            <p>
              You may terminate your account at any time by contacting us or using account deletion features in the Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              8. Limitation of Liability
            </h2>
            <p style={{ marginBottom: "12px" }}>
              To the maximum extent permitted by law, xolinks.me shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul style={{ marginLeft: "24px", marginBottom: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Loss of profits, data, or goodwill</li>
              <li style={{ marginBottom: "8px" }}>Service interruption or computer damage</li>
              <li style={{ marginBottom: "8px" }}>Cost of substitute services</li>
              <li style={{ marginBottom: "8px" }}>Any damages resulting from your use of the Service</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              9. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless xolinks.me, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              10. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved in the courts of the United States.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "600", color: "#fff", marginBottom: "16px" }}>
              11. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p style={{ marginTop: "12px", color: "#a855f7" }}>
              support@xolinks.me
            </p>
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
