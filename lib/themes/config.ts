// Profile themes for user profiles - using inline style values
export interface Theme {
  id: string;
  name: string;
  preview: string; // Preview gradient for settings
  background: string; // CSS background value
  cardBg: string;
  cardBorder: string;
  cardHoverBg: string;
  cardHoverBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

export const THEMES: Record<string, Theme> = {
  space: {
    id: "space",
    name: "Space",
    preview: "linear-gradient(to bottom right, #581c87, #1e3a8a, #000)",
    background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #000)",
    cardBg: "rgba(31, 41, 55, 0.5)",
    cardBorder: "#374151",
    cardHoverBg: "rgba(31, 41, 55, 0.7)",
    cardHoverBorder: "rgba(168, 85, 247, 0.5)",
    textPrimary: "#ffffff",
    textSecondary: "#9ca3af",
    accent: "#a855f7",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    preview: "linear-gradient(to bottom right, #0f172a, #172554, #0f172a)",
    background: "linear-gradient(to bottom right, #0f172a, #172554, #0f172a)",
    cardBg: "rgba(30, 41, 59, 0.5)",
    cardBorder: "#334155",
    cardHoverBg: "rgba(30, 41, 59, 0.7)",
    cardHoverBorder: "rgba(59, 130, 246, 0.5)",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
    accent: "#60a5fa",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    preview: "linear-gradient(to bottom right, #7c2d12, #991b1b, #9d174d)",
    background: "linear-gradient(to bottom right, #7c2d12, #991b1b, #9d174d)",
    cardBg: "rgba(127, 29, 29, 0.3)",
    cardBorder: "rgba(153, 27, 27, 0.5)",
    cardHoverBg: "rgba(127, 29, 29, 0.4)",
    cardHoverBorder: "rgba(249, 115, 22, 0.5)",
    textPrimary: "#ffffff",
    textSecondary: "#fed7aa",
    accent: "#fb923c",
  },
  forest: {
    id: "forest",
    name: "Forest",
    preview: "linear-gradient(to bottom right, #052e16, #064e3b, #134e4a)",
    background: "linear-gradient(to bottom right, #052e16, #064e3b, #134e4a)",
    cardBg: "rgba(6, 78, 59, 0.3)",
    cardBorder: "rgba(6, 95, 70, 0.5)",
    cardHoverBg: "rgba(6, 78, 59, 0.4)",
    cardHoverBorder: "rgba(34, 197, 94, 0.5)",
    textPrimary: "#ffffff",
    textSecondary: "#6ee7b7",
    accent: "#34d399",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    preview: "linear-gradient(to bottom right, #083344, #134e4a, #172554)",
    background: "linear-gradient(to bottom right, #083344, #134e4a, #172554)",
    cardBg: "rgba(19, 78, 74, 0.3)",
    cardBorder: "rgba(17, 94, 89, 0.5)",
    cardHoverBg: "rgba(19, 78, 74, 0.4)",
    cardHoverBorder: "rgba(34, 211, 238, 0.5)",
    textPrimary: "#ffffff",
    textSecondary: "#67e8f9",
    accent: "#22d3ee",
  },
  noir: {
    id: "noir",
    name: "Noir",
    preview: "#000000",
    background: "#000000",
    cardBg: "rgba(24, 24, 27, 0.8)",
    cardBorder: "#27272a",
    cardHoverBg: "#27272a",
    cardHoverBorder: "#52525b",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    accent: "#d4d4d8",
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    preview: "linear-gradient(to bottom right, #2e1065, #581c87, #701a75)",
    background: "linear-gradient(to bottom right, #2e1065, #581c87, #701a75)",
    cardBg: "rgba(76, 29, 149, 0.3)",
    cardBorder: "rgba(91, 33, 182, 0.5)",
    cardHoverBg: "rgba(76, 29, 149, 0.4)",
    cardHoverBorder: "rgba(139, 92, 246, 0.5)",
    textPrimary: "#ffffff",
    textSecondary: "#c4b5fd",
    accent: "#a78bfa",
  },
  cherry: {
    id: "cherry",
    name: "Cherry",
    preview: "linear-gradient(to bottom right, #4c0519, #7f1d1d, #831843)",
    background: "linear-gradient(to bottom right, #4c0519, #7f1d1d, #831843)",
    cardBg: "rgba(136, 19, 55, 0.3)",
    cardBorder: "rgba(159, 18, 57, 0.5)",
    cardHoverBg: "rgba(136, 19, 55, 0.4)",
    cardHoverBorder: "rgba(244, 63, 94, 0.5)",
    textPrimary: "#ffffff",
    textSecondary: "#fda4af",
    accent: "#fb7185",
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(themeId: string): Theme {
  return THEMES[themeId] || THEMES.space;
}
