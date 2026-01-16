require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ACHIEVEMENTS = [
  { name: "Pioneer", description: "One of the first 100 users to join xolinks.me", icon: "🚀", category: "pioneer", requirement: 100 },
  { name: "Early Adopter", description: "One of the first 500 users to join xolinks.me", icon: "⭐", category: "pioneer", requirement: 500 },
  { name: "Trailblazer", description: "One of the first 1000 users to join xolinks.me", icon: "🌟", category: "pioneer", requirement: 1000 },
  { name: "First Link", description: "Added your first link to your profile", icon: "🔗", category: "links", requirement: 1 },
  { name: "Link Collector", description: "Added 5 links to your profile", icon: "📎", category: "links", requirement: 5 },
  { name: "Link Master", description: "Added 10 links to your profile", icon: "🔥", category: "links", requirement: 10 },
  { name: "Link Legend", description: "Added 25 links to your profile", icon: "👑", category: "links", requirement: 25 },
  { name: "Getting Noticed", description: "Received 100 profile views", icon: "👀", category: "views", requirement: 100 },
  { name: "Rising Star", description: "Received 500 profile views", icon: "✨", category: "views", requirement: 500 },
  { name: "Popular", description: "Received 1,000 profile views", icon: "🌙", category: "views", requirement: 1000 },
  { name: "Famous", description: "Received 5,000 profile views", icon: "🏆", category: "views", requirement: 5000 },
  { name: "Superstar", description: "Received 10,000 profile views", icon: "💫", category: "views", requirement: 10000 },
  { name: "First Click", description: "Received your first link click", icon: "👆", category: "clicks", requirement: 1 },
  { name: "Click Starter", description: "Received 50 total link clicks", icon: "🖱️", category: "clicks", requirement: 50 },
  { name: "Click Collector", description: "Received 250 total link clicks", icon: "🎯", category: "clicks", requirement: 250 },
  { name: "Click Magnet", description: "Received 1,000 total link clicks", icon: "🧲", category: "clicks", requirement: 1000 },
  { name: "Click Master", description: "Received 5,000 total link clicks", icon: "💎", category: "clicks", requirement: 5000 },
  { name: "Connected", description: "Connected your first social platform", icon: "🔌", category: "social", requirement: 1 },
  { name: "Social Butterfly", description: "Connected 3 social platforms", icon: "🦋", category: "social", requirement: 3 },
  { name: "Network King", description: "Connected 5 social platforms", icon: "👑", category: "social", requirement: 5 },
  { name: "Profile Started", description: "Added a display name and bio to your profile", icon: "📝", category: "profile", requirement: 1 },
  { name: "Picture Perfect", description: "Uploaded a profile picture", icon: "📸", category: "profile", requirement: 1 },
  { name: "Verified Creator", description: "Have at least one verified link on your profile", icon: "✅", category: "profile", requirement: 1 },
];

async function seed() {
  console.log("Seeding achievements...");
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
    console.log(`  ✓ ${achievement.name}`);
  }
  console.log(`\nSeeded ${ACHIEVEMENTS.length} achievements successfully!`);
  await prisma.$disconnect();
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  pool.end();
  process.exit(1);
});
