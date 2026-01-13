"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface UserData {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: string;
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
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<AvailablePlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // Handle URL params for success/error messages
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "github_connected") {
      setMessage({ type: "success", text: "GitHub connected successfully!" });
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

    // Clear message after 5 seconds
    if (success || error) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, fetchPlatforms, fetchLinks]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">xolinks.me</h1>
          <div className="flex items-center gap-4">
            <Link
              href={`/${user?.username}`}
              target="_blank"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              View Profile
            </Link>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/50 text-green-400"
                : "bg-red-500/10 border border-red-500/50 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* User Info */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user?.displayName?.[0] || user?.username?.[0] || "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.displayName || user?.username}</h2>
              <p className="text-gray-400">xolinks.me/{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Connect Platforms Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Connect Your Accounts</h3>
          <p className="text-gray-400 text-sm mb-6">
            Connect your social accounts to add verified links. Only you can add links to accounts you own.
          </p>

          {/* Available Platforms to Connect */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availablePlatforms.map((platform) => (
              <a
                key={platform.id}
                href={`/api/platforms/connect/${platform.id}`}
                className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{platform.name}</p>
                  <p className="text-gray-500 text-xs">Connect</p>
                </div>
              </a>
            ))}
          </div>

          {availablePlatforms.length === 0 && (
            <p className="text-gray-500 text-center py-4">All platforms connected!</p>
          )}
        </div>

        {/* Connected Accounts */}
        {connections.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
            <div className="space-y-3">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: conn.platformColor }}
                    >
                      {conn.platformName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{conn.platformName}</p>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Verified
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">@{conn.platformUsername}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(conn.platform)}
                    className="text-gray-400 hover:text-red-400 text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Links */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Your Links</h3>

          <div className="space-y-3">
            {links.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No links yet. Connect a platform above to add your first verified link!
              </p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className={`p-4 bg-gray-800/50 rounded-xl border ${
                    link.isActive ? "border-gray-700" : "border-gray-800 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white truncate">{link.title}</h4>
                          {link.isVerified && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex-shrink-0">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">{link.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(link)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          link.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {link.isActive ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-2 text-gray-400 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
