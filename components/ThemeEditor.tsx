"use client";

import { useState, useEffect } from "react";

interface CustomTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  accentColor: string | null;
  fontFamily: string | null;
  isActive: boolean;
  createdAt: string;
}

interface ThemeEditorProps {
  onThemeApplied?: () => void;
}

const defaultTheme = {
  name: "",
  backgroundColor: "#030712",
  textColor: "#ffffff",
  buttonColor: "#a855f7",
  buttonTextColor: "#ffffff",
  accentColor: "#3b82f6",
  fontFamily: "",
};

export default function ThemeEditor({ onThemeApplied }: ThemeEditorProps) {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CustomTheme | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [formData, setFormData] = useState(defaultTheme);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const res = await fetch("/api/user/themes");
      if (res.ok) {
        const data = await res.json();
        setThemes(data.themes);
      }
    } catch (error) {
      console.error("Failed to fetch themes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setFormData(defaultTheme);
    setShowEditor(true);
  };

  const handleEdit = (theme: CustomTheme) => {
    setEditing(theme);
    setFormData({
      name: theme.name,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      buttonColor: theme.buttonColor,
      buttonTextColor: theme.buttonTextColor,
      accentColor: theme.accentColor || "#3b82f6",
      fontFamily: theme.fontFamily || "",
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Theme name is required" });
      return;
    }

    setSaving(true);
    try {
      const url = editing
        ? `/api/user/themes/${editing.id}`
        : "/api/user/themes";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: editing ? "Theme updated!" : "Theme created!",
        });
        setShowEditor(false);
        fetchThemes();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save theme" });
      }
    } catch (error) {
      console.error("Save theme error:", error);
      setMessage({ type: "error", text: "Failed to save theme" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this theme?")) return;

    try {
      const res = await fetch(`/api/user/themes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "success", text: "Theme deleted" });
        fetchThemes();
      }
    } catch (error) {
      console.error("Delete theme error:", error);
    }
  };

  const handleApply = async (theme: CustomTheme) => {
    try {
      const res = await fetch(`/api/user/themes/${theme.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Applied "${theme.name}" theme!` });
        fetchThemes();
        onThemeApplied?.();
      }
    } catch (error) {
      console.error("Apply theme error:", error);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
          Loading themes...
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
        }}
      >
        <div>
          <h3
            style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}
          >
            Custom Themes
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>
            Create and manage your own profile themes
          </p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #a855f7, #3b82f6)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Create Theme
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            backgroundColor:
              message.type === "success"
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: message.type === "success" ? "#4ade80" : "#f87171",
            fontSize: "14px",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Theme Editor Modal */}
      {showEditor && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditor(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "20px",
              }}
            >
              {editing ? "Edit Theme" : "Create New Theme"}
            </h3>

            {/* Theme Name */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#9ca3af",
                  marginBottom: "6px",
                }}
              >
                Theme Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Custom Theme"
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "rgba(55, 65, 81, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Color Pickers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {[
                {
                  label: "Background",
                  key: "backgroundColor" as const,
                },
                { label: "Text", key: "textColor" as const },
                { label: "Button", key: "buttonColor" as const },
                {
                  label: "Button Text",
                  key: "buttonTextColor" as const,
                },
                { label: "Accent", key: "accentColor" as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                    }}
                  >
                    {label} Color
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="color"
                      value={formData[key] || "#000000"}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                      style={{
                        width: "48px",
                        height: "40px",
                        borderRadius: "8px",
                        border: "1px solid #374151",
                        cursor: "pointer",
                      }}
                    />
                    <input
                      type="text"
                      value={formData[key] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                      placeholder="#000000"
                      style={{
                        flex: 1,
                        padding: "10px",
                        backgroundColor: "rgba(55, 65, 81, 0.5)",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#9ca3af",
                  marginBottom: "10px",
                }}
              >
                Preview
              </label>
              <div
                style={{
                  padding: "24px",
                  backgroundColor: formData.backgroundColor,
                  borderRadius: "12px",
                  border: "1px solid #374151",
                }}
              >
                <p
                  style={{
                    color: formData.textColor,
                    marginBottom: "12px",
                    fontSize: "14px",
                  }}
                >
                  This is how your profile will look
                </p>
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: formData.buttonColor,
                    color: formData.buttonTextColor,
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "default",
                  }}
                >
                  Sample Button
                </button>
                <div
                  style={{
                    marginTop: "12px",
                    height: "4px",
                    width: "60%",
                    backgroundColor: formData.accentColor || "#3b82f6",
                    borderRadius: "2px",
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowEditor(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "rgba(55, 65, 81, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#9ca3af",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Theme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Themes List */}
      {themes.length === 0 ? (
        <p
          style={{
            color: "#6b7280",
            textAlign: "center",
            padding: "32px 0",
          }}
        >
          No custom themes yet. Create your first theme!
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {themes.map((theme) => (
            <div
              key={theme.id}
              style={{
                padding: "16px",
                backgroundColor: "rgba(31, 41, 55, 0.5)",
                border: theme.isActive
                  ? "2px solid #a855f7"
                  : "1px solid #374151",
                borderRadius: "12px",
              }}
            >
              {/* Mini Preview */}
              <div
                style={{
                  height: "60px",
                  backgroundColor: theme.backgroundColor,
                  borderRadius: "8px",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                }}
              >
                <div
                  style={{
                    padding: "6px 16px",
                    backgroundColor: theme.buttonColor,
                    color: theme.buttonTextColor,
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  Preview
                </div>
              </div>

              {/* Theme Info */}
              <div style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {theme.name}
                  </h4>
                  {theme.isActive && (
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "rgba(139, 92, 246, 0.2)",
                        color: "#a855f7",
                        fontSize: "10px",
                        borderRadius: "50px",
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px" }}>
                {!theme.isActive && (
                  <button
                    onClick={() => handleApply(theme)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#a855f7",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                )}
                <button
                  onClick={() => handleEdit(theme)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor: "rgba(55, 65, 81, 0.5)",
                    border: "none",
                    borderRadius: "6px",
                    color: "#9ca3af",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(theme.id)}
                  style={{
                    padding: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "none",
                    borderRadius: "6px",
                    color: "#f87171",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
