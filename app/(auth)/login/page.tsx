"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthBackground from "@/components/AuthBackground";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          router.push("/dashboard");
          return;
        }
      } catch {
        // Not logged in, continue
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          border: "3px solid #374151",
          borderTop: "3px solid #a855f7",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Check if login requires email verification
      if (data.requiresVerification) {
        router.push(`/verify-login?email=${encodeURIComponent(data.email)}&display=${encodeURIComponent(data.maskedEmail)}`);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <AuthBackground />
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid #374151",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{
            fontSize: "28px",
            fontWeight: "bold",
            background: "linear-gradient(to right, #a855f7, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textDecoration: "none"
          }}>
            xolinks.me
          </Link>
        </div>

        <h1 style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#fff",
          textAlign: "center",
          marginBottom: "8px"
        }}>Welcome Back</h1>
        <p style={{
          color: "#9ca3af",
          textAlign: "center",
          marginBottom: "32px"
        }}>Sign in to your account</p>

        <form onSubmit={handleSubmit} aria-label="Login form">
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="email" style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#d1d5db",
              marginBottom: "8px"
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              autoComplete="email"
              aria-required="true"
              aria-describedby={error ? "login-error" : undefined}
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="password" style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#d1d5db",
              marginBottom: "8px"
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              aria-required="true"
              aria-describedby={error ? "login-error" : undefined}
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <Link href="/forgot-password" style={{
              color: "#a855f7",
              textDecoration: "none",
              fontSize: "14px"
            }}>
              Forgot password?
            </Link>
          </div>

          {error && (
            <div
              id="login-error"
              role="alert"
              aria-live="polite"
              style={{
                padding: "12px 16px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                color: "#f87171",
                fontSize: "14px",
                marginBottom: "20px"
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(to right, #9333ea, #3b82f6)",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          color: "#9ca3af",
          marginTop: "24px",
          fontSize: "14px"
        }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#a855f7", textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
