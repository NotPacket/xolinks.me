"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const THEMES = [
  { id: "space", name: "Space", gradient: "linear-gradient(to bottom right, #581c87, #1e3a8a, #000)", desc: "Twinkling stars" },
  { id: "midnight", name: "Midnight", gradient: "linear-gradient(to bottom right, #0f172a, #1e3a5f, #0f172a)", desc: "Floating particles" },
  { id: "sunset", name: "Sunset", gradient: "linear-gradient(to bottom right, #7c2d12, #991b1b, #9d174d)", desc: "Rising embers" },
  { id: "forest", name: "Forest", gradient: "linear-gradient(to bottom right, #052e16, #064e3b, #134e4a)", desc: "Fireflies" },
  { id: "ocean", name: "Ocean", gradient: "linear-gradient(to bottom right, #083344, #134e4a, #1e3a5f)", desc: "Bubbles & caustics" },
  { id: "noir", name: "Noir", gradient: "#000", desc: "Subtle smoke" },
  { id: "lavender", name: "Lavender", gradient: "linear-gradient(to bottom right, #2e1065, #581c87, #701a75)", desc: "Floating petals" },
  { id: "cherry", name: "Cherry", gradient: "linear-gradient(to bottom right, #4c0519, #7f1d1d, #831843)", desc: "Sakura petals" },
];

interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  theme: string;
  lastUsernameChange: string | null;
}

const cardStyle = {
  backgroundColor: "rgba(17, 24, 39, 0.6)",
  border: "1px solid #374151",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "24px"
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  backgroundColor: "#1f2937",
  border: "1px solid #374151",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box" as const
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "500" as const,
  color: "#d1d5db",
  marginBottom: "8px"
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [nextUsernameChangeDate, setNextUsernameChangeDate] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
    location: "",
    theme: "space",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setCanChangeUsername(data.canChangeUsername);
        setNextUsernameChangeDate(data.nextUsernameChangeDate);
        setAvatarUrl(data.user.avatarUrl || null);
        setFormData({
          username: data.user.username || "",
          displayName: data.user.displayName || "",
          bio: data.user.bio || "",
          location: data.user.location || "",
          theme: data.user.theme || "space",
        });
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" });
        return;
      }

      setUser(data.user);
      setMessage({ type: "success", text: "Profile saved!" });

      // If username changed, update state
      if (data.user.username !== user?.username) {
        setCanChangeUsername(false);
        const nextChange = new Date();
        nextChange.setMonth(nextChange.getMonth() + 1);
        setNextUsernameChangeDate(nextChange.toISOString());
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to upload avatar" });
        return;
      }

      setAvatarUrl(data.avatarUrl);
      setMessage({ type: "success", text: "Avatar uploaded successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to upload avatar" });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleAvatarDelete = async () => {
    if (!avatarUrl) return;

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to remove avatar" });
        return;
      }

      setAvatarUrl(null);
      setMessage({ type: "success", text: "Avatar removed successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to remove avatar" });
    } finally {
      setUploadingAvatar(false);
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
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #374151",
            borderTop: "3px solid #a855f7",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite"
          }} />
          Loading settings...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      color: "#fff"
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
          maxWidth: "700px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Settings</h1>
          <Link href="/dashboard" style={{ color: "#a855f7", textDecoration: "none", fontSize: "14px" }}>
            Dashboard
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Message */}
        {message && (
          <div style={{
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            backgroundColor: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: message.type === "success" ? "#4ade80" : "#f87171",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            {message.type === "success" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        {/* Username Section */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #a855f7, #ec4899)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Username</h2>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>Your unique profile URL</p>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Username</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280"
              }}>@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                disabled={!canChangeUsername}
                maxLength={30}
                style={{
                  ...inputStyle,
                  paddingLeft: "36px",
                  backgroundColor: canChangeUsername ? "#1f2937" : "rgba(31, 41, 55, 0.5)",
                  color: canChangeUsername ? "#fff" : "#9ca3af",
                  cursor: canChangeUsername ? "text" : "not-allowed"
                }}
              />
            </div>
            <p style={{ marginTop: "8px", fontSize: "13px", color: "#6b7280" }}>
              xolinks.me/@{formData.username || "yourname"}
            </p>
            {!canChangeUsername && nextUsernameChangeDate && (
              <p style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                You can change your username again on {new Date(nextUsernameChangeDate).toLocaleDateString()}
              </p>
            )}
            {canChangeUsername && user?.username !== formData.username && formData.username && (
              <p style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                You can only change your username once per month
              </p>
            )}
          </div>
        </div>

        {/* Avatar Section */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Profile Picture</h2>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>Upload a custom avatar</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Avatar Preview */}
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              padding: "3px",
              background: "linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)",
              flexShrink: 0
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "#1f2937",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: "bold",
                color: "#fff",
                overflow: "hidden"
              }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  formData.displayName?.[0]?.toUpperCase() || formData.username?.[0]?.toUpperCase() || "?"
                )}
              </div>
            </div>

            {/* Upload Controls */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <label style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  background: "linear-gradient(135deg, #9333ea, #3b82f6)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: uploadingAvatar ? "not-allowed" : "pointer",
                  opacity: uploadingAvatar ? 0.7 : 1,
                  transition: "all 0.2s"
                }}>
                  {uploadingAvatar ? (
                    <>
                      <div style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Upload Photo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    style={{ display: "none" }}
                  />
                </label>

                {avatarUrl && (
                  <button
                    onClick={handleAvatarDelete}
                    disabled={uploadingAvatar}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "10px",
                      color: "#f87171",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: uploadingAvatar ? "not-allowed" : "pointer",
                      opacity: uploadingAvatar ? 0.7 : 1,
                      transition: "all 0.2s"
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
              <p style={{ marginTop: "12px", fontSize: "12px", color: "#6b7280" }}>
                JPG, PNG, GIF, or WebP. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Profile Information</h2>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>How others see you</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your display name"
                maxLength={100}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={3}
                maxLength={500}
                style={{ ...inputStyle, resize: "none", minHeight: "100px" }}
              />
              <p style={{ marginTop: "6px", fontSize: "12px", color: "#6b7280" }}>{formData.bio.length}/500 characters</p>
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                maxLength={100}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #ec4899, #f59e0b)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <circle cx="13.5" cy="6.5" r="2.5" />
                <circle cx="19" cy="17" r="2" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Profile Theme</h2>
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>Each theme has unique animations</p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "12px"
          }}>
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setFormData({ ...formData, theme: theme.id })}
                style={{
                  position: "relative",
                  padding: "4px",
                  borderRadius: "14px",
                  border: formData.theme === theme.id ? "2px solid #a855f7" : "2px solid transparent",
                  background: "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                <div style={{
                  height: "70px",
                  borderRadius: "10px",
                  background: theme.gradient,
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Animated preview dots */}
                  {theme.id === "space" && (
                    <div style={{ position: "absolute", inset: 0 }}>
                      {[...Array(8)].map((_, i) => (
                        <div key={i} style={{
                          position: "absolute",
                          width: "2px",
                          height: "2px",
                          backgroundColor: "#fff",
                          borderRadius: "50%",
                          left: `${10 + i * 12}%`,
                          top: `${20 + (i % 3) * 25}%`,
                          animation: `twinkle ${1 + i * 0.2}s ease-in-out infinite`
                        }} />
                      ))}
                    </div>
                  )}
                </div>
                <p style={{ marginTop: "8px", fontSize: "13px", color: "#d1d5db", fontWeight: "500" }}>{theme.name}</p>
                <p style={{ fontSize: "11px", color: "#6b7280" }}>{theme.desc}</p>
                {formData.theme === theme.id && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#a855f7",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="#fff">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #9333ea, #3b82f6)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {saving ? (
            <>
              <div style={{
                width: "18px",
                height: "18px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid #fff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Saving...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Changes
            </>
          )}
        </button>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); }}
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
      </main>
    </div>
  );
}
