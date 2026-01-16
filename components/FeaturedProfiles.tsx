"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FeaturedUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  linkCount: number;
  achievements: { icon: string; name: string }[];
}

export default function FeaturedProfiles() {
  const [users, setUsers] = useState<FeaturedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/public/featured");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.featured);
        }
      } catch (error) {
        console.error("Failed to fetch featured users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section
        style={{
          padding: "80px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", color: "#9ca3af" }}>
          Loading featured creators...
        </div>
      </section>
    );
  }

  if (users.length === 0) {
    return null; // Don't show section if no featured users
  }

  return (
    <section
      style={{
        padding: "80px 24px",
        maxWidth: "1100px",
        margin: "0 auto",
        borderTop: "1px solid #1f2937",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "16px",
        }}
      >
        Featured Creators
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#9ca3af",
          marginBottom: "48px",
        }}
      >
        Discover amazing creators on xolinks.me
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/@${user.username}`}
            style={{
              textDecoration: "none",
              color: "#fff",
            }}
          >
            <div
              style={{
                padding: "24px",
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#1f2937";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 16px",
                  background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                  borderRadius: "50%",
                  padding: "3px",
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
                    fontSize: "24px",
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

              {/* Name */}
              <h3
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.displayName || user.username}
              </h3>

              {/* Username */}
              <p
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#9ca3af",
                  marginBottom: "12px",
                }}
              >
                @{user.username}
              </p>

              {/* Achievements */}
              {user.achievements.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "4px",
                    marginBottom: "12px",
                  }}
                >
                  {user.achievements.map((achievement, idx) => (
                    <span
                      key={idx}
                      title={achievement.name}
                      style={{ fontSize: "16px" }}
                    >
                      {achievement.icon}
                    </span>
                  ))}
                </div>
              )}

              {/* Bio */}
              {user.bio && (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#6b7280",
                    lineHeight: "1.5",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    marginBottom: "12px",
                  }}
                >
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(55, 65, 81, 0.5)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>
                    {user.linkCount}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>
                    Links
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <Link
          href="/leaderboard"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "rgba(55, 65, 81, 0.5)",
            border: "1px solid #374151",
            borderRadius: "10px",
            color: "#d1d5db",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
        >
          View Leaderboard →
        </Link>
      </div>
    </section>
  );
}
