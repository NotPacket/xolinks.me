"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  user: {
    id: string;
    username: string;
    displayName: string | null;
  };
  flaggedBy: {
    id: string;
    username: string;
  } | null;
  resolvedBy: {
    id: string;
    username: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const inputStyle = {
  padding: "10px 16px",
  backgroundColor: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "14px",
  outline: "none"
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "rgba(251, 191, 36, 0.2)", text: "#fbbf24" },
  reviewing: { bg: "rgba(96, 165, 250, 0.2)", text: "#60a5fa" },
  resolved: { bg: "rgba(34, 197, 94, 0.2)", text: "#4ade80" },
  dismissed: { bg: "rgba(107, 114, 128, 0.2)", text: "#9ca3af" },
};

const reasonLabels: Record<string, string> = {
  spam: "Spam or misleading",
  inappropriate: "Inappropriate content",
  impersonation: "Impersonation",
  scam: "Scam or fraud",
  harassment: "Harassment",
  other: "Other",
};

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [updating, setUpdating] = useState(false);
  const [actionResult, setActionResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const ACTION_OPTIONS = [
    { id: "warn", label: "Send Warning", description: "Send a warning to the user", color: "#fbbf24" },
    { id: "suspend_7d", label: "Suspend 7 Days", description: "Temporarily suspend user for 7 days", color: "#f97316" },
    { id: "suspend_30d", label: "Suspend 30 Days", description: "Temporarily suspend user for 30 days", color: "#ef4444" },
    { id: "ban", label: "Ban User", description: "Permanently ban the user", color: "#dc2626" },
    { id: "delete_links", label: "Delete All Links", description: "Remove all user's links (cannot be undone)", color: "#8b5cf6" },
    { id: "reset_profile", label: "Reset Profile", description: "Clear bio, avatar, and display name (cannot be undone)", color: "#6366f1" },
  ];

  const UNDO_OPTIONS = [
    { id: "unsuspend", label: "Remove Suspension", description: "Restore user access", color: "#4ade80" },
    { id: "unban", label: "Unban User", description: "Remove permanent ban", color: "#22c55e" },
  ];

  const fetchReports = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/admin/reports?${params}`);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          setError("Access denied. Admin privileges required.");
          return;
        }

        const data = await res.json();
        setReports(data.reports);
        setPagination(data.pagination);
      } catch {
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, router]
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId: string, newStatus: string, action?: string) => {
    setUpdating(true);
    setActionResult(null);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status: newStatus,
          resolution: resolution || undefined,
          action: action || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setActionResult({ type: "success", message: data.message || "Action completed successfully" });
        setTimeout(() => {
          setSelectedReport(null);
          setResolution("");
          setSelectedAction("");
          setActionResult(null);
          fetchReports(pagination?.page || 1);
        }, 1500);
      } else {
        setActionResult({ type: "error", message: data.error || "Failed to process action" });
      }
    } catch {
      setActionResult({ type: "error", message: "Something went wrong" });
    } finally {
      setUpdating(false);
    }
  };

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#030712",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "64px",
            height: "64px",
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p style={{ color: "#f87171", fontSize: "18px", marginBottom: "16px" }}>{error}</p>
          <Link href="/dashboard" style={{ color: "#a855f7", textDecoration: "none" }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030712", color: "#fff" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1f2937",
        backgroundColor: "rgba(17, 24, 39, 0.8)",
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
            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Reports</h1>
            {pagination && (
              <span style={{
                padding: "4px 12px",
                backgroundColor: statusFilter === "pending" ? "rgba(251, 191, 36, 0.2)" : "rgba(75, 85, 99, 0.3)",
                color: statusFilter === "pending" ? "#fbbf24" : "#9ca3af",
                fontSize: "12px",
                borderRadius: "50px",
                fontWeight: "500"
              }}>
                {pagination.total} {statusFilter || "total"}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link href="/xo-backstage" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>
              Dashboard
            </Link>
            <Link href="/xo-backstage/users" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>
              Users
            </Link>
            <Link href="/dashboard" style={{
              padding: "8px 16px",
              backgroundColor: "rgba(168, 85, 247, 0.2)",
              color: "#a855f7",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px"
            }}>
              Back to App
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
          {["pending", "reviewing", "resolved", "dismissed", ""].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: "10px 20px",
                backgroundColor: statusFilter === status ? "rgba(168, 85, 247, 0.2)" : "rgba(31, 41, 55, 0.5)",
                border: `1px solid ${statusFilter === status ? "#a855f7" : "#374151"}`,
                borderRadius: "10px",
                color: statusFilter === status ? "#a855f7" : "#d1d5db",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div style={{
          backgroundColor: "rgba(17, 24, 39, 0.6)",
          border: "1px solid #374151",
          borderRadius: "16px",
          overflow: "hidden"
        }}>
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>
              <div style={{
                width: "32px",
                height: "32px",
                border: "3px solid #374151",
                borderTop: "3px solid #a855f7",
                borderRadius: "50%",
                margin: "0 auto 12px",
                animation: "spin 1s linear infinite"
              }} />
              Loading reports...
              <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            </div>
          ) : reports.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p style={{ color: "#4ade80", fontSize: "18px", marginBottom: "8px" }}>All clear!</p>
              <p style={{ color: "#6b7280" }}>No {statusFilter} reports to review</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {reports.map((report, idx) => (
                  <div
                    key={report.id}
                    style={{
                      padding: "20px 24px",
                      borderTop: idx > 0 ? "1px solid #374151" : "none",
                      transition: "background-color 0.2s",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                          <span style={{
                            padding: "4px 12px",
                            backgroundColor: statusColors[report.status]?.bg || "rgba(75, 85, 99, 0.3)",
                            color: statusColors[report.status]?.text || "#9ca3af",
                            fontSize: "12px",
                            borderRadius: "50px",
                            fontWeight: "500",
                            textTransform: "capitalize"
                          }}>
                            {report.status}
                          </span>
                          <span style={{
                            padding: "4px 12px",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "#f87171",
                            fontSize: "12px",
                            borderRadius: "50px"
                          }}>
                            {reasonLabels[report.reason] || report.reason}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ color: "#9ca3af", fontSize: "14px" }}>Reported user:</span>
                          <Link
                            href={`/@${report.user.username}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "#a855f7", textDecoration: "none", fontWeight: "500" }}
                          >
                            @{report.user.username}
                          </Link>
                        </div>
                        {report.description && (
                          <p style={{
                            color: "#d1d5db",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            backgroundColor: "rgba(31, 41, 55, 0.5)",
                            padding: "12px",
                            borderRadius: "8px",
                            marginTop: "8px"
                          }}>
                            {report.description}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ color: "#6b7280", fontSize: "13px" }}>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                        <p style={{ color: "#6b7280", fontSize: "12px" }}>
                          {new Date(report.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderTop: "1px solid #374151"
                }}>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} reports
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => fetchReports(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#374151",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                        opacity: pagination.page === 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>
                    <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => fetchReports(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#374151",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: pagination.page === pagination.pages ? "not-allowed" : "pointer",
                        opacity: pagination.page === pagination.pages ? 0.5 : 1
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }}
          onClick={() => { setSelectedReport(null); setSelectedAction(""); setResolution(""); setActionResult(null); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              border: "1px solid #374151",
              borderRadius: "16px",
              padding: "24px",
              maxHeight: "90vh",
              overflow: "auto"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Review Report</h3>
              <button
                onClick={() => { setSelectedReport(null); setSelectedAction(""); setResolution(""); setActionResult(null); }}
                style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span style={{
                  padding: "4px 12px",
                  backgroundColor: statusColors[selectedReport.status]?.bg || "rgba(75, 85, 99, 0.3)",
                  color: statusColors[selectedReport.status]?.text || "#9ca3af",
                  fontSize: "12px",
                  borderRadius: "50px",
                  fontWeight: "500",
                  textTransform: "capitalize"
                }}>
                  {selectedReport.status}
                </span>
                <span style={{
                  padding: "4px 12px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#f87171",
                  fontSize: "12px",
                  borderRadius: "50px"
                }}>
                  {reasonLabels[selectedReport.reason] || selectedReport.reason}
                </span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "4px" }}>Reported User</p>
                <Link
                  href={`/@${selectedReport.user.username}`}
                  target="_blank"
                  style={{ color: "#a855f7", textDecoration: "none", fontSize: "16px", fontWeight: "500" }}
                >
                  @{selectedReport.user.username}
                </Link>
                {selectedReport.user.displayName && (
                  <span style={{ color: "#6b7280", marginLeft: "8px" }}>
                    ({selectedReport.user.displayName})
                  </span>
                )}
              </div>

              {selectedReport.description && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "4px" }}>Description</p>
                  <p style={{
                    color: "#d1d5db",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    backgroundColor: "rgba(31, 41, 55, 0.5)",
                    padding: "12px",
                    borderRadius: "8px"
                  }}>
                    {selectedReport.description}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "#6b7280" }}>
                <span>Reported: {new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {selectedReport.status === "pending" || selectedReport.status === "reviewing" ? (
              <>
                {/* Action Result Message */}
                {actionResult && (
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    backgroundColor: actionResult.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${actionResult.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                    color: actionResult.type === "success" ? "#4ade80" : "#f87171",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    {actionResult.type === "success" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                    {actionResult.message}
                  </div>
                )}

                {/* Action Selection */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", color: "#d1d5db", marginBottom: "10px", fontWeight: "500" }}>
                    Select Action
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {ACTION_OPTIONS.map((action) => (
                      <label
                        key={action.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 14px",
                          backgroundColor: selectedAction === action.id ? `${action.color}15` : "rgba(31, 41, 55, 0.5)",
                          border: `1px solid ${selectedAction === action.id ? action.color : "#374151"}`,
                          borderRadius: "10px",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        <input
                          type="radio"
                          name="action"
                          value={action.id}
                          checked={selectedAction === action.id}
                          onChange={(e) => setSelectedAction(e.target.value)}
                          style={{ accentColor: action.color }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "14px", color: "#fff", fontWeight: "500", marginBottom: "2px" }}>
                            {action.label}
                          </p>
                          <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                            {action.description}
                          </p>
                        </div>
                        <div style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: action.color
                        }} />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Resolution Notes */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", color: "#d1d5db", marginBottom: "8px" }}>
                    Resolution Notes (optional)
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                    style={{
                      ...inputStyle,
                      width: "100%",
                      resize: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "resolved", selectedAction)}
                    disabled={updating || !selectedAction}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: selectedAction && !updating ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "#374151",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                      fontWeight: "600",
                      cursor: updating || !selectedAction ? "not-allowed" : "pointer",
                      opacity: updating || !selectedAction ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {updating ? (
                      <>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        Apply Action
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "dismissed")}
                    disabled={updating}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "rgba(75, 85, 99, 0.3)",
                      border: "1px solid #4b5563",
                      borderRadius: "10px",
                      color: "#d1d5db",
                      fontWeight: "500",
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.7 : 1
                    }}
                  >
                    Dismiss Report
                  </button>
                </div>

                <style>{`
                  @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
              </>
            ) : (
              <>
                {/* Action Result Message */}
                {actionResult && (
                  <div style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    backgroundColor: actionResult.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${actionResult.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                    color: actionResult.type === "success" ? "#4ade80" : "#f87171",
                    fontSize: "14px"
                  }}>
                    {actionResult.message}
                  </div>
                )}

                <div style={{
                  padding: "16px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  borderRadius: "10px",
                  marginBottom: "16px"
                }}>
                  <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "4px" }}>Resolution</p>
                  <p style={{ color: "#d1d5db" }}>
                    {selectedReport.resolution || "No notes provided"}
                  </p>
                  {selectedReport.resolvedBy && (
                    <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "8px" }}>
                      Resolved by @{selectedReport.resolvedBy.username}
                    </p>
                  )}
                </div>

                {/* Undo Actions */}
                {selectedReport.status === "resolved" && (
                  <div>
                    <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "12px" }}>
                      Reverse Actions (if user was suspended/banned)
                    </p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {UNDO_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleUpdateStatus(selectedReport.id, "resolved", option.id)}
                          disabled={updating}
                          style={{
                            padding: "10px 16px",
                            backgroundColor: `${option.color}15`,
                            border: `1px solid ${option.color}50`,
                            borderRadius: "8px",
                            color: option.color,
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: updating ? "not-allowed" : "pointer",
                            opacity: updating ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                          {option.label}
                        </button>
                      ))}
                      <button
                        onClick={() => handleUpdateStatus(selectedReport.id, "pending")}
                        disabled={updating}
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "rgba(251, 191, 36, 0.1)",
                          border: "1px solid rgba(251, 191, 36, 0.3)",
                          borderRadius: "8px",
                          color: "#fbbf24",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: updating ? "not-allowed" : "pointer",
                          opacity: updating ? 0.7 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Reopen Report
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
