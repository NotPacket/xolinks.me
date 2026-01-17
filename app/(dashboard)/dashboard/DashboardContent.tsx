"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AchievementsSection from "@/components/AchievementsSection";
import QRCodeCard from "@/components/QRCodeCard";
import ABTestManager from "@/components/ABTestManager";

interface UserData {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: string;
  role: string;
  emailVerified: boolean;
}

interface LinkData {
  id: string;
  title: string;
  url: string;
  platform: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  isVerified: boolean;
}

interface PlatformConnection {
  id: string;
  platform: string;
  platformUsername: string;
  profileUrl: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  platformName: string;
  platformColor: string;
}

interface AvailablePlatform {
  id: string;
  name: string;
  color: string;
  oauthSupported: boolean;
  proOnly?: boolean;
}

const cardStyle = {
  backgroundColor: "rgba(17, 24, 39, 0.6)",
  border: "1px solid #374151",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "24px"
};

// Platform icons mapping
const platformIcons: Record<string, string> = {
  onlyfans: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z",
  fansly: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z",
  github: "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12",
  discord: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  twitch: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z",
  spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
  twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  youtube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  instagram: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
};

export default function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<AvailablePlatform[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "", platform: "" });
  const [addingLink, setAddingLink] = useState(false);
  const [abTestLink, setAbTestLink] = useState<LinkData | null>(null);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/user/links");
    if (res.ok) {
      const data = await res.json();
      setLinks(data.links);
    }
  }, []);

  const fetchPlatforms = useCallback(async () => {
    const res = await fetch("/api/platforms");
    if (res.ok) {
      const data = await res.json();
      setConnections(data.connections);
      setAvailablePlatforms(data.availablePlatforms);
      setIsPro(data.isPro || false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        await Promise.all([fetchLinks(), fetchPlatforms()]);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, fetchLinks, fetchPlatforms]);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const verified = searchParams.get("verified");

    if (verified === "true") {
      setMessage({ type: "success", text: "Email verified successfully!" });
      // Update user state to reflect verification
      if (user) {
        setUser({ ...user, emailVerified: true });
      }
    } else if (success) {
      const successMessages: Record<string, string> = {
        github_connected: "GitHub connected successfully!",
        discord_connected: "Discord connected successfully!",
        twitch_connected: "Twitch connected successfully!",
        spotify_connected: "Spotify connected successfully!",
      };
      setMessage({ type: "success", text: successMessages[success] || "Connected successfully!" });
      fetchPlatforms();
      fetchLinks();
    } else if (error) {
      const errorMessages: Record<string, string> = {
        github_denied: "GitHub connection was denied",
        invalid_request: "Invalid request",
        invalid_state: "Security check failed. Please try again.",
        token_error: "Failed to get access token",
        user_error: "Failed to get user info",
        callback_error: "Connection failed. Please try again.",
      };
      setMessage({ type: "error", text: errorMessages[error] || "An error occurred" });
    }

    if (success || error) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, fetchPlatforms, fetchLinks]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Verification email sent!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send email" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setResendingVerification(false);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Disconnect ${platform}? This will mark your ${platform} link as unverified.`)) return;

    const res = await fetch(`/api/platforms/${platform}`, { method: "DELETE" });
    if (res.ok) {
      setMessage({ type: "success", text: `${platform} disconnected` });
      await Promise.all([fetchPlatforms(), fetchLinks()]);
    }
  };

  const handleToggleActive = async (link: LinkData) => {
    const res = await fetch(`/api/user/links/${link.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !link.isActive }),
    });

    if (res.ok) {
      setLinks(links.map((l) => (l.id === link.id ? { ...l, isActive: !l.isActive } : l)));
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;

    const res = await fetch(`/api/user/links/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLinks(links.filter((l) => l.id !== id));
    }
  };

  const handleAddCustomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    setAddingLink(true);
    try {
      const res = await fetch("/api/user/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Link added successfully!" });
        setNewLink({ title: "", url: "", platform: "" });
        setShowAddLink(false);
        await fetchLinks();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add link" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setAddingLink(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      color: "#fff",
      position: "relative",
      zIndex: 100,
      isolation: "isolate"
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(55, 65, 81, 0.5)",
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>xolinks.me</h1>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            {user?.role === "admin" && (
              <Link href="/xo-backstage" style={{ color: "#f87171", textDecoration: "none", fontSize: "14px" }}>Control Panel</Link>
            )}
            <Link href="/messages" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Messages</Link>
            <Link href="/settings" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Settings</Link>
            <Link href="/analytics" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Analytics</Link>
            <Link href="/support" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Support</Link>
            <Link href={`/@${user?.username}`} target="_blank" style={{ color: "#a855f7", textDecoration: "none", fontSize: "14px" }}>View Profile</Link>
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "14px" }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Message Banner */}
        {message && (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            backgroundColor: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: message.type === "success" ? "#4ade80" : "#f87171"
          }}>
            {message.text}
          </div>
        )}

        {/* Email Verification Banner */}
        {user && !user.emailVerified && (
          <div style={{
            padding: "16px 20px",
            borderRadius: "12px",
            marginBottom: "24px",
            backgroundColor: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                backgroundColor: "rgba(251, 191, 36, 0.2)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p style={{ color: "#fbbf24", fontWeight: "600", fontSize: "15px", marginBottom: "2px" }}>
                  Verify your email
                </p>
                <p style={{ color: "#d1d5db", fontSize: "13px" }}>
                  Check your inbox for a verification link to unlock all features.
                </p>
              </div>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resendingVerification}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgba(251, 191, 36, 0.2)",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                borderRadius: "8px",
                color: "#fbbf24",
                fontWeight: "500",
                fontSize: "14px",
                cursor: resendingVerification ? "not-allowed" : "pointer",
                opacity: resendingVerification ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              {resendingVerification ? (
                <>
                  <div style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(251, 191, 36, 0.3)",
                    borderTop: "2px solid #fbbf24",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  Sending...
                </>
              ) : (
                "Resend Email"
              )}
            </button>
          </div>
        )}

        {/* User Info */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(to bottom right, #a855f7, #3b82f6)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold"
            }}>
              {user?.displayName?.[0] || user?.username?.[0] || "?"}
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "4px" }}>
                {user?.displayName || user?.username}
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>xolinks.me/@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* QR Code Sharing */}
        {user && <QRCodeCard username={user.username} displayName={user.displayName} />}

        {/* Connect Platforms */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Connect Your Accounts</h3>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "20px" }}>
            Connect your social accounts to add verified links. Only you can add links to accounts you own.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px"
          }}>
            {availablePlatforms.map((platform) => {
              const iconPath = platformIcons[platform.id.toLowerCase()];
              const isLocked = platform.proOnly && !isPro;

              const cardContent = (
                <>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: isLocked ? "#374151" : platform.color,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}>
                    {iconPath ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ opacity: isLocked ? 0.5 : 1 }}>
                        <path d={iconPath} />
                      </svg>
                    ) : (
                      <span style={{ fontWeight: "bold", fontSize: "16px", opacity: isLocked ? 0.5 : 1 }}>{platform.name[0]}</span>
                    )}
                    {isLocked && (
                      <div style={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "-4px",
                        width: "18px",
                        height: "18px",
                        backgroundColor: "#1f2937",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#9ca3af">
                          <path d="M12 1C8.676 1 6 3.676 6 7v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V11c0-1.1-.9-2-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <p style={{ fontWeight: "500", fontSize: "14px", opacity: isLocked ? 0.6 : 1 }}>{platform.name}</p>
                      {platform.proOnly && (
                        <span style={{
                          padding: "2px 6px",
                          backgroundColor: "rgba(168, 85, 247, 0.2)",
                          color: "#a855f7",
                          fontSize: "10px",
                          fontWeight: "600",
                          borderRadius: "4px",
                          textTransform: "uppercase"
                        }}>Pro</span>
                      )}
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "12px" }}>
                      {isLocked ? "Upgrade to Pro" : "Connect"}
                    </p>
                  </div>
                </>
              );

              if (isLocked) {
                return (
                  <Link
                    key={platform.id}
                    href="/upgrade"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      border: "1px solid #374151",
                      borderRadius: "12px",
                      textDecoration: "none",
                      color: "#fff",
                      transition: "border-color 0.2s",
                      cursor: "pointer"
                    }}
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <a
                  key={platform.id}
                  href={platform.oauthSupported ? `/api/platforms/connect/${platform.id}` : undefined}
                  onClick={!platform.oauthSupported ? (e) => {
                    e.preventDefault();
                    setMessage({ type: "error", text: `${platform.name} doesn't support OAuth. Add manually in Settings.` });
                  } : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px",
                    backgroundColor: "rgba(31, 41, 55, 0.5)",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "#fff",
                    transition: "border-color 0.2s",
                    cursor: "pointer"
                  }}
                >
                  {cardContent}
                </a>
              );
            })}
          </div>

          {availablePlatforms.length === 0 && (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "20px 0" }}>All platforms connected!</p>
          )}
        </div>

        {/* Connected Accounts */}
        {connections.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Connected Accounts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {connections.map((conn) => {
                const iconPath = platformIcons[conn.platform.toLowerCase()];
                return (
                  <div
                    key={conn.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px",
                      backgroundColor: "rgba(31, 41, 55, 0.5)",
                      border: "1px solid #374151",
                      borderRadius: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: conn.platformColor,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {iconPath ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                            <path d={iconPath} />
                          </svg>
                        ) : (
                          <span style={{ fontWeight: "bold" }}>{conn.platformName[0]}</span>
                        )}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "500" }}>{conn.platformName}</span>
                          <span style={{
                            padding: "2px 8px",
                            backgroundColor: "rgba(34, 197, 94, 0.2)",
                            color: "#4ade80",
                            fontSize: "11px",
                            borderRadius: "50px"
                          }}>Verified</span>
                        </div>
                        <p style={{ color: "#9ca3af", fontSize: "13px" }}>@{conn.platformUsername}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(conn.platform)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Custom Link - Pro Feature */}
        {isPro && (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showAddLink ? "16px" : "0" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>Add Custom Link</h3>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                  Add links to platforms like OnlyFans, Fansly, or any custom URL
                </p>
              </div>
              <button
                onClick={() => setShowAddLink(!showAddLink)}
                style={{
                  padding: "8px 16px",
                  background: showAddLink ? "rgba(107, 114, 128, 0.2)" : "linear-gradient(to right, #9333ea, #3b82f6)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                {showAddLink ? "Cancel" : "+ Add Link"}
              </button>
            </div>

            {showAddLink && (
              <form onSubmit={handleAddCustomLink} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "#9ca3af", marginBottom: "6px" }}>Platform</label>
                  <select
                    value={newLink.platform}
                    onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "rgba(31, 41, 55, 0.8)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px"
                    }}
                  >
                    <option value="">Custom / Other</option>
                    <option value="onlyfans">OnlyFans</option>
                    <option value="fansly">Fansly</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "#9ca3af", marginBottom: "6px" }}>Title</label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    placeholder="My OnlyFans"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "rgba(31, 41, 55, 0.8)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", color: "#9ca3af", marginBottom: "6px" }}>URL</label>
                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://onlyfans.com/yourname"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      backgroundColor: "rgba(31, 41, 55, 0.8)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingLink}
                  style={{
                    padding: "12px",
                    background: "linear-gradient(to right, #9333ea, #3b82f6)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: addingLink ? "not-allowed" : "pointer",
                    opacity: addingLink ? 0.7 : 1
                  }}
                >
                  {addingLink ? "Adding..." : "Add Link"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Your Links */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Your Links</h3>

          {links.length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "32px 0" }}>
              No links yet. Connect a platform above to add your first verified link!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {links.map((link) => (
                <div
                  key={link.id}
                  style={{
                    padding: "16px",
                    backgroundColor: "rgba(31, 41, 55, 0.5)",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    opacity: link.isActive ? 1 : 0.5
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h4 style={{ fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {link.title}
                        </h4>
                        {link.isVerified && (
                          <span style={{
                            padding: "2px 8px",
                            backgroundColor: "rgba(34, 197, 94, 0.2)",
                            color: "#4ade80",
                            fontSize: "11px",
                            borderRadius: "50px",
                            flexShrink: 0
                          }}>Verified</span>
                        )}
                      </div>
                      <p style={{ color: "#9ca3af", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {link.url}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px" }}>
                      {isPro && (
                        <button
                          onClick={() => setAbTestLink(link)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(168, 85, 247, 0.2)",
                            color: "#c084fc",
                            border: "none",
                            borderRadius: "50px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                        >
                          A/B Test
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(link)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: link.isActive ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)",
                          color: link.isActive ? "#4ade80" : "#9ca3af",
                          border: "none",
                          borderRadius: "50px",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        {link.isActive ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#9ca3af",
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <AchievementsSection />
      </main>

      {/* A/B Test Manager Modal */}
      {abTestLink && (
        <ABTestManager
          linkId={abTestLink.id}
          linkTitle={abTestLink.title}
          linkUrl={abTestLink.url}
          onClose={() => setAbTestLink(null)}
        />
      )}
    </div>
  );
}
