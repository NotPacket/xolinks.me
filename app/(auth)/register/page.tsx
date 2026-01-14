"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthBackground from "@/components/AuthBackground";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    displayName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box" as const
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#d1d5db",
    marginBottom: "8px"
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
        }}>Create Account</h1>
        <p style={{
          color: "#9ca3af",
          textAlign: "center",
          marginBottom: "32px"
        }}>Join xolinks.me and create your link page</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Username</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280"
              }}>@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder="yourname"
                required
                style={{ ...inputStyle, paddingLeft: "36px" }}
              />
            </div>
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#6b7280" }}>
              xolinks.me/@{formData.username || "yourname"}
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your Name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 8 characters"
              required
              style={inputStyle}
            />
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          color: "#9ca3af",
          marginTop: "24px",
          fontSize: "14px"
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#a855f7", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
