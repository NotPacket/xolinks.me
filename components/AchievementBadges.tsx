"use client";

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
  if (!achievements || achievements.length === 0) return null;

  // Show up to 6 badges on profile
  const displayedAchievements = achievements.slice(0, 6);
  const remainingCount = achievements.length - 6;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {displayedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            title={`${achievement.name}: ${achievement.description}`}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              cursor: "help",
              transition: "transform 0.2s ease, background-color 0.2s ease",
              border: `1px solid ${theme.accent}30`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            {achievement.icon}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: theme.textSecondary,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}
