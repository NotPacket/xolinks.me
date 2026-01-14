import Link from "next/link";
import LandingBackground from "@/components/LandingBackground";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030712", color: "#fff", position: "relative", overflow: "hidden" }}>
      <LandingBackground />

      <div style={{ position: "relative", zIndex: 10 }}>
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

      {/* Hero Section */}
      <section style={{
        textAlign: "center",
        padding: "80px 24px 60px",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          backgroundColor: "rgba(147, 51, 234, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          borderRadius: "50px",
          marginBottom: "32px",
          fontSize: "14px",
          color: "#c084fc"
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            backgroundColor: "#4ade80",
            borderRadius: "50%"
          }} />
          Verified links only - No scams, no fakes
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(36px, 8vw, 56px)",
          fontWeight: "bold",
          marginBottom: "24px",
          lineHeight: "1.1"
        }}>
          One Link for{" "}
          <span style={{
            background: "linear-gradient(to right, #a855f7, #ec4899, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Everything
          </span>
        </h1>

        <p style={{
          fontSize: "18px",
          color: "#9ca3af",
          marginBottom: "40px",
          maxWidth: "600px",
          margin: "0 auto 40px"
        }}>
          Create your personalized link page in seconds. Share all your important links with one beautiful, verified profile.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "48px"
        }}>
          <Link href="/register" style={{
            padding: "14px 28px",
            background: "linear-gradient(to right, #9333ea, #3b82f6)",
            borderRadius: "12px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px",
            boxShadow: "0 10px 40px rgba(147, 51, 234, 0.3)"
          }}>
            Create Your Page →
          </Link>
          <Link href="#features" style={{
            padding: "14px 28px",
            backgroundColor: "rgba(31, 41, 55, 0.5)",
            border: "1px solid #374151",
            borderRadius: "12px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px"
          }}>
            See How It Works
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "48px",
          flexWrap: "wrap"
        }}>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>100%</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Verified Links</div>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>Free</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Forever</div>
          </div>
          <div>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>8+</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Themes</div>
          </div>
        </div>
      </section>

      {/* Phone Mockup */}
      <section style={{
        maxWidth: "320px",
        margin: "0 auto 80px",
        padding: "0 24px"
      }}>
        <div style={{
          background: "#111827",
          borderRadius: "40px",
          padding: "12px",
          border: "1px solid #1f2937",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{
            background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #000)",
            borderRadius: "32px",
            padding: "32px 20px",
            minHeight: "400px"
          }}>
            {/* Avatar */}
            <div style={{
              width: "72px",
              height: "72px",
              margin: "0 auto 16px",
              background: "linear-gradient(to bottom right, #a855f7, #3b82f6)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold"
            }}>A</div>

            <h3 style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", marginBottom: "4px" }}>Alex Chen</h3>
            <p style={{ textAlign: "center", fontSize: "14px", color: "#9ca3af", marginBottom: "24px" }}>@alexchen</p>

            {/* Mock Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "GitHub", color: "#333" },
                { name: "Discord", color: "#5865F2" },
                { name: "Twitch", color: "#9146FF" }
              ].map((item) => (
                <div key={item.name} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "12px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: item.color,
                    borderRadius: "8px"
                  }} />
                  <span style={{ flex: 1, fontSize: "14px" }}>{item.name}</span>
                  <span style={{
                    padding: "2px 8px",
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    color: "#4ade80",
                    fontSize: "11px",
                    borderRadius: "50px"
                  }}>Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: "80px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
        borderTop: "1px solid #1f2937"
      }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "16px"
        }}>
          Why Choose xolinks.me?
        </h2>
        <p style={{
          textAlign: "center",
          color: "#9ca3af",
          marginBottom: "48px"
        }}>
          Built for creators who want to stand out and stay protected
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {/* Verified Links */}
          <div style={{
            padding: "24px",
            backgroundColor: "rgba(17, 24, 39, 0.5)",
            border: "1px solid #1f2937",
            borderRadius: "16px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(168, 85, 247, 0.2)",
              borderRadius: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Verified Links Only</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6" }}>Every link is verified through OAuth. No scams, no impersonation - your followers can trust every link.</p>
          </div>

          {/* Beautiful Themes */}
          <div style={{
            padding: "24px",
            backgroundColor: "rgba(17, 24, 39, 0.5)",
            border: "1px solid #1f2937",
            borderRadius: "16px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              borderRadius: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="2.5"/>
                <circle cx="19" cy="17" r="2"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="12" cy="19" r="2"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Beautiful Themes</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6" }}>Choose from 8 stunning themes to match your style. Space, Midnight, Sunset, and more.</p>
          </div>

          {/* Detailed Analytics */}
          <div style={{
            padding: "24px",
            backgroundColor: "rgba(17, 24, 39, 0.5)",
            border: "1px solid #1f2937",
            borderRadius: "16px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(236, 72, 153, 0.2)",
              borderRadius: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"/>
                <path d="M12 20V4"/>
                <path d="M6 20v-6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Detailed Analytics</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6" }}>Track profile views, link clicks, and visitor insights. Know exactly how your page performs.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: "80px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
        backgroundColor: "rgba(17, 24, 39, 0.3)"
      }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "16px"
        }}>
          Get Started in 3 Steps
        </h2>
        <p style={{
          textAlign: "center",
          color: "#9ca3af",
          marginBottom: "48px"
        }}>
          Create your verified link page in under a minute
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "32px",
          textAlign: "center"
        }}>
          {[
            { num: "1", title: "Create Account", desc: "Sign up with your email and choose your unique username", gradient: "linear-gradient(to bottom right, #a855f7, #3b82f6)" },
            { num: "2", title: "Connect Platforms", desc: "Link your GitHub, Discord, Twitch, Spotify and more via OAuth", gradient: "linear-gradient(to bottom right, #3b82f6, #06b6d4)" },
            { num: "3", title: "Share Everywhere", desc: "Share your xolinks.me link in your bio, posts, and everywhere else", gradient: "linear-gradient(to bottom right, #06b6d4, #22c55e)" }
          ].map((step) => (
            <div key={step.num}>
              <div style={{
                width: "56px",
                height: "56px",
                background: step.gradient,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "bold",
                margin: "0 auto 16px"
              }}>{step.num}</div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{step.title}</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "80px 24px",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        <div style={{
          background: "linear-gradient(to right, rgba(88, 28, 135, 0.5), rgba(30, 58, 138, 0.5))",
          border: "1px solid rgba(147, 51, 234, 0.2)",
          borderRadius: "24px",
          padding: "48px 32px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "16px" }}>
            Ready to Create Your Page?
          </h2>
          <p style={{ color: "#d1d5db", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
            Join thousands of creators who trust xolinks.me for their verified link page. It&apos;s free, fast, and secure.
          </p>
          <Link href="/register" style={{
            display: "inline-block",
            padding: "14px 32px",
            backgroundColor: "#fff",
            color: "#111827",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px"
          }}>
            Get Started Free →
          </Link>
        </div>
      </section>

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
          <Link href="/login" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Sign In</Link>
          <Link href="/register" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Sign Up</Link>
        </div>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          © 2026 xolinks.me. All rights reserved.
        </p>
      </footer>
      </div>
    </div>
  );
}
