"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthBackground from "@/components/AuthBackground";

function VerifyLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const displayEmail = searchParams.get("display") || email;
  const tokenFromUrl = searchParams.get("token");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-verify if token is in URL
  useEffect(() => {
    if (tokenFromUrl) {
      verifyWithToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const verifyWithToken = async (token: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newCode.every((digit) => digit)) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const finalCode = codeString || code.join("");

    if (finalCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: finalCode, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
          textAlign: "center"
        }}>
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#fff", marginBottom: "8px" }}>
            Login Verified!
          </h1>
          <p style={{ color: "#9ca3af" }}>
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

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

        {/* Icon */}
        <div style={{
          width: "64px",
          height: "64px",
          margin: "0 auto 24px",
          backgroundColor: "rgba(168, 85, 247, 0.2)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#fff",
          textAlign: "center",
          marginBottom: "8px"
        }}>Verify Your Login</h1>

        <p style={{
          color: "#9ca3af",
          textAlign: "center",
          marginBottom: "8px"
        }}>
          We sent a verification code to
        </p>
        <p style={{
          color: "#a855f7",
          textAlign: "center",
          marginBottom: "32px",
          fontWeight: "500"
        }}>
          {displayEmail || "your email"}
        </p>

        {/* Code Input */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "24px"
        }}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={loading}
              style={{
                width: "48px",
                height: "56px",
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "bold",
                backgroundColor: "#1f2937",
                border: digit ? "2px solid #a855f7" : "1px solid #374151",
                borderRadius: "12px",
                color: "#fff",
                outline: "none",
                transition: "border-color 0.2s"
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            color: "#f87171",
            fontSize: "14px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <button
          onClick={() => handleSubmit()}
          disabled={loading || code.some((d) => !d)}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(to right, #9333ea, #3b82f6)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading || code.some((d) => !d) ? "not-allowed" : "pointer",
            opacity: loading || code.some((d) => !d) ? 0.7 : 1
          }}
        >
          {loading ? "Verifying..." : "Verify Login"}
        </button>

        <div style={{
          textAlign: "center",
          marginTop: "24px",
          paddingTop: "24px",
          borderTop: "1px solid #374151"
        }}>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "12px" }}>
            Didn&apos;t receive the code? Check your spam folder or
          </p>
          <Link href="/login" style={{
            color: "#a855f7",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500"
          }}>
            Try logging in again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyLoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        color: "#fff"
      }}>
        Loading...
      </div>
    }>
      <VerifyLoginForm />
    </Suspense>
  );
}
