"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Theme } from "@/lib/themes/config";

interface ReportModalProps {
  username: string;
  theme: Theme;
}

const REPORT_REASONS = [
  { id: "spam", label: "Spam or misleading content" },
  { id: "inappropriate", label: "Inappropriate or offensive content" },
  { id: "impersonation", label: "Impersonation" },
  { id: "scam", label: "Scam or fraudulent links" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "other", label: "Other" },
];

export default function ReportModal({ username, theme }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          reason,
          description: description || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", message: data.error || "Failed to submit report" });
        return;
      }

      setResult({ type: "success", message: "Report submitted. Thank you for helping keep our community safe." });
      setReason("");
      setDescription("");
    } catch {
      setResult({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setReason("");
    setDescription("");
    setResult(null);
  };

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          color: theme.textSecondary,
          fontSize: "13px",
          cursor: "pointer",
          transition: "all 0.2s",
          marginTop: "16px",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
          e.currentTarget.style.color = "#f87171";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.color = theme.textSecondary;
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        Report
      </button>

      {/* Modal Overlay - Rendered via Portal to escape stacking context */}
      {mounted && isOpen && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={handleClose}
        >
          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "rgba(17, 24, 39, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "24px",
              animation: "modal-appear 0.2s ease",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>Report @{username}</h3>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Result Message */}
            {result && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  backgroundColor: result.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${result.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                  color: result.type === "success" ? "#4ade80" : "#f87171",
                  fontSize: "14px",
                }}
              >
                {result.message}
              </div>
            )}

            {!result?.type || result.type === "error" ? (
              <form onSubmit={handleSubmit}>
                {/* Reason Selection */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#d1d5db", marginBottom: "10px" }}>
                    Why are you reporting this profile?
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          background: reason === r.id ? "rgba(139, 92, 246, 0.1)" : "rgba(255, 255, 255, 0.05)",
                          border: `1px solid ${reason === r.id ? "rgba(139, 92, 246, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                          borderRadius: "10px",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.id}
                          checked={reason === r.id}
                          onChange={(e) => setReason(e.target.value)}
                          style={{ accentColor: "#8b5cf6" }}
                        />
                        <span style={{ fontSize: "14px", color: "#e5e7eb" }}>{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#d1d5db", marginBottom: "8px" }}>
                    Additional details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide any additional context..."
                    maxLength={500}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "14px",
                      resize: "none",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!reason || submitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: reason && !submitting ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "#374151",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: reason && !submitting ? "pointer" : "not-allowed",
                    opacity: !reason || submitting ? 0.6 : 1,
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </form>
            ) : (
              <button
                onClick={handleClose}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            )}
          </div>
          <style>{`
            @keyframes modal-appear {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}
