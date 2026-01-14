"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
  totalViews: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  activeUsers: number;
}

interface RecentUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  role: string;
  _count: {
    links: number;
    platformConnections: number;
  };
}

interface TopUser {
  id: string;
  username: string;
  displayName: string | null;
  _count: {
    links: number;
    linkClicks: number;
    profileViews: number;
  };
}

interface PlatformStat {
  platform: string;
  count: number;
}

const cardStyle = {
  backgroundColor: "rgba(17, 24, 39, 0.6)",
  border: "1px solid #374151",
  borderRadius: "16px",
  padding: "24px"
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          setError("Access denied. Admin privileges required.");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
        setTopUsers(data.topUsers);
        setPlatformStats(data.platformStats);
      } catch {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#030712",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #374151",
            borderTop: "3px solid #a855f7",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite"
          }} />
          <p>Loading control panel...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

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
          <Link href="/dashboard" style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "rgba(168, 85, 247, 0.2)",
            color: "#a855f7",
            borderRadius: "8px",
            textDecoration: "none"
          }}>
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
              background: "linear-gradient(135deg, #ef4444, #f97316)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Control Panel</h1>
            <span style={{
              padding: "4px 12px",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              fontSize: "12px",
              borderRadius: "50px",
              fontWeight: "500"
            }}>
              ADMIN
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link href="/xo-backstage/users" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>
              Users
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
        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }}>
          <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="users" />
          <StatCard label="Total Links" value={stats?.totalLinks || 0} icon="link" />
          <StatCard label="Total Clicks" value={stats?.totalClicks || 0} icon="click" />
          <StatCard label="Total Views" value={stats?.totalViews || 0} icon="eye" />
          <StatCard label="New Today" value={stats?.newUsersToday || 0} highlight="#4ade80" icon="plus" />
          <StatCard label="New This Week" value={stats?.newUsersThisWeek || 0} highlight="#60a5fa" icon="calendar" />
          <StatCard label="Active (30d)" value={stats?.activeUsers || 0} highlight="#a855f7" icon="activity" />
          <StatCard
            label="Conversion"
            value={`${stats && stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`}
            icon="percent"
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px"
        }}>
          {/* Recent Signups */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Recent Signups</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px",
                    backgroundColor: "rgba(31, 41, 55, 0.5)",
                    borderRadius: "12px",
                    transition: "background-color 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "16px"
                    }}>
                      {(user.displayName || user.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: "500", marginBottom: "2px" }}>{user.displayName || user.username}</p>
                      <p style={{ color: "#9ca3af", fontSize: "13px" }}>@{user.username}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                      {user._count.links} links
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "12px" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px 0" }}>No users yet</p>
              )}
            </div>
          </div>

          {/* Top Users */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                backgroundColor: "rgba(168, 85, 247, 0.2)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Top Performers</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topUsers.map((user, index) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px",
                    backgroundColor: "rgba(31, 41, 55, 0.5)",
                    borderRadius: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor: index === 0 ? "#fbbf24" : index === 1 ? "#9ca3af" : index === 2 ? "#cd7f32" : "#374151",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "12px",
                      color: index < 3 ? "#000" : "#fff"
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: "500", marginBottom: "2px" }}>{user.displayName || user.username}</p>
                      <p style={{ color: "#9ca3af", fontSize: "13px" }}>@{user.username}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#a855f7", fontWeight: "600" }}>{user._count.linkClicks.toLocaleString()} clicks</p>
                    <p style={{ color: "#6b7280", fontSize: "12px" }}>{user._count.links} links</p>
                  </div>
                </div>
              ))}
              {topUsers.length === 0 && (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px 0" }}>No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div style={{ ...cardStyle, marginTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Platform Connections</h3>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px"
          }}>
            {platformStats.map((platform) => (
              <div
                key={platform.platform}
                style={{
                  padding: "20px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  borderRadius: "12px",
                  textAlign: "center",
                  transition: "transform 0.2s"
                }}
              >
                <p style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>{platform.count}</p>
                <p style={{ color: "#9ca3af", fontSize: "14px", textTransform: "capitalize" }}>{platform.platform}</p>
              </div>
            ))}
            {platformStats.length === 0 && (
              <p style={{ color: "#6b7280", textAlign: "center", padding: "20px 0", gridColumn: "1 / -1" }}>
                No platform connections yet
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  icon,
}: {
  label: string;
  value: number | string;
  highlight?: string;
  icon?: string;
}) {
  const iconPaths: Record<string, ReactNode> = {
    users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>,
    click: <><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
    percent: <><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
  };

  return (
    <div style={{
      backgroundColor: "rgba(17, 24, 39, 0.6)",
      border: "1px solid #374151",
      borderRadius: "12px",
      padding: "16px",
      position: "relative",
      overflow: "hidden"
    }}>
      {icon && (
        <div style={{
          position: "absolute",
          top: "-10px",
          right: "-10px",
          opacity: 0.1
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={highlight || "#fff"} strokeWidth="1.5">
            {iconPaths[icon]}
          </svg>
        </div>
      )}
      <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "8px" }}>{label}</p>
      <p style={{
        fontSize: "28px",
        fontWeight: "bold",
        color: highlight || "#fff"
      }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
