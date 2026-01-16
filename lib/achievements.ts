import prisma from "@/lib/db";

// Achievement definitions
export const ACHIEVEMENTS = [
  // Pioneer achievements
  {
    name: "Pioneer",
    description: "One of the first 100 users to join xolinks.me",
    icon: "🚀",
    category: "pioneer",
    requirement: 100,
  },
  {
    name: "Early Adopter",
    description: "One of the first 500 users to join xolinks.me",
    icon: "⭐",
    category: "pioneer",
    requirement: 500,
  },
  {
    name: "Trailblazer",
    description: "One of the first 1000 users to join xolinks.me",
    icon: "🌟",
    category: "pioneer",
    requirement: 1000,
  },

  // Link achievements
  {
    name: "First Link",
    description: "Added your first link to your profile",
    icon: "🔗",
    category: "links",
    requirement: 1,
  },
  {
    name: "Link Collector",
    description: "Added 5 links to your profile",
    icon: "📎",
    category: "links",
    requirement: 5,
  },
  {
    name: "Link Master",
    description: "Added 10 links to your profile",
    icon: "🔥",
    category: "links",
    requirement: 10,
  },
  {
    name: "Link Legend",
    description: "Added 25 links to your profile",
    icon: "👑",
    category: "links",
    requirement: 25,
  },

  // Profile view achievements
  {
    name: "Getting Noticed",
    description: "Received 100 profile views",
    icon: "👀",
    category: "views",
    requirement: 100,
  },
  {
    name: "Rising Star",
    description: "Received 500 profile views",
    icon: "✨",
    category: "views",
    requirement: 500,
  },
  {
    name: "Popular",
    description: "Received 1,000 profile views",
    icon: "🌙",
    category: "views",
    requirement: 1000,
  },
  {
    name: "Famous",
    description: "Received 5,000 profile views",
    icon: "🏆",
    category: "views",
    requirement: 5000,
  },
  {
    name: "Superstar",
    description: "Received 10,000 profile views",
    icon: "💫",
    category: "views",
    requirement: 10000,
  },

  // Click achievements
  {
    name: "First Click",
    description: "Received your first link click",
    icon: "👆",
    category: "clicks",
    requirement: 1,
  },
  {
    name: "Click Starter",
    description: "Received 50 total link clicks",
    icon: "🖱️",
    category: "clicks",
    requirement: 50,
  },
  {
    name: "Click Collector",
    description: "Received 250 total link clicks",
    icon: "🎯",
    category: "clicks",
    requirement: 250,
  },
  {
    name: "Click Magnet",
    description: "Received 1,000 total link clicks",
    icon: "🧲",
    category: "clicks",
    requirement: 1000,
  },
  {
    name: "Click Master",
    description: "Received 5,000 total link clicks",
    icon: "💎",
    category: "clicks",
    requirement: 5000,
  },

  // Social/Platform achievements
  {
    name: "Connected",
    description: "Connected your first social platform",
    icon: "🔌",
    category: "social",
    requirement: 1,
  },
  {
    name: "Social Butterfly",
    description: "Connected 3 social platforms",
    icon: "🦋",
    category: "social",
    requirement: 3,
  },
  {
    name: "Network King",
    description: "Connected 5 social platforms",
    icon: "👑",
    category: "social",
    requirement: 5,
  },

  // Profile completeness
  {
    name: "Profile Started",
    description: "Added a display name and bio to your profile",
    icon: "📝",
    category: "profile",
    requirement: 1,
  },
  {
    name: "Picture Perfect",
    description: "Uploaded a profile picture",
    icon: "📸",
    category: "profile",
    requirement: 1,
  },
  {
    name: "Verified Creator",
    description: "Have at least one verified link on your profile",
    icon: "✅",
    category: "profile",
    requirement: 1,
  },
];

// Seed achievements into the database
export async function seedAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        requirement: achievement.requirement,
      },
      create: achievement,
    });
  }
  return { success: true, count: ACHIEVEMENTS.length };
}

// Check and award achievements for a user
export async function checkAndAwardAchievements(userId: string) {
  const awarded: string[] = [];

  // Get user data with counts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      links: true,
      platformConnections: true,
      achievements: {
        include: { achievement: true },
      },
    },
  });

  if (!user) return { awarded };

  // Get all achievements
  const allAchievements = await prisma.achievement.findMany();

  // Get user's existing achievement IDs
  const existingAchievementIds = new Set(
    user.achievements.map((ua) => ua.achievementId)
  );

  // Calculate user stats
  const linkCount = user.links.length;
  const platformCount = user.platformConnections.length;
  const verifiedLinkCount = user.links.filter((l) => l.isVerified).length;
  const hasDisplayNameAndBio = !!(user.displayName && user.bio);
  const hasAvatar = !!user.avatarUrl;

  // Get user's signup order
  const usersBeforeCount = await prisma.user.count({
    where: {
      createdAt: { lt: user.createdAt },
    },
  });
  const userOrder = usersBeforeCount + 1;

  for (const achievement of allAchievements) {
    // Skip if already has this achievement
    if (existingAchievementIds.has(achievement.id)) continue;

    let shouldAward = false;

    switch (achievement.category) {
      case "pioneer":
        shouldAward = userOrder <= achievement.requirement;
        break;

      case "links":
        shouldAward = linkCount >= achievement.requirement;
        break;

      case "views":
        shouldAward = user.totalProfileViews >= achievement.requirement;
        break;

      case "clicks":
        shouldAward = user.totalLinkClicks >= achievement.requirement;
        break;

      case "social":
        shouldAward = platformCount >= achievement.requirement;
        break;

      case "profile":
        if (achievement.name === "Profile Started") {
          shouldAward = hasDisplayNameAndBio;
        } else if (achievement.name === "Picture Perfect") {
          shouldAward = hasAvatar;
        } else if (achievement.name === "Verified Creator") {
          shouldAward = verifiedLinkCount >= 1;
        }
        break;
    }

    if (shouldAward) {
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: achievement.id,
        },
      });
      awarded.push(achievement.name);
    }
  }

  return { awarded };
}

// Get achievements for a user
export async function getUserAchievements(userId: string) {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: {
      unlockedAt: "desc",
    },
  });

  return userAchievements.map((ua) => ({
    id: ua.achievement.id,
    name: ua.achievement.name,
    description: ua.achievement.description,
    icon: ua.achievement.icon,
    category: ua.achievement.category,
    unlockedAt: ua.unlockedAt,
  }));
}

// Get all achievements with user's progress
export async function getAllAchievementsWithProgress(userId: string) {
  const allAchievements = await prisma.achievement.findMany({
    orderBy: [{ category: "asc" }, { requirement: "asc" }],
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  });

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  return allAchievements.map((achievement) => ({
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    category: achievement.category,
    requirement: achievement.requirement,
    unlocked: unlockedIds.has(achievement.id),
    unlockedAt: unlockedMap.get(achievement.id) || null,
  }));
}
