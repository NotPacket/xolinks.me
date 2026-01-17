"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

const CATEGORIES = [
  { id: "general", name: "General Question" },
  { id: "bug", name: "Bug Report" },
  { id: "feature", name: "Feature Request" },
  { id: "billing", name: "Billing Issue" },
  { id: "account", name: "Account Help" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
  in_progress: { bg: "rgba(251, 191, 36, 0.2)", text: "#fbbf24" },
  resolved: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
  closed: { bg: "rgba(107, 114, 128, 0.2)", text: "#6b7280" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(107, 114, 128, 0.2)", text: "#6b7280" },
  medium: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
  high: { bg: "rgba(251, 191, 36, 0.2)", text: "#fbbf24" },
  urgent: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" },
};

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "general",
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/support");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit ticket");
        return;
      }

      setSuccess(true);
      setFormData({ subject: "", message: "", category: "general" });
      fetchTickets();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const cardStyle = {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    border: "1px solid #374151",
    borderRadius: "16px",
    padding: "24px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    border: "1px solid #374151",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      color: "#fff"
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(55, 65, 81, 0.5)",
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/dashboard" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>
              &larr; Dashboard
            </Link>
            <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Help & Support</h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Submit New Ticket */}
        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            Submit a Support Request
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "20px" }}>
            Have a question or need help? We&apos;re here to assist you.
          </p>

          {success ? (
            <div style={{
              padding: "20px",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#22c55e" }}>
                Ticket Submitted!
              </h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
                We&apos;ve received your request and will respond within 24-48 hours.
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
                  cursor: "pointer"
                }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#d1d5db", marginBottom: "8px" }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#d1d5db", marginBottom: "8px" }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                  maxLength={200}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#d1d5db", marginBottom: "8px" }}>
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your issue in detail..."
                  required
                  rows={5}
                  maxLength={10000}
                  style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
                />
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                  {formData.message.length}/10000 characters
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
                  marginBottom: "16px"
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "14px 24px",
                  background: "linear-gradient(to right, #9333ea, #3b82f6)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          )}
        </div>

        {/* Previous Tickets */}
        {tickets.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
              Your Support Tickets
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    padding: "16px",
                    backgroundColor: "rgba(31, 41, 55, 0.5)",
                    border: "1px solid #374151",
                    borderRadius: "12px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: "500", flex: 1 }}>
                      {ticket.subject}
                    </h3>
                    <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap", marginLeft: "12px" }}>
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: STATUS_COLORS[ticket.status]?.bg || "rgba(107, 114, 128, 0.2)",
                      color: STATUS_COLORS[ticket.status]?.text || "#6b7280",
                      fontSize: "12px",
                      fontWeight: "500",
                      borderRadius: "50px",
                      textTransform: "capitalize"
                    }}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: PRIORITY_COLORS[ticket.priority]?.bg || "rgba(107, 114, 128, 0.2)",
                      color: PRIORITY_COLORS[ticket.priority]?.text || "#6b7280",
                      fontSize: "12px",
                      fontWeight: "500",
                      borderRadius: "50px",
                      textTransform: "capitalize"
                    }}>
                      {ticket.priority}
                    </span>
                    <span style={{
                      padding: "4px 10px",
                      backgroundColor: "rgba(107, 114, 128, 0.2)",
                      color: "#9ca3af",
                      fontSize: "12px",
                      borderRadius: "50px",
                      textTransform: "capitalize"
                    }}>
                      {ticket.category}
                    </span>
                  </div>

                  {ticket.resolvedAt && (
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
                      Resolved on {formatDate(ticket.resolvedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div style={{ ...cardStyle, marginTop: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              {
                q: "How do I change my username?",
                a: "Go to Settings and update your username. Note that you can only change it once per month."
              },
              {
                q: "How do I verify my social links?",
                a: "Connect your social accounts through OAuth from the Dashboard. Verified links show a checkmark badge."
              },
              {
                q: "What are Pro features?",
                a: "Pro users get custom fonts, advanced analytics, priority support, and more themes. Visit the Upgrade page to learn more."
              },
              {
                q: "How do I delete my account?",
                a: "Go to Settings and scroll to the bottom. Click 'Delete Account' and confirm. This action cannot be undone."
              },
            ].map((faq, i) => (
              <div key={i} style={{ padding: "16px", backgroundColor: "rgba(31, 41, 55, 0.5)", borderRadius: "10px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#d1d5db" }}>
                  {faq.q}
                </h4>
                <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: "1.6" }}>
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
