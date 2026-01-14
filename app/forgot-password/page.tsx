"use client";

import { useState } from "react";
import Link from "next/link";

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  backgroundColor: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "rgba(17, 24, 39, 0.6)",
        border: "1px solid #374151",
        borderRadius: "16px",
        padding: "40px 32px"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #a855f7, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0
            }}>
              xolinks.me
            </h1>
          </Link>
        </div>

        {!submitted ? (
          <>
            <h2 style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: "600",
              textAlign: "center",
              marginBottom: "8px"
            }}>
              Forgot your password?
            </h2>
            <p style={{
              color: "#9ca3af",
              fontSize: "15px",
              textAlign: "center",
              marginBottom: "32px"
            }}>
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div style={{
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                fontSize: "14px"
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#d1d5db",
                  marginBottom: "8px"
                }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading || !email ? "#374151" : "linear-gradient(135deg, #9333ea, #3b82f6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading || !email ? "not-allowed" : "pointer",
                  opacity: loading || !email ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid #fff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }} />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 24px",
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              Check your email
            </h2>
            <p style={{
              color: "#9ca3af",
              fontSize: "15px",
              marginBottom: "24px",
              lineHeight: "1.6"
            }}>
              If an account exists for <strong style={{ color: "#d1d5db" }}>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <p style={{
              color: "#6b7280",
              fontSize: "13px",
              marginBottom: "24px"
            }}>
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail(""); }}
              style={{
                padding: "12px 24px",
                backgroundColor: "rgba(75, 85, 99, 0.3)",
                border: "1px solid #4b5563",
                borderRadius: "10px",
                color: "#d1d5db",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Try a different email
            </button>
          </div>
        )}

        {/* Back to login */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link href="/login" style={{
            color: "#a855f7",
            textDecoration: "none",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
