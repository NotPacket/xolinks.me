"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchMessages = useCallback(async (page = 1) => {
    try {
      const res = await fetch(`/api/user/messages?page=${page}&filter=${filter}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch messages");
      }
      const data = await res.json();
      setMessages(data.messages);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleAction = async (action: string, ids?: string[]) => {
    const messageIds = ids || Array.from(selectedIds);
    if (messageIds.length === 0) return;

    try {
      const res = await fetch("/api/user/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds, action }),
      });

      if (res.ok) {
        fetchMessages(pagination?.page || 1);
        setSelectedIds(new Set());
        if (selectedMessage && messageIds.includes(selectedMessage.id)) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error("Error updating messages:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;

    try {
      const res = await fetch(`/api/user/messages?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchMessages(pagination?.page || 1);
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const openMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      handleAction("markRead", [msg.id]);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
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
          maxWidth: "1000px",
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
            <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Messages</h1>
            {unreadCount > 0 && (
              <span style={{
                padding: "4px 10px",
                backgroundColor: "rgba(168, 85, 247, 0.2)",
                color: "#a855f7",
                fontSize: "13px",
                borderRadius: "50px",
                fontWeight: "500"
              }}>
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {(["all", "unread", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setSelectedIds(new Set());
                setSelectedMessage(null);
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: filter === f ? "rgba(168, 85, 247, 0.2)" : "rgba(31, 41, 55, 0.5)",
                border: filter === f ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid #374151",
                borderRadius: "10px",
                color: filter === f ? "#a855f7" : "#9ca3af",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {messages.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "60px 24px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "rgba(107, 114, 128, 0.2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>No Messages</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>
              {filter === "all" && "Messages from your profile contact form will appear here."}
              {filter === "unread" && "You have no unread messages."}
              {filter === "archived" && "You have no archived messages."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: selectedMessage ? "1fr 1fr" : "1fr", gap: "24px" }}>
            {/* Message List */}
            <div style={cardStyle}>
              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  borderRadius: "10px"
                }}>
                  <span style={{ color: "#9ca3af", fontSize: "14px", marginRight: "auto" }}>
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={() => handleAction("markRead")}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "rgba(168, 85, 247, 0.2)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#a855f7",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => handleAction(filter === "archived" ? "unarchive" : "archive")}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "rgba(107, 114, 128, 0.2)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#9ca3af",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    {filter === "archived" ? "Unarchive" : "Archive"}
                  </button>
                </div>
              )}

              {/* Messages */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px",
                      backgroundColor: selectedMessage?.id === msg.id
                        ? "rgba(168, 85, 247, 0.1)"
                        : msg.isRead
                        ? "rgba(31, 41, 55, 0.3)"
                        : "rgba(31, 41, 55, 0.6)",
                      border: selectedMessage?.id === msg.id
                        ? "1px solid rgba(168, 85, 247, 0.3)"
                        : "1px solid transparent",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(msg.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSelected = new Set(selectedIds);
                        if (e.target.checked) {
                          newSelected.add(msg.id);
                        } else {
                          newSelected.delete(msg.id);
                        }
                        setSelectedIds(newSelected);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginTop: "4px", cursor: "pointer" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{
                          fontWeight: msg.isRead ? "400" : "600",
                          fontSize: "14px",
                          color: msg.isRead ? "#d1d5db" : "#fff"
                        }}>
                          {msg.senderName}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      {msg.subject && (
                        <p style={{
                          fontSize: "13px",
                          color: msg.isRead ? "#9ca3af" : "#d1d5db",
                          fontWeight: msg.isRead ? "400" : "500",
                          marginBottom: "2px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {msg.subject}
                        </p>
                      )}
                      <p style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {msg.message.slice(0, 80)}...
                      </p>
                    </div>
                    {!msg.isRead && (
                      <div style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#a855f7",
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: "6px"
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "20px"
                }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => fetchMessages(i + 1)}
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: pagination.page === i + 1 ? "rgba(168, 85, 247, 0.2)" : "transparent",
                        border: pagination.page === i + 1 ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid #374151",
                        borderRadius: "6px",
                        color: pagination.page === i + 1 ? "#a855f7" : "#9ca3af",
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message Detail */}
            {selectedMessage && (
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                      {selectedMessage.subject || "No Subject"}
                    </h3>
                    <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                      From: {selectedMessage.senderName} &lt;{selectedMessage.senderEmail}&gt;
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "4px" }}>
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
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

                <div style={{
                  padding: "20px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  borderRadius: "12px",
                  marginBottom: "20px"
                }}>
                  <p style={{ color: "#d1d5db", fontSize: "15px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>
                    {selectedMessage.message}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <a
                    href={`mailto:${selectedMessage.senderEmail}?subject=Re: ${selectedMessage.subject || "Your message"}`}
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
                    onClick={() => handleAction(selectedMessage.isArchived ? "unarchive" : "archive", [selectedMessage.id])}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "rgba(31, 41, 55, 0.5)",
                      border: "1px solid #374151",
                      borderRadius: "10px",
                      color: "#9ca3af",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    {selectedMessage.isArchived ? "Unarchive" : "Archive"}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
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
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
