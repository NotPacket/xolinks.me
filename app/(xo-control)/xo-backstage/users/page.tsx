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
  emailVerified?: boolean;
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
  outline: "none",
  width: "100%",
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500" as const,
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
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);

  // Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    username: "",
    role: "",
    newPassword: "",
    emailVerified: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      username: user.username,
      role: user.role,
      newPassword: "",
      emailVerified: user.emailVerified ?? false,
    });
    setMessage(null);
  };

  const closeModal = () => {
    setEditingUser(null);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    setMessage(null);

    try {
      const updates: Record<string, string | boolean> = {};

      if (editForm.email !== editingUser.email) {
        updates.email = editForm.email;
      }
      if (editForm.username !== editingUser.username) {
        updates.username = editForm.username;
      }
      if (editForm.role !== editingUser.role) {
        updates.role = editForm.role;
      }
      if (editForm.emailVerified !== (editingUser.emailVerified ?? false)) {
        updates.emailVerified = editForm.emailVerified;
      }
      if (editForm.newPassword) {
        updates.newPassword = editForm.newPassword;
      }

      if (Object.keys(updates).length === 0) {
        setMessage({ type: "error", text: "No changes to save" });
        setSaving(false);
        return;
      }

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser.id, updates }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(users.map((u) =>
          u.id === editingUser.id ? { ...u, ...data.user } : u
        ));
        setMessage({ type: "success", text: "User updated successfully" });
        setEditForm({ ...editForm, newPassword: "" });
        // Update editingUser with new values
        setEditingUser({ ...editingUser, ...data.user });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update user" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update user" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingUser) return;
    if (!confirm(`Are you sure you want to DELETE user "${editingUser.username}"? This cannot be undone!`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${editingUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== editingUser.id));
        closeModal();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete user" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete user" });
    } finally {
      setDeleting(false);
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
            style={{ ...inputStyle, minWidth: "120px", width: "auto" }}
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            style={{ ...inputStyle, minWidth: "140px", width: "auto" }}
          >
            <option value="">All Users</option>
            <option value="featured">Featured Only</option>
            <option value="not-featured">Not Featured</option>
          </select>
          <button
            onClick={() => fetchUsers(1)}
            style={{
              ...buttonStyle,
              background: "linear-gradient(135deg, #9333ea, #3b82f6)",
              color: "#fff",
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
                      {["User", "Email", "Role", "Featured", "Actions"].map((header) => (
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
                        <td style={{ padding: "14px 16px", color: "#9ca3af", fontSize: "14px" }}>
                          {user.email}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
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
                              onClick={() => openEditModal(user)}
                              style={{
                                ...buttonStyle,
                                padding: "6px 16px",
                                backgroundColor: "rgba(59, 130, 246, 0.2)",
                                color: "#3b82f6",
                              }}
                            >
                              Manage
                            </button>
                            <Link
                              href={`/@${user.username}`}
                              target="_blank"
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "rgba(168, 85, 247, 0.2)",
                                borderRadius: "8px",
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
                        ...buttonStyle,
                        backgroundColor: "#374151",
                        color: "#fff",
                        opacity: pagination.page === 1 ? 0.5 : 1,
                        cursor: pagination.page === 1 ? "not-allowed" : "pointer",
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
                        ...buttonStyle,
                        backgroundColor: "#374151",
                        color: "#fff",
                        opacity: pagination.page === pagination.pages ? 0.5 : 1,
                        cursor: pagination.page === pagination.pages ? "not-allowed" : "pointer",
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

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                  Manage User
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                  @{editingUser.username}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "24px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              {message && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  backgroundColor: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                  color: message.type === "success" ? "#4ade80" : "#f87171",
                  fontSize: "14px",
                }}>
                  {message.text}
                </div>
              )}

              {/* Username */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Role */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={inputStyle}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Email Verified Toggle */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}>
                  <div
                    onClick={() => setEditForm({ ...editForm, emailVerified: !editForm.emailVerified })}
                    style={{
                      width: "44px",
                      height: "24px",
                      backgroundColor: editForm.emailVerified ? "#22c55e" : "#374151",
                      borderRadius: "12px",
                      position: "relative",
                      transition: "background-color 0.2s",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: editForm.emailVerified ? "22px" : "2px",
                      transition: "left 0.2s",
                    }} />
                  </div>
                  <span style={{ color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                    Email Verified
                  </span>
                </label>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#d1d5db", fontSize: "14px", fontWeight: "500" }}>
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="text"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  placeholder="Enter new password..."
                  style={inputStyle}
                />
                {editForm.newPassword && editForm.newPassword.length < 6 && (
                  <p style={{ color: "#f87171", fontSize: "12px", marginTop: "6px" }}>
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    ...buttonStyle,
                    flex: 1,
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    color: "#fff",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={closeModal}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#374151",
                    color: "#fff",
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* Delete Section */}
              <div style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "1px solid #374151",
              }}>
                <h3 style={{ color: "#f87171", fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>
                  Danger Zone
                </h3>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    ...buttonStyle,
                    width: "100%",
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? "Deleting..." : "Delete User Account"}
                </button>
                <p style={{ color: "#6b7280", fontSize: "12px", marginTop: "8px" }}>
                  This action cannot be undone. All user data will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
