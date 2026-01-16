"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  totalProfileViews: number;
  totalLinkClicks: number;
  linkCount: number;
  topAchievements: { icon: string; name: string }[];
  joinedAt: string;
}

const rankColors: Record<number, string> = {
  1: "#fbbf24", // Gold
  2: "#9ca3af", // Silver
  3: "#b45309", // Bronze
};

const rankEmojis: Record<number, string> = {
  1: "👑",
  2: "🥈",
  3: "🥉",
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"views" | "clicks">("views");

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?sortBy=${sortBy}&limit=25`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        color: "#fff",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(55, 65, 81, 0.5)",
          backgroundColor: "rgba(17, 24, 39, 0.5)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            xolinks.me
          </Link>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link
              href="/dashboard"
              style={{
                color: "#9ca3af",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              style={{
                color: "#a855f7",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Title Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              marginBottom: "12px",
              background: "linear-gradient(135deg, #a855f7, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Leaderboard
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "16px" }}>
            Top creators on xolinks.me
          </p>
        </div>

        {/* Sort Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "rgba(55, 65, 81, 0.5)",
              borderRadius: "12px",
              padding: "4px",
            }}
          >
            <button
              onClick={() => setSortBy("views")}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor:
                  sortBy === "views" ? "rgba(139, 92, 246, 0.3)" : "transparent",
                color: sortBy === "views" ? "#a855f7" : "#9ca3af",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Profile Views
            </button>
            <button
              onClick={() => setSortBy("clicks")}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor:
                  sortBy === "clicks" ? "rgba(139, 92, 246, 0.3)" : "transparent",
                color: sortBy === "clicks" ? "#a855f7" : "#9ca3af",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Link Clicks
            </button>
          </div>
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#9ca3af",
            }}
          >
            Loading leaderboard...
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#9ca3af",
            }}
          >
            No users on the leaderboard yet. Be the first!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/@${user.username}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "20px",
                  backgroundColor:
                    user.rank <= 3
                      ? `${rankColors[user.rank]}10`
                      : "rgba(17, 24, 39, 0.6)",
                  border:
                    user.rank <= 3
                      ? `1px solid ${rankColors[user.rank]}30`
                      : "1px solid #374151",
                  borderRadius: "16px",
                  textDecoration: "none",
                  color: "#fff",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor:
                      user.rank <= 3
                        ? `${rankColors[user.rank]}20`
                        : "rgba(55, 65, 81, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: user.rank <= 3 ? "24px" : "18px",
                    fontWeight: "700",
                    color: rankColors[user.rank] || "#9ca3af",
                    flexShrink: 0,
                  }}
                >
                  {user.rank <= 3 ? rankEmojis[user.rank] : `#${user.rank}`}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                    padding: "3px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      backgroundColor: "#1f2937",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: "bold",
                      overflow: "hidden",
                    }}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName || user.username}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      (user.displayName?.[0] || user.username[0]).toUpperCase()
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.displayName || user.username}
                    </h3>
                    {/* Achievement badges */}
                    {user.topAchievements.length > 0 && (
                      <div style={{ display: "flex", gap: "2px" }}>
                        {user.topAchievements.map((achievement, idx) => (
                          <span
                            key={idx}
                            title={achievement.name}
                            style={{ fontSize: "14px" }}
                          >
                            {achievement.icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "13px",
                    }}
                  >
                    @{user.username} · {user.linkCount} link
                    {user.linkCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: sortBy === "views" ? "#a855f7" : "#fff",
                      }}
                    >
                      {formatNumber(user.totalProfileViews)}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6b7280" }}>Views</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: sortBy === "clicks" ? "#a855f7" : "#fff",
                      }}
                    >
                      {formatNumber(user.totalLinkClicks)}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6b7280" }}>Clicks</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: "48px",
            textAlign: "center",
            padding: "32px",
            backgroundColor: "rgba(17, 24, 39, 0.6)",
            border: "1px solid #374151",
            borderRadius: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            Want to be on the leaderboard?
          </h3>
          <p
            style={{
              color: "#9ca3af",
              fontSize: "14px",
              marginBottom: "20px",
            }}
          >
            Create your free xolinks.me profile and start growing your audience
          </p>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "linear-gradient(135deg, #a855f7, #3b82f6)",
              borderRadius: "50px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            Get Started Free
          </Link>
        </div>
      </main>
    </div>
  );
}
