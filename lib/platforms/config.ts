// Supported platforms for verified links
export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  urlPattern: string; // Regex to validate profile URLs
  profileUrlTemplate: string; // Template to build profile URL from username
  oauthSupported: boolean;
  oauthUrl?: string;
  scopes?: string[];
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  github: {
    id: "github",
    name: "GitHub",
    icon: "github",
    color: "#333333",
    urlPattern: "^https?://(www\\.)?github\\.com/[a-zA-Z0-9_-]+/?$",
    profileUrlTemplate: "https://github.com/{username}",
    oauthSupported: true,
    oauthUrl: "https://github.com/login/oauth/authorize",
    scopes: ["read:user"],
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    icon: "twitter",
    color: "#000000",
    urlPattern: "^https?://(www\\.)?(twitter|x)\\.com/[a-zA-Z0-9_]+/?$",
    profileUrlTemplate: "https://x.com/{username}",
    oauthSupported: true,
    oauthUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.read", "users.read"],
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "instagram",
    color: "#E4405F",
    urlPattern: "^https?://(www\\.)?instagram\\.com/[a-zA-Z0-9_.]+/?$",
    profileUrlTemplate: "https://instagram.com/{username}",
    oauthSupported: true,
    oauthUrl: "https://api.instagram.com/oauth/authorize",
    scopes: ["user_profile"],
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "youtube",
    color: "#FF0000",
    urlPattern: "^https?://(www\\.)?youtube\\.com/(@[a-zA-Z0-9_-]+|channel/[a-zA-Z0-9_-]+|c/[a-zA-Z0-9_-]+)/?$",
    profileUrlTemplate: "https://youtube.com/@{username}",
    oauthSupported: true,
    oauthUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "tiktok",
    color: "#000000",
    urlPattern: "^https?://(www\\.)?tiktok\\.com/@[a-zA-Z0-9_.]+/?$",
    profileUrlTemplate: "https://tiktok.com/@{username}",
    oauthSupported: true,
    oauthUrl: "https://www.tiktok.com/v2/auth/authorize/",
    scopes: ["user.info.basic"],
  },
  twitch: {
    id: "twitch",
    name: "Twitch",
    icon: "twitch",
    color: "#9146FF",
    urlPattern: "^https?://(www\\.)?twitch\\.tv/[a-zA-Z0-9_]+/?$",
    profileUrlTemplate: "https://twitch.tv/{username}",
    oauthSupported: true,
    oauthUrl: "https://id.twitch.tv/oauth2/authorize",
    scopes: ["user:read:email"],
  },
  discord: {
    id: "discord",
    name: "Discord",
    icon: "discord",
    color: "#5865F2",
    urlPattern: "^https?://(www\\.)?discord\\.(gg|com/invite)/[a-zA-Z0-9]+/?$",
    profileUrlTemplate: "https://discord.gg/{username}",
    oauthSupported: true,
    oauthUrl: "https://discord.com/api/oauth2/authorize",
    scopes: ["identify"],
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    icon: "spotify",
    color: "#1DB954",
    urlPattern: "^https?://open\\.spotify\\.com/(user|artist)/[a-zA-Z0-9]+/?$",
    profileUrlTemplate: "https://open.spotify.com/user/{username}",
    oauthSupported: true,
    oauthUrl: "https://accounts.spotify.com/authorize",
    scopes: ["user-read-private"],
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: "linkedin",
    color: "#0A66C2",
    urlPattern: "^https?://(www\\.)?linkedin\\.com/in/[a-zA-Z0-9_-]+/?$",
    profileUrlTemplate: "https://linkedin.com/in/{username}",
    oauthSupported: true,
    oauthUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scopes: ["r_liteprofile"],
  },
};

export const SUPPORTED_PLATFORMS = Object.keys(PLATFORMS);

export function getPlatformConfig(platformId: string): PlatformConfig | undefined {
  return PLATFORMS[platformId.toLowerCase()];
}

export function getPlatformFromUrl(url: string): string | undefined {
  for (const [platformId, config] of Object.entries(PLATFORMS)) {
    if (new RegExp(config.urlPattern, "i").test(url)) {
      return platformId;
    }
  }
  return undefined;
}
