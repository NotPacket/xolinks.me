"use client";

import { useState } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: Date;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  theme: {
    accent: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export default function AchievementBadges({
  achievements,
  theme,
}: AchievementBadgesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!achievements || achievements.length === 0) return null;

  // Show up to 5 badges on profile for a cleaner look
  const displayedAchievements = achievements.slice(0, 5);
  const remainingCount = achievements.length - 5;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginBottom: "16px",
      }}
    >
      {displayedAchievements.map((achievement) => (
        <div
          key={achievement.id}
          style={{ position: "relative" }}
          onMouseEnter={() => setHoveredId(achievement.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Badge */}
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: hoveredId === achievement.id
                ? `linear-gradient(135deg, ${theme.accent}40, ${theme.accent}20)`
                : "rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              cursor: "default",
              transition: "all 0.2s ease",
              transform: hoveredId === achievement.id ? "scale(1.15)" : "scale(1)",
              boxShadow: hoveredId === achievement.id
                ? `0 0 12px ${theme.accent}50`
                : "none",
            }}
          >
            {achievement.icon}
          </div>

          {/* Tooltip */}
          {hoveredId === achievement.id && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 0, 0, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "8px",
                padding: "8px 12px",
                whiteSpace: "nowrap",
                zIndex: 50,
                border: `1px solid ${theme.accent}30`,
                animation: "fadeIn 0.15s ease",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: theme.textPrimary,
                  marginBottom: "2px",
                }}
              >
                {achievement.name}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textSecondary,
                  maxWidth: "180px",
                  whiteSpace: "normal",
                }}
              >
                {achievement.description}
              </div>
              {/* Tooltip arrow */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: "8px",
                  height: "8px",
                  background: "rgba(0, 0, 0, 0.9)",
                  borderRight: `1px solid ${theme.accent}30`,
                  borderBottom: `1px solid ${theme.accent}30`,
                }}
              />
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "600",
            color: theme.textSecondary,
          }}
        >
          +{remainingCount}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
