import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/db";
import Link from "next/link";
import ProfileLinks from "./ProfileLinks";
import ReportModal from "./ReportModal";
import AchievementBadges from "@/components/AchievementBadges";
import ContactForm from "@/components/ContactForm";
import { getTheme, createCustomTheme } from "@/lib/themes/config";
import ThemeBackground from "@/components/ThemeBackground";
import { getFontFamily, getGoogleFontsUrl } from "@/lib/fonts/config";
import TrackingScripts from "@/components/TrackingScripts";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getProfile(username: string) {
  const cleanUsername = username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username: cleanUsername },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      theme: true,
      donationUrl: true,
      profileFont: true,
      headingFont: true,
      subscriptionTier: true,
      totalProfileViews: true,
      facebookPixelId: true,
      googleAnalyticsId: true,
      tiktokPixelId: true,
      links: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          title: true,
          url: true,
          platform: true,
          icon: true,
          isVerified: true,
          abTestEnabled: true,
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              title: true,
              url: true,
              weight: true,
              isActive: true,
            },
          },
        },
      },
      achievements: {
        where: { displayOnProfile: true },
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: "desc",
        },
      },
      customThemes: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  if (user) {
    trackProfileView(user.id).catch(() => {});
  }

  return user;
}

async function trackProfileView(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update daily analytics
  await prisma.profileView.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    update: {
      totalViews: { increment: 1 },
    },
    create: {
      userId,
      date: today,
      totalViews: 1,
      uniqueViews: 1,
    },
  });

  // Update user's total profile views for achievements/leaderboard
  await prisma.user.update({
    where: { id: userId },
    data: { totalProfileViews: { increment: 1 } },
  });
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return { title: "User not found - xolinks.me" };
  }

  return {
    title: `${profile.displayName || profile.username} - xolinks.me`,
    description: profile.bio || `Check out ${profile.displayName || profile.username}'s links on xolinks.me`,
    openGraph: {
      title: `${profile.displayName || profile.username} - xolinks.me`,
      description: profile.bio || `Check out ${profile.displayName || profile.username}'s links`,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  // Use custom theme if active, otherwise use preset theme
  const activeCustomTheme = profile.customThemes?.[0];
  const theme = activeCustomTheme
    ? createCustomTheme(activeCustomTheme)
    : getTheme(profile.theme);

  // Get custom fonts for Pro users
  const isPro = profile.subscriptionTier === "pro" || profile.subscriptionTier === "business";
  const profileFontFamily = isPro ? getFontFamily(profile.profileFont) : "inherit";
  const headingFontFamily = isPro ? getFontFamily(profile.headingFont) : "inherit";
  const googleFontsUrl = isPro ? getGoogleFontsUrl([profile.profileFont, profile.headingFont]) : null;

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      background: theme.background,
      fontFamily: profileFontFamily,
    }}>
      {/* Skip Link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Tracking Scripts for Pro users */}
      <TrackingScripts
        facebookPixelId={profile.facebookPixelId}
        googleAnalyticsId={profile.googleAnalyticsId}
        tiktokPixelId={profile.tiktokPixelId}
      />

      {/* Google Fonts for Pro users */}
      {googleFontsUrl && (
        <link rel="stylesheet" href={googleFontsUrl} />
      )}

      {/* Animated Theme Background */}
      <ThemeBackground themeId={profile.theme} />

      {/* Main Content */}
      <main
        id="main-content"
        role="main"
        aria-label={`${profile.displayName || profile.username}'s profile`}
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px"
        }}
      >
        {/* Profile Card */}
        <div style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "40px 28px",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          {/* Avatar */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              width: "110px",
              height: "110px",
              margin: "0 auto",
              borderRadius: "50%",
              padding: "4px",
              background: `linear-gradient(135deg, ${theme.accent}, #ec4899, #3b82f6)`,
              boxShadow: `0 0 30px ${theme.accent}50`,
              animation: "avatar-glow 4s ease-in-out infinite"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: theme.cardBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                fontWeight: "bold",
                color: theme.textPrimary,
                overflow: "hidden"
              }}>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || profile.username}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  profile.displayName?.[0]?.toUpperCase() || profile.username[0].toUpperCase()
                )}
              </div>
            </div>
          </div>

          {/* Name & Username */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "700",
              color: theme.textPrimary,
              marginBottom: "8px",
              letterSpacing: "-0.5px",
              fontFamily: headingFontFamily,
            }}>
              {profile.displayName || profile.username}
            </h1>
            <p style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              color: theme.textSecondary,
              fontSize: "14px",
              fontWeight: "500"
            }}>
              @{profile.username}
              <svg width="14" height="14" viewBox="0 0 20 20" fill={theme.accent}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </p>
          </div>

          {/* Achievement Badges */}
          {profile.achievements && profile.achievements.length > 0 && (
            <AchievementBadges
              achievements={profile.achievements.map((ua) => ({
                id: ua.achievement.id,
                name: ua.achievement.name,
                description: ua.achievement.description,
                icon: ua.achievement.icon,
                category: ua.achievement.category,
                unlockedAt: ua.unlockedAt,
              }))}
              theme={theme}
            />
          )}

          {/* Bio */}
          {profile.bio && (
            <p style={{
              textAlign: "center",
              color: theme.textSecondary,
              fontSize: "15px",
              lineHeight: "1.7",
              marginBottom: "28px",
              opacity: 0.9
            }}>
              {profile.bio}
            </p>
          )}

          {/* Divider */}
          <div style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${theme.accent}40, transparent)`,
            marginBottom: "28px"
          }} />

          {/* Links */}
          <ProfileLinks links={profile.links} theme={theme} />

          {/* Donation Button */}
          {profile.donationUrl && (
            <div style={{ marginBottom: "20px" }}>
              <a
                href={profile.donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="support-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "12px 20px",
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "14px",
                  fontWeight: "500",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Support
              </a>
            </div>
          )}

          {/* Contact Form - Temporarily Disabled */}
          {/* <div style={{ marginBottom: "20px" }}>
            <ContactForm username={profile.username} displayName={profile.displayName} />
          </div> */}

          {/* Report Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ReportModal username={profile.username} theme={theme} />
          </div>
        </div>

        {/* Footer Branding */}
        <Link
          href="/"
          aria-label="Create your own xolinks.me profile"
          style={{
            marginTop: "32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)",
            borderRadius: "50px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: theme.textSecondary,
            fontSize: "13px",
            fontWeight: "500",
            textDecoration: "none",
            transition: "all 0.3s ease"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          Create your xolinks.me
        </Link>
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes avatar-glow {
          0%, 100% {
            box-shadow: 0 0 30px ${theme.accent}50;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 50px ${theme.accent}70, 0 0 80px ${theme.accent}30;
            transform: scale(1.02);
          }
        }
        .donation-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
        }
      `}</style>
    </div>
  );
}
