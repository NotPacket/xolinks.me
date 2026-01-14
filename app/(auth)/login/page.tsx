"use client";

import { useState } from "react";
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#d1d5db",
              marginBottom: "8px"
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
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
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#d1d5db",
              marginBottom: "8px"
            }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
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
            <div style={{
              padding: "12px 16px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              color: "#f87171",
              fontSize: "14px",
              marginBottom: "20px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
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
