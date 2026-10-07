export function extractUrls(text?: string): string[] {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  if (!matches) return [];
  return matches.map((u) => u.replace(/[)\]>,."']+$/, ""));
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "Unknown size";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function detectPlatform(
  url: string,
): "youtube" | "twitter" | "instagram" | "soundcloud" | "spotify" | "generic" {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "youtube";
  }
  if (
    lower.includes("twitter.com") ||
    lower.includes("x.com") ||
    lower.includes("fxtwitter.com") ||
    lower.includes("vxtwitter.com")
  ) {
    return "twitter";
  }
  if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
    return "instagram";
  }
  if (lower.includes("soundcloud.com") || lower.includes("snd.sc")) {
    return "soundcloud";
  }
  if (lower.includes("spotify.com") || lower.includes("spoti.fi")) {
    return "spotify";
  }
  return "generic";
}
