"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  subscriptionTier: string;
  isFeatured: boolean;
  totalProfileViews: number;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    links: number;
    platformConnections: number;
    linkClicks: number;
  };
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

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (search) params.set("search", search);
        if (roleFilter) params.set("role", roleFilter);

        const res = await fetch(`/api/admin/users?${params}`);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          setError("Access denied");
          return;
        }

        const data = await res.json();
        let filteredUsers = data.users;

        // Client-side featured filter
        if (featuredFilter === "featured") {
          filteredUsers = filteredUsers.filter((u: User) => u.isFeatured);
        } else if (featuredFilter === "not-featured") {
          filteredUsers = filteredUsers.filter((u: User) => !u.isFeatured);
        }

        setUsers(filteredUsers);
        setPagination(data.pagination);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter, featuredFilter, router]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, updates: { role: newRole } }),
    });

    if (res.ok) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setEditingUser(null);
    }
  };

  const handleToggleFeatured = async (userId: string, currentStatus: boolean) => {
    setTogglingFeatured(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates: { isFeatured: !currentStatus } }),
      });

      if (res.ok) {
        setUsers(users.map((u) =>
          u.id === userId ? { ...u, isFeatured: !currentStatus } : u
        ));
      }
    } finally {
      setTogglingFeatured(null);
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
          <p style={{ color: "#f87171", fontSize: "18px", marginBottom: "16px" }}>{error}</p>
          <Link href="/dashboard" style={{ color: "#a855f7", textDecoration: "none" }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const featuredCount = users.filter(u => u.isFeatured).length;

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
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>User Management</h1>
            {featuredCount > 0 && (
              <span style={{
                padding: "4px 12px",
                backgroundColor: "rgba(251, 191, 36, 0.2)",
                color: "#fbbf24",
                fontSize: "12px",
                borderRadius: "50px",
                fontWeight: "500"
              }}>
                {featuredCount} Featured
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link href="/xo-backstage" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>
              Dashboard
            </Link>
            <Link href="/xo-backstage/reports" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>
              Reports
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
        {/* Search & Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers(1)}
            style={{ ...inputStyle, flex: 1, minWidth: "200px" }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ ...inputStyle, minWidth: "120px" }}
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            style={{ ...inputStyle, minWidth: "140px" }}
          >
            <option value="">All Users</option>
            <option value="featured">Featured Only</option>
            <option value="not-featured">Not Featured</option>
          </select>
          <button
            onClick={() => fetchUsers(1)}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #9333ea, #3b82f6)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            Search
          </button>
        </div>

        {/* Users Table */}
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
              Loading users...
              <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "rgba(31, 41, 55, 0.5)" }}>
                    <tr>
                      {["User", "Role", "Tier", "Views", "Clicks", "Featured", "Actions"].map((header) => (
                        <th
                          key={header}
                          style={{
                            padding: "14px 16px",
                            textAlign: "left",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr
                        key={user.id}
                        style={{
                          borderTop: idx > 0 ? "1px solid #374151" : "none",
                          backgroundColor: user.isFeatured ? "rgba(251, 191, 36, 0.05)" : "transparent"
                        }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              width: "40px",
                              height: "40px",
                              background: user.isFeatured
                                ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                                : "linear-gradient(135deg, #a855f7, #3b82f6)",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              overflow: "hidden"
                            }}>
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.username}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                (user.displayName || user.username)[0].toUpperCase()
                              )}
                            </div>
                            <div>
                              <p style={{ fontWeight: "500", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                                {user.displayName || user.username}
                                {user.isFeatured && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                )}
                              </p>
                              <p style={{ color: "#6b7280", fontSize: "13px" }}>@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {editingUser === user.id ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              autoFocus
                              onBlur={() => setEditingUser(null)}
                              style={{
                                padding: "6px 10px",
                                backgroundColor: "#374151",
                                border: "1px solid #4b5563",
                                borderRadius: "6px",
                                color: "#fff",
                                fontSize: "14px"
                              }}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "50px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: user.role === "admin" ? "rgba(239, 68, 68, 0.2)" : "rgba(75, 85, 99, 0.3)",
                              color: user.role === "admin" ? "#f87171" : "#d1d5db"
                            }}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            backgroundColor: user.subscriptionTier === "pro" ? "rgba(168, 85, 247, 0.2)" : "rgba(75, 85, 99, 0.2)",
                            color: user.subscriptionTier === "pro" ? "#a855f7" : "#9ca3af",
                            borderRadius: "50px",
                            fontSize: "12px"
                          }}>
                            {user.subscriptionTier}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#9ca3af" }}>
                          {user.totalProfileViews.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 16px", color: "#a855f7", fontWeight: "500" }}>
                          {user._count.linkClicks.toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={() => handleToggleFeatured(user.id, user.isFeatured)}
                            disabled={togglingFeatured === user.id}
                            style={{
                              padding: "6px 14px",
                              backgroundColor: user.isFeatured ? "rgba(251, 191, 36, 0.2)" : "rgba(75, 85, 99, 0.3)",
                              border: user.isFeatured ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid transparent",
                              borderRadius: "8px",
                              color: user.isFeatured ? "#fbbf24" : "#9ca3af",
                              cursor: togglingFeatured === user.id ? "wait" : "pointer",
                              fontSize: "13px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill={user.isFeatured ? "#fbbf24" : "none"}
                              stroke={user.isFeatured ? "#fbbf24" : "#9ca3af"}
                              strokeWidth="2"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            {togglingFeatured === user.id ? "..." : user.isFeatured ? "Featured" : "Feature"}
                          </button>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              onClick={() => setEditingUser(user.id)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "rgba(75, 85, 99, 0.3)",
                                border: "none",
                                borderRadius: "6px",
                                color: "#d1d5db",
                                cursor: "pointer",
                                fontSize: "13px"
                              }}
                            >
                              Edit
                            </button>
                            <Link
                              href={`/@${user.username}`}
                              target="_blank"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "rgba(168, 85, 247, 0.2)",
                                borderRadius: "6px",
                                color: "#a855f7",
                                textDecoration: "none",
                                fontSize: "13px"
                              }}
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
                  No users found matching your criteria
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  borderTop: "1px solid #374151"
                }}>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} users
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => fetchUsers(pagination.page - 1)}
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
                      onClick={() => fetchUsers(pagination.page + 1)}
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
    </div>
  );
}
