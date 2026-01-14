"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          setTimeout(() => router.push("/dashboard?verified=true"), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

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
      {status === "loading" && (
        <>
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
            Verifying your email...
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "15px" }}>
            Please wait a moment.
          </p>
        </>
      )}

      {status === "success" && (
        <>
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
          <h1 style={{ color: "#4ade80", fontSize: "22px", fontWeight: "600", marginBottom: "8px" }}>
            Email Verified!
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "24px" }}>
            {message}
          </p>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Redirecting to dashboard...
          </p>
        </>
      )}

      {status === "error" && (
        <>
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
          <h1 style={{ color: "#f87171", fontSize: "22px", fontWeight: "600", marginBottom: "8px" }}>
            Verification Failed
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "24px" }}>
            {message}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link
              href="/dashboard"
              style={{
                display: "block",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #9333ea, #3b82f6)",
                borderRadius: "10px",
                color: "#fff",
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Go to Dashboard
            </Link>
            <Link
              href="/login"
              style={{
                display: "block",
                padding: "12px 24px",
                backgroundColor: "rgba(75, 85, 99, 0.3)",
                border: "1px solid #4b5563",
                borderRadius: "10px",
                color: "#d1d5db",
                textDecoration: "none"
              }}
            >
              Back to Login
            </Link>
          </div>
        </>
      )}
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

export default function VerifyEmailPage() {
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
        <VerifyEmailContent />
      </Suspense>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
