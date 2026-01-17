"use client";

import { useState, useEffect } from "react";

interface Variant {
  id: string;
  name: string;
  title: string;
  url: string;
  weight: number;
  impressions: number;
  clicks: number;
  isActive: boolean;
  clickRate: string;
}

interface ABTestManagerProps {
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  onClose: () => void;
}

export default function ABTestManager({ linkId, linkTitle, linkUrl, onClose }: ABTestManagerProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New variant form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: "",
    title: linkTitle,
    url: linkUrl,
    weight: 50,
  });

  useEffect(() => {
    fetchVariants();
  }, [linkId]);

  const fetchVariants = async () => {
    try {
      const res = await fetch(`/api/user/links/${linkId}/variants`);
      const data = await res.json();
      if (res.ok) {
        setVariants(data.variants || []);
        setAbTestEnabled(data.abTestEnabled || false);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleABTest = async () => {
    if (!abTestEnabled && variants.length < 2) {
      setError("Add at least 2 variants to enable A/B testing");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/user/links/${linkId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abTestEnabled: !abTestEnabled }),
      });
      const data = await res.json();
      if (res.ok) {
        setAbTestEnabled(data.abTestEnabled);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to update A/B test settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.name || !newVariant.title || !newVariant.url) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/user/links/${linkId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVariant),
      });
      const data = await res.json();
      if (res.ok) {
        setVariants([...variants, { ...data.variant, clickRate: "0.00" }]);
        setNewVariant({ name: "", title: linkTitle, url: linkUrl, weight: 50 });
        setShowAddForm(false);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to add variant");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Delete this variant?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/user/links/${linkId}/variants/${variantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVariants(variants.filter((v) => v.id !== variantId));
        if (variants.length <= 2) {
          setAbTestEnabled(false);
        }
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch {
      setError("Failed to delete variant");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVariant = async (variantId: string, updates: Partial<Variant>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/user/links/${linkId}/variants/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        setVariants(variants.map((v) => (v.id === variantId ? { ...v, ...data.variant } : v)));
        setError(null);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to update variant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl mx-4 my-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">A/B Testing</h2>
            <p className="text-sm text-gray-400 mt-1">Test different versions of your link</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Original Link Info */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Original Link</p>
          <p className="text-white font-medium">{linkTitle}</p>
          <p className="text-sm text-gray-400 truncate">{linkUrl}</p>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-6 flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div>
            <p className="text-white font-medium">Enable A/B Testing</p>
            <p className="text-sm text-gray-400">
              {variants.length < 2 ? "Add at least 2 variants to enable" : "Randomly show different versions to visitors"}
            </p>
          </div>
          <button
            onClick={handleToggleABTest}
            disabled={saving || variants.length < 2}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              abTestEnabled ? "bg-purple-600" : "bg-gray-600"
            } ${variants.length < 2 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                abTestEnabled ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Variants List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Variants ({variants.length}/4)</h3>
            {variants.length < 4 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                + Add Variant
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-700 rounded-lg">
              <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400">No variants yet</p>
              <p className="text-sm text-gray-500 mt-1">Add at least 2 variants to start A/B testing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                          {variant.name}
                        </span>
                        <span className="text-xs text-gray-500">{variant.weight}% traffic</span>
                      </div>
                      <p className="text-white font-medium truncate">{variant.title}</p>
                      <p className="text-sm text-gray-400 truncate">{variant.url}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{variant.clickRate}%</p>
                      <p className="text-xs text-gray-500">
                        {variant.clicks} / {variant.impressions} clicks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={variant.weight}
                      onChange={(e) => handleUpdateVariant(variant.id, { weight: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <button
                      onClick={() => handleDeleteVariant(variant.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Variant Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-purple-500/50">
            <h4 className="text-sm font-medium text-white mb-3">New Variant</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Variant Name (e.g., "A", "Version 2")</label>
                <input
                  type="text"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  placeholder="B"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newVariant.title}
                  onChange={(e) => setNewVariant({ ...newVariant, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">URL</label>
                <input
                  type="url"
                  value={newVariant.url}
                  onChange={(e) => setNewVariant({ ...newVariant, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Traffic Weight: {newVariant.weight}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newVariant.weight}
                  onChange={(e) => setNewVariant({ ...newVariant, weight: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 px-4 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVariant}
                  disabled={saving}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Variant"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
