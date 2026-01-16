"use client";

import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

const categoryLabels: Record<string, string> = {
  pioneer: "Pioneer",
  links: "Links",
  views: "Profile Views",
  clicks: "Link Clicks",
  social: "Social",
  profile: "Profile",
};

const categoryColors: Record<string, string> = {
  pioneer: "#f59e0b",
  links: "#3b82f6",
  views: "#8b5cf6",
  clicks: "#ec4899",
  social: "#10b981",
  profile: "#06b6d4",
};

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/user/achievements");
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.allAchievements || []);
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/achievements/check", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.awarded && data.awarded.length > 0) {
          setNewlyUnlocked(data.awarded);
          setTimeout(() => setNewlyUnlocked([]), 5000);
        }
        await fetchAchievements();
      }
    } catch (error) {
      console.error("Failed to check achievements:", error);
    } finally {
      setChecking(false);
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const categories = ["all", ...new Set(achievements.map((a) => a.category))];

  const filteredAchievements =
    filter === "all"
      ? achievements
      : achievements.filter((a) => a.category === filter);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "rgba(17, 24, 39, 0.6)",
          border: "1px solid #374151",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ color: "#9ca3af", textAlign: "center" }}>
          Loading achievements...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(17, 24, 39, 0.6)",
        border: "1px solid #374151",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h3
            style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}
          >
            Achievements
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>
            {unlockedCount} of {totalCount} unlocked
          </p>
        </div>
        <button
          onClick={checkAchievements}
          disabled={checking}
          style={{
            padding: "8px 16px",
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            borderRadius: "8px",
            color: "#a855f7",
            fontSize: "14px",
            cursor: checking ? "not-allowed" : "pointer",
            opacity: checking ? 0.7 : 1,
          }}
        >
          {checking ? "Checking..." : "Check for New"}
        </button>
      </div>

      {/* Newly Unlocked Banner */}
      {newlyUnlocked.length > 0 && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            marginBottom: "20px",
            color: "#4ade80",
            textAlign: "center",
          }}
        >
          🎉 New achievement{newlyUnlocked.length > 1 ? "s" : ""} unlocked:{" "}
          {newlyUnlocked.join(", ")}!
        </div>
      )}

      {/* Progress Bar */}
      <div
        style={{
          marginBottom: "20px",
          backgroundColor: "rgba(55, 65, 81, 0.5)",
          borderRadius: "10px",
          height: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(unlockedCount / totalCount) * 100}%`,
            background: "linear-gradient(90deg, #a855f7, #3b82f6)",
            borderRadius: "10px",
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Category Filter */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "6px 14px",
              backgroundColor:
                filter === cat
                  ? "rgba(139, 92, 246, 0.3)"
                  : "rgba(55, 65, 81, 0.5)",
              border:
                filter === cat
                  ? "1px solid rgba(139, 92, 246, 0.5)"
                  : "1px solid transparent",
              borderRadius: "20px",
              color: filter === cat ? "#a855f7" : "#9ca3af",
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat === "all" ? "All" : categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            style={{
              padding: "16px",
              backgroundColor: achievement.unlocked
                ? "rgba(31, 41, 55, 0.7)"
                : "rgba(31, 41, 55, 0.3)",
              border: achievement.unlocked
                ? `1px solid ${categoryColors[achievement.category] || "#374151"}40`
                : "1px solid rgba(55, 65, 81, 0.5)",
              borderRadius: "12px",
              opacity: achievement.unlocked ? 1 : 0.5,
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  backgroundColor: achievement.unlocked
                    ? `${categoryColors[achievement.category]}20`
                    : "rgba(55, 65, 81, 0.5)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  filter: achievement.unlocked ? "none" : "grayscale(100%)",
                }}
              >
                {achievement.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: achievement.unlocked ? "#fff" : "#9ca3af",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {achievement.name}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: categoryColors[achievement.category] || "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {categoryLabels[achievement.category] || achievement.category}
                </p>
              </div>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                lineHeight: "1.4",
              }}
            >
              {achievement.description}
            </p>
            {achievement.unlocked && achievement.unlockedAt && (
              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginTop: "8px",
                }}
              >
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>
          No achievements in this category yet.
        </p>
      )}
    </div>
  );
}
