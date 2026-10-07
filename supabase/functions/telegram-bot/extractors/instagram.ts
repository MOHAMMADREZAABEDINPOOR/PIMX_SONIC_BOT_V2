import { ExtractionResult, MediaItem } from "../types.ts";
import { fetchFromCobalt } from "../utils/cobalt.ts";

export async function extractInstagram(url: string): Promise<ExtractionResult> {
  // Normalize url
  const cleanUrl = url.split("?")[0];

  try {
    const cobaltRes = await fetchFromCobalt({
      url: cleanUrl,
      downloadMode: "auto",
      videoQuality: "1080",
    });

    if (cobaltRes.status === "picker" && cobaltRes.picker && cobaltRes.picker.length > 0) {
      const items: MediaItem[] = cobaltRes.picker.map((p, idx) => ({
        type: p.type === "photo" ? "photo" : "video",
        url: p.url,
        title: `Instagram Media ${idx + 1}`,
        thumbnailUrl: p.thumb,
        sourceUrl: url,
        platform: "instagram",
        directDownloadUrl: p.url,
      }));

      return {
        success: true,
        media: items,
        platform: "instagram",
      };
    }

    if (cobaltRes.status === "tunnel" || cobaltRes.status === "redirect") {
      if (cobaltRes.url) {
        return {
          success: true,
          media: [
            {
              type: "video",
              url: cobaltRes.url,
              title: cobaltRes.filename || "Instagram Reel",
              filename: cobaltRes.filename || "instagram_reel.mp4",
              sourceUrl: url,
              platform: "instagram",
              directDownloadUrl: cobaltRes.url,
            },
          ],
          platform: "instagram",
        };
      }
    }

    if (cobaltRes.error) {
      return {
        success: false,
        error: cobaltRes.error.code || "Failed to download Instagram media",
        platform: "instagram",
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
      platform: "instagram",
    };
  }

  return {
    success: false,
    error: "Could not extract Instagram content",
    platform: "instagram",
  };
}
