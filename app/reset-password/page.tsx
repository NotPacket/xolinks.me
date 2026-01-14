"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. No token provided.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
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

      {!token && !success ? (
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 24px",
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 style={{
            color: "#f87171",
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "8px"
          }}>
            Invalid Link
          </h2>
          <p style={{
            color: "#9ca3af",
            fontSize: "15px",
            marginBottom: "24px"
          }}>
            {error || "This password reset link is invalid or has expired."}
          </p>
          <Link href="/forgot-password" style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #9333ea, #3b82f6)",
            borderRadius: "10px",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "600"
          }}>
            Request New Link
          </Link>
        </div>
      ) : success ? (
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
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 style={{
            color: "#4ade80",
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "8px"
          }}>
            Password Reset!
          </h2>
          <p style={{
            color: "#9ca3af",
            fontSize: "15px",
            marginBottom: "24px"
          }}>
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Redirecting to login...
          </p>
        </div>
      ) : (
        <>
          <h2 style={{
            color: "#fff",
            fontSize: "22px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "8px"
          }}>
            Reset your password
          </h2>
          <p style={{
            color: "#9ca3af",
            fontSize: "15px",
            textAlign: "center",
            marginBottom: "32px"
          }}>
            Enter your new password below.
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
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
                style={inputStyle}
              />
              <p style={{
                color: "#6b7280",
                fontSize: "12px",
                marginTop: "6px"
              }}>
                Must be at least 8 characters
              </p>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#d1d5db",
                marginBottom: "8px"
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              style={{
                width: "100%",
                padding: "14px",
                background: loading || !password || !confirmPassword ? "#374151" : "linear-gradient(135deg, #9333ea, #3b82f6)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading || !password || !confirmPassword ? "not-allowed" : "pointer",
                opacity: loading || !password || !confirmPassword ? 0.7 : 1,
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
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </>
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
  );
}

function LoadingFallback() {
  return (
    <div style={{
      width: "100%",
      maxWidth: "420px",
      backgroundColor: "rgba(17, 24, 39, 0.6)",
      border: "1px solid #374151",
      borderRadius: "16px",
      padding: "40px 32px",
      textAlign: "center"
    }}>
      <div style={{
        width: "64px",
        height: "64px",
        margin: "0 auto 24px",
        border: "3px solid #374151",
        borderTop: "3px solid #a855f7",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: "600", marginBottom: "8px" }}>
        Loading...
      </h1>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordContent />
      </Suspense>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
