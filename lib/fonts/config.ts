// Available Google Fonts for Pro users
export interface FontConfig {
  id: string;
  name: string;
  family: string;
  category: "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
  weights: number[];
}

export const AVAILABLE_FONTS: FontConfig[] = [
  // Sans-serif fonts
  {
    id: "inter",
    name: "Inter",
    family: "'Inter', sans-serif",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "poppins",
    name: "Poppins",
    family: "'Poppins', sans-serif",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "nunito",
    name: "Nunito",
    family: "'Nunito', sans-serif",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: "'Montserrat', sans-serif",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "open-sans",
    name: "Open Sans",
    family: "'Open Sans', sans-serif",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "roboto",
    name: "Roboto",
    family: "'Roboto', sans-serif",
    category: "sans-serif",
    weights: [400, 500, 700],
  },
  {
    id: "lato",
    name: "Lato",
    family: "'Lato', sans-serif",
    category: "sans-serif",
    weights: [400, 700],
  },
  {
    id: "raleway",
    name: "Raleway",
    family: "'Raleway', sans-serif",
    category: "sans-serif",
    weights: [400, 500, 600, 700],
  },

  // Serif fonts
  {
    id: "playfair-display",
    name: "Playfair Display",
    family: "'Playfair Display', serif",
    category: "serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "merriweather",
    name: "Merriweather",
    family: "'Merriweather', serif",
    category: "serif",
    weights: [400, 700],
  },
  {
    id: "lora",
    name: "Lora",
    family: "'Lora', serif",
    category: "serif",
    weights: [400, 500, 600, 700],
  },
  {
    id: "crimson-pro",
    name: "Crimson Pro",
    family: "'Crimson Pro', serif",
    category: "serif",
    weights: [400, 500, 600, 700],
  },

  // Display fonts
  {
    id: "bebas-neue",
    name: "Bebas Neue",
    family: "'Bebas Neue', sans-serif",
    category: "display",
    weights: [400],
  },
  {
    id: "righteous",
    name: "Righteous",
    family: "'Righteous', sans-serif",
    category: "display",
    weights: [400],
  },
  {
    id: "russo-one",
    name: "Russo One",
    family: "'Russo One', sans-serif",
    category: "display",
    weights: [400],
  },
  {
    id: "archivo-black",
    name: "Archivo Black",
    family: "'Archivo Black', sans-serif",
    category: "display",
    weights: [400],
  },

  // Handwriting fonts
  {
    id: "dancing-script",
    name: "Dancing Script",
    family: "'Dancing Script', cursive",
    category: "handwriting",
    weights: [400, 500, 600, 700],
  },
  {
    id: "pacifico",
    name: "Pacifico",
    family: "'Pacifico', cursive",
    category: "handwriting",
    weights: [400],
  },
  {
    id: "satisfy",
    name: "Satisfy",
    family: "'Satisfy', cursive",
    category: "handwriting",
    weights: [400],
  },
  {
    id: "caveat",
    name: "Caveat",
    family: "'Caveat', cursive",
    category: "handwriting",
    weights: [400, 500, 600, 700],
  },

  // Monospace fonts
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
    category: "monospace",
    weights: [400, 500, 600, 700],
  },
  {
    id: "fira-code",
    name: "Fira Code",
    family: "'Fira Code', monospace",
    category: "monospace",
    weights: [400, 500, 600, 700],
  },
  {
    id: "source-code-pro",
    name: "Source Code Pro",
    family: "'Source Code Pro', monospace",
    category: "monospace",
    weights: [400, 500, 600, 700],
  },
];

export function getFont(fontId: string | null | undefined): FontConfig | null {
  if (!fontId) return null;
  return AVAILABLE_FONTS.find((f) => f.id === fontId) || null;
}

export function getFontFamily(fontId: string | null | undefined): string {
  const font = getFont(fontId);
  return font?.family || "inherit";
}

export function getGoogleFontsUrl(fontIds: (string | null | undefined)[]): string | null {
  const fonts = fontIds
    .map((id) => getFont(id))
    .filter((f): f is FontConfig => f !== null);

  if (fonts.length === 0) return null;

  const families = fonts.map((font) => {
    const name = font.name.replace(/\s+/g, "+");
    const weights = font.weights.join(";");
    return `family=${name}:wght@${weights}`;
  });

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export const FONT_CATEGORIES = [
  { id: "sans-serif", name: "Sans Serif" },
  { id: "serif", name: "Serif" },
  { id: "display", name: "Display" },
  { id: "handwriting", name: "Handwriting" },
  { id: "monospace", name: "Monospace" },
] as const;
