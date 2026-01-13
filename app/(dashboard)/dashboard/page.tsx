"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [addingLink, setAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    const res = await fetch("/api/user/links");
    if (res.ok) {
      const data = await res.json();
      setLinks(data.links);
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

        await fetchLinks();
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, fetchLinks]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingLink(true);

    try {
      const res = await fetch("/api/user/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });

      if (res.ok) {
        await fetchLinks();
        setNewLink({ title: "", url: "" });
        setShowAddLink(false);
      }
    } finally {
      setAddingLink(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;

    const res = await fetch(`/api/user/links/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLinks(links.filter((l) => l.id !== id));
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

  const handleUpdateLink = async (id: string, title: string, url: string) => {
    const res = await fetch(`/api/user/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    });

    if (res.ok) {
      await fetchLinks();
      setEditingLink(null);
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
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user?.displayName?.[0] || user?.username?.[0] || "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.displayName || user?.username}</h2>
              <p className="text-gray-400">xolinks.me/@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Your Links</h3>
            <button
              onClick={() => setShowAddLink(!showAddLink)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {showAddLink ? "Cancel" : "+ Add Link"}
            </button>
          </div>

          {/* Add Link Form */}
          {showAddLink && (
            <form onSubmit={handleAddLink} className="mb-6 p-4 bg-gray-800/50 rounded-xl">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Link Title"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addingLink}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {addingLink ? "Adding..." : "Add Link"}
              </button>
            </form>
          )}

          {/* Links List */}
          <div className="space-y-3">
            {links.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No links yet. Add your first link above!
              </p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className={`p-4 bg-gray-800/50 rounded-xl border ${
                    link.isActive ? "border-gray-700" : "border-gray-800 opacity-50"
                  }`}
                >
                  {editingLink === link.id ? (
                    <EditLinkForm
                      link={link}
                      onSave={handleUpdateLink}
                      onCancel={() => setEditingLink(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{link.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(link)}
                          className={`px-3 py-1 text-xs rounded-full ${
                            link.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {link.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => setEditingLink(link.id)}
                          className="p-2 text-gray-400 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-gray-400 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function EditLinkForm({
  link,
  onSave,
  onCancel,
}: {
  link: LinkData;
  onSave: (id: string, title: string, url: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(link.id, title, url)}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
