"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  subscriptionTier: string;
}

interface Resolver {
  id: string;
  username: string;
  displayName: string | null;
}

interface Ticket {
  id: string;
  email: string;
  name: string | null;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  user: User | null;
  resolver: Resolver | null;
}

interface Stats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: "rgba(59, 130, 246, 0.1)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
  in_progress: { bg: "rgba(251, 191, 36, 0.1)", text: "#fbbf24", border: "rgba(251, 191, 36, 0.3)" },
  resolved: { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e", border: "rgba(34, 197, 94, 0.3)" },
  closed: { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280", border: "rgba(107, 114, 128, 0.3)" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(107, 114, 128, 0.2)", text: "#6b7280" },
  medium: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
  high: { bg: "rgba(251, 191, 36, 0.2)", text: "#fbbf24" },
  urgent: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" },
};

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats>({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);

      const res = await fetch(`/api/admin/support?${params}`);
      if (res.status === 401 || res.status === 403) {
        router.push("/dashboard");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicket = async (ticketId: string, updates: Record<string, string>) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, ...updates }),
      });

      if (res.ok) {
        const data = await res.json();
        setTickets(tickets.map((t) => (t.id === ticketId ? data.ticket : t)));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
        fetchTickets(); // Refresh stats
      }
    } catch (err) {
      console.error("Error updating ticket:", err);
    } finally {
      setUpdating(false);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!confirm("Delete this ticket permanently?")) return;

    try {
      const res = await fetch(`/api/admin/support?id=${ticketId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTickets(tickets.filter((t) => t.id !== ticketId));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
        fetchTickets();
      }
    } catch (err) {
      console.error("Error deleting ticket:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cardStyle = {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    border: "1px solid #374151",
    borderRadius: "16px",
    padding: "24px",
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
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/xo-backstage" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>
              &larr; Control Panel
            </Link>
            <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Support Tickets</h1>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { key: "open", label: "Open", color: STATUS_COLORS.open },
            { key: "in_progress", label: "In Progress", color: STATUS_COLORS.in_progress },
            { key: "resolved", label: "Resolved", color: STATUS_COLORS.resolved },
            { key: "closed", label: "Closed", color: STATUS_COLORS.closed },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(filter === item.key ? "" : item.key)}
              style={{
                padding: "20px",
                backgroundColor: filter === item.key ? item.color.bg : "rgba(17, 24, 39, 0.6)",
                border: `1px solid ${filter === item.key ? item.color.border : "#374151"}`,
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <p style={{ fontSize: "32px", fontWeight: "bold", color: item.color.text, marginBottom: "4px" }}>
                {stats[item.key as keyof Stats]}
              </p>
              <p style={{ fontSize: "14px", color: "#9ca3af" }}>{item.label}</p>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedTicket ? "1fr 1fr" : "1fr", gap: "24px" }}>
          {/* Ticket List */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
              {filter ? `${filter.replace("_", " ")} Tickets` : "All Tickets"}
              {filter && (
                <button
                  onClick={() => setFilter("")}
                  style={{
                    marginLeft: "12px",
                    padding: "4px 8px",
                    backgroundColor: "rgba(107, 114, 128, 0.2)",
                    border: "none",
                    borderRadius: "4px",
                    color: "#9ca3af",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Clear
                </button>
              )}
            </h2>

            {tickets.length === 0 ? (
              <p style={{ color: "#6b7280", textAlign: "center", padding: "40px 0" }}>
                No tickets found.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "16px",
                      backgroundColor: selectedTicket?.id === ticket.id
                        ? "rgba(168, 85, 247, 0.1)"
                        : "rgba(31, 41, 55, 0.5)",
                      border: selectedTicket?.id === ticket.id
                        ? "1px solid rgba(168, 85, 247, 0.3)"
                        : "1px solid transparent",
                      borderRadius: "10px",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "500", fontSize: "14px" }}>{ticket.subject}</span>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>{formatDate(ticket.createdAt)}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{
                        padding: "3px 8px",
                        backgroundColor: STATUS_COLORS[ticket.status]?.bg,
                        color: STATUS_COLORS[ticket.status]?.text,
                        fontSize: "11px",
                        fontWeight: "500",
                        borderRadius: "50px",
                        textTransform: "capitalize"
                      }}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span style={{
                        padding: "3px 8px",
                        backgroundColor: PRIORITY_COLORS[ticket.priority]?.bg,
                        color: PRIORITY_COLORS[ticket.priority]?.text,
                        fontSize: "11px",
                        fontWeight: "500",
                        borderRadius: "50px",
                        textTransform: "capitalize"
                      }}>
                        {ticket.priority}
                      </span>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>
                        {ticket.user ? `@${ticket.user.username}` : ticket.email}
                      </span>
                      {ticket.user?.subscriptionTier === "pro" && (
                        <span style={{
                          padding: "2px 6px",
                          background: "linear-gradient(to right, #9333ea, #3b82f6)",
                          fontSize: "10px",
                          fontWeight: "600",
                          borderRadius: "4px"
                        }}>
                          PRO
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Detail */}
          {selectedTicket && (
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                    {selectedTicket.subject}
                  </h2>
                  <p style={{ color: "#6b7280", fontSize: "12px" }}>
                    Ticket #{selectedTicket.id.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontSize: "20px"
                  }}
                >
                  &times;
                </button>
              </div>

              {/* From */}
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "rgba(31, 41, 55, 0.5)", borderRadius: "8px" }}>
                <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "4px" }}>From</p>
                <p style={{ fontSize: "14px" }}>
                  {selectedTicket.name || selectedTicket.user?.displayName || "Anonymous"}
                </p>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>{selectedTicket.email}</p>
                {selectedTicket.user && (
                  <p style={{ fontSize: "13px", color: "#a855f7", marginTop: "4px" }}>
                    @{selectedTicket.user.username} ({selectedTicket.user.subscriptionTier})
                  </p>
                )}
              </div>

              {/* Message */}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "8px" }}>Message</p>
                <div style={{
                  padding: "16px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  borderRadius: "8px",
                  maxHeight: "200px",
                  overflow: "auto"
                }}>
                  <p style={{ fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {selectedTicket.message}
                  </p>
                </div>
              </div>

              {/* Status & Priority Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                    Status
                  </label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicket(selectedTicket.id, { status: e.target.value })}
                    disabled={updating}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "rgba(31, 41, 55, 0.8)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                    Priority
                  </label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => updateTicket(selectedTicket.id, { priority: e.target.value })}
                    disabled={updating}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "rgba(31, 41, 55, 0.8)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
                  Admin Notes (internal)
                </label>
                <textarea
                  defaultValue={selectedTicket.adminNotes || ""}
                  onBlur={(e) => {
                    if (e.target.value !== (selectedTicket.adminNotes || "")) {
                      updateTicket(selectedTicket.id, { adminNotes: e.target.value });
                    }
                  }}
                  rows={3}
                  placeholder="Add internal notes..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "rgba(31, 41, 55, 0.8)",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                    resize: "vertical",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px" }}>
                <a
                  href={`mailto:${selectedTicket.email}?subject=Re: ${selectedTicket.subject}`}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "linear-gradient(to right, #9333ea, #3b82f6)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                    textAlign: "center"
                  }}
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => deleteTicket(selectedTicket.id)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "10px",
                    color: "#f87171",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>

              {selectedTicket.resolvedAt && (
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "12px", textAlign: "center" }}>
                  Resolved on {new Date(selectedTicket.resolvedAt).toLocaleString()}
                  {selectedTicket.resolver && ` by @${selectedTicket.resolver.username}`}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
