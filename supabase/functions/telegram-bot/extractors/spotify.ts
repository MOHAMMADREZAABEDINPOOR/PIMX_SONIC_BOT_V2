import { ExtractionResult, MediaItem } from "../types.ts";
import { fetchFromCobalt } from "../utils/cobalt.ts";

export interface SpotifyTrackInfo {
  title: string;
  artist: string;
  thumbnailUrl?: string;
  duration?: number;
  previewUrl?: string;
}

export async function fetchSpotifyInfo(url: string): Promise<SpotifyTrackInfo | null> {
  const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
  if (!trackIdMatch) return null;

  const trackId = trackIdMatch[1];

  try {
    const embedRes = await fetch(
      `https://open.spotify.com/embed/track/${trackId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );

    if (embedRes.ok) {
      const html = await embedRes.text();
      const match = html.match(
        /<script id="__NEXT_DATA__" type="application\/json">([\s\S]+?)<\/script>/,
      );
      if (match) {
        const data = JSON.parse(match[1]);
        const track = data.props?.pageProps?.state?.data?.entity;
        if (track) {
          const title = track.name || "Unknown Track";
          const artist = track.artists?.map((a: { name: string }) => a.name).join(", ") ||
            "Unknown Artist";
          const duration = track.duration ? Math.round(track.duration / 1000) : undefined;
          const previewUrl = track.audioPreview?.url;

          // Try getting thumbnail from oEmbed
          let thumbnailUrl: string | undefined;
          try {
            const oembedRes = await fetch(
              `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`,
            );
            if (oembedRes.ok) {
              const odata = await oembedRes.json();
              thumbnailUrl = odata.thumbnail_url;
            }
          } catch {
            // Ignore oembed failure
          }

          return {
            title,
            artist,
            thumbnailUrl,
            duration,
            previewUrl,
          };
        }
      }
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: oEmbed only
  try {
    const oembedRes = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (oembedRes.ok) {
      const odata = await oembedRes.json();
      return {
        title: odata.title || "Spotify Track",
        artist: "Spotify",
        thumbnailUrl: odata.thumbnail_url,
      };
    }
  } catch {
    // Ignore
  }

  return null;
}

export async function extractSpotify(url: string): Promise<ExtractionResult> {
  const info = await fetchSpotifyInfo(url);
  if (!info) {
    return {
      success: false,
      error: "Could not retrieve Spotify track details",
      platform: "spotify",
    };
  }

  const query = `${info.artist} - ${info.title}`;

  // Search YouTube for full audio track
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const ytSearchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (ytSearchRes.ok) {
      const html = await ytSearchRes.text();
      const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

        const cobaltRes = await fetchFromCobalt({
          url: youtubeUrl,
          downloadMode: "audio",
          audioFormat: "mp3",
        });

        if (cobaltRes.status !== "error" && cobaltRes.url) {
          const item: MediaItem = {
            type: "audio",
            url: cobaltRes.url,
            title: info.title,
            author: info.artist,
            filename: `${info.artist} - ${info.title}.mp3`,
            thumbnailUrl: info.thumbnailUrl,
            duration: info.duration,
            sourceUrl: url,
            platform: "spotify",
            directDownloadUrl: cobaltRes.url,
          };

          return {
            success: true,
            media: [item],
            platform: "spotify",
          };
        }
      }
    }
  } catch {
    // Fallback to preview
  }

  // Fallback: If full track search fails, provide Spotify audio preview
  if (info.previewUrl) {
    const item: MediaItem = {
      type: "audio",
      url: info.previewUrl,
      title: `${info.title} (Preview)`,
      author: info.artist,
      filename: `${info.artist} - ${info.title} (Preview).mp3`,
      thumbnailUrl: info.thumbnailUrl,
      duration: 30,
      sourceUrl: url,
      platform: "spotify",
      directDownloadUrl: info.previewUrl,
    };

    return {
      success: true,
      media: [item],
      platform: "spotify",
    };
  }

  return {
    success: false,
    error: `Track identified: "${info.artist} - ${info.title}", but audio stream could not be resolved`,
    platform: "spotify",
  };
}
