"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const FEATURES = {
  free: [
    { name: "5 custom links", included: true },
    { name: "Basic analytics (7 days)", included: true },
    { name: "Standard themes", included: true },
    { name: "5 custom themes", included: true },
    { name: "xolinks.me branding", included: true },
    { name: "Unlimited links", included: false },
    { name: "Advanced analytics (30 days)", included: false },
    { name: "Remove branding", included: false },
    { name: "Priority support", included: false },
  ],
  pro: [
    { name: "Unlimited links", included: true },
    { name: "Advanced analytics (30 days)", included: true },
    { name: "All premium themes", included: true },
    { name: "50 custom themes", included: true },
    { name: "Remove xolinks.me branding", included: true },
    { name: "Priority support", included: true },
    { name: "Custom domain (coming soon)", included: true },
  ],
};

// Wrapper component for default export with Suspense
export default function UpgradePage() {
  return (
    <Suspense fallback={<UpgradePageLoading />}>
      <UpgradePageContent />
    </Suspense>
  );
}

function UpgradePageLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Loading...
    </div>
  );
}

function UpgradePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Check current subscription
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentTier(data.user.subscriptionTier || "free");
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      }
    };
    fetchSubscription();

    // Check for canceled message
    if (searchParams.get("canceled") === "true") {
      setMessage({
        type: "error",
        text: "Checkout was canceled. No charges were made.",
      });
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to start checkout" });
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error || "Failed to open billing portal" });
      }
    } catch (error) {
      console.error("Billing portal error:", error);
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        color: "#fff",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(55, 65, 81, 0.5)",
          backgroundColor: "rgba(17, 24, 39, 0.5)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            xolinks.me
          </Link>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link
              href="/dashboard"
              style={{
                color: "#9ca3af",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              style={{
                color: "#9ca3af",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Message */}
        {message && (
          <div
            style={{
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "32px",
              backgroundColor:
                message.type === "success"
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              color: message.type === "success" ? "#4ade80" : "#f87171",
              textAlign: "center",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "800",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #a855f7, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Upgrade to Pro
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "18px", maxWidth: "500px", margin: "0 auto" }}>
            Unlock unlimited links, advanced analytics, and more powerful features
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          {/* Free Tier */}
          <div
            style={{
              backgroundColor: "rgba(17, 24, 39, 0.6)",
              border: currentTier === "free" ? "2px solid #a855f7" : "1px solid #374151",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Free</h2>
                {currentTier === "free" && (
                  <span
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                      color: "#a855f7",
                      fontSize: "12px",
                      borderRadius: "20px",
                      fontWeight: "500",
                    }}
                  >
                    Current Plan
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "48px", fontWeight: "800" }}>$0</span>
                <span style={{ color: "#6b7280" }}>/month</span>
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
              {FEATURES.free.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(55, 65, 81, 0.5)",
                  }}
                >
                  {feature.included ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#4ade80">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#6b7280">
                      <path d="M19 13H5v-2h14v2z" />
                    </svg>
                  )}
                  <span style={{ color: feature.included ? "#d1d5db" : "#6b7280" }}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <button
              disabled
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "rgba(55, 65, 81, 0.5)",
                border: "1px solid #374151",
                borderRadius: "12px",
                color: "#6b7280",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "not-allowed",
              }}
            >
              {currentTier === "free" ? "Current Plan" : "Downgrade"}
            </button>
          </div>

          {/* Pro Tier */}
          <div
            style={{
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              border: currentTier === "pro" ? "2px solid #a855f7" : "2px solid rgba(139, 92, 246, 0.5)",
              borderRadius: "20px",
              padding: "32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Popular Badge */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "-30px",
                backgroundColor: "#a855f7",
                color: "#fff",
                padding: "4px 40px",
                fontSize: "12px",
                fontWeight: "600",
                transform: "rotate(45deg)",
              }}
            >
              POPULAR
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Pro</h2>
                {currentTier === "pro" && (
                  <span
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      color: "#4ade80",
                      fontSize: "12px",
                      borderRadius: "20px",
                      fontWeight: "500",
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "48px", fontWeight: "800" }}>$8</span>
                <span style={{ color: "#9ca3af" }}>/month</span>
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
              {FEATURES.pro.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#a855f7">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span style={{ color: "#d1d5db" }}>{feature.name}</span>
                </li>
              ))}
            </ul>

            {currentTier === "pro" ? (
              <button
                onClick={handleManageBilling}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "rgba(55, 65, 81, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "#d1d5db",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Loading..." : "Manage Subscription"}
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Loading..." : "Upgrade to Pro"}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div
          style={{
            backgroundColor: "rgba(17, 24, 39, 0.6)",
            border: "1px solid #374151",
            borderRadius: "20px",
            padding: "32px",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Frequently Asked Questions
          </h3>

          <div style={{ display: "grid", gap: "16px" }}>
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.",
              },
              {
                q: "What happens if I downgrade?",
                a: "If you downgrade to Free, your extra links beyond the limit will be hidden (not deleted). You can upgrade again to restore access.",
              },
              {
                q: "Is there a free trial?",
                a: "We offer a generous Free tier so you can try xolinks.me without any commitment. Upgrade when you're ready for more features.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  borderRadius: "12px",
                }}
              >
                <h4 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>
                  {faq.q}
                </h4>
                <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.6" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
