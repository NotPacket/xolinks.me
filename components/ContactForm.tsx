"use client";

import { useState } from "react";

interface ContactFormProps {
  username: string;
  displayName?: string | null;
}

export default function ContactForm({ username, displayName }: ContactFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUsername: username,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send message");
        return;
      }

      setSuccess(true);
      setFormData({ senderName: "", senderEmail: "", subject: "", message: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    border: "1px solid rgba(55, 65, 81, 0.5)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500" as const,
    color: "#d1d5db",
    marginBottom: "6px",
  };

  if (success) {
    return (
      <div style={{
        padding: "24px",
        backgroundColor: "rgba(17, 24, 39, 0.6)",
        borderRadius: "16px",
        border: "1px solid rgba(55, 65, 81, 0.5)",
        textAlign: "center",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "#fff" }}>
          Message Sent!
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
          Your message has been sent to {displayName || `@${username}`}.
        </p>
        <button
          onClick={() => setSuccess(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: "rgba(168, 85, 247, 0.2)",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            borderRadius: "8px",
            color: "#a855f7",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "rgba(17, 24, 39, 0.6)",
      borderRadius: "16px",
      border: "1px solid rgba(55, 65, 81, 0.5)",
    }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(to right, #9333ea, #3b82f6)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Contact {displayName || `@${username}`}
        </button>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#fff" }}>
              Send a Message
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                fontSize: "20px",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="John Doe"
                  required
                  maxLength={100}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Your Email *</label>
                <input
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What's this about?"
                maxLength={200}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Write your message here..."
                required
                maxLength={5000}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "100px",
                }}
              />
              <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                {formData.message.length}/5000 characters
              </p>
            </div>

            {error && (
              <div style={{
                padding: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "#f87171",
                fontSize: "14px",
                marginBottom: "16px",
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
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
