import { ExtractionResult, MediaItem } from "../types.ts";
import { fetchFromCobalt } from "../utils/cobalt.ts";

export async function extractSoundCloud(url: string): Promise<ExtractionResult> {
  try {
    const cobaltRes = await fetchFromCobalt({
      url,
      downloadMode: "audio",
      audioFormat: "mp3",
    });

    if (cobaltRes.status === "error" || !cobaltRes.url) {
      return {
        success: false,
        error: cobaltRes.error?.code || "Failed to download SoundCloud track",
        platform: "soundcloud",
      };
    }

    const filename = cobaltRes.filename || "track.mp3";
    const title = filename.replace(/\.[^/.]+$/, "");

    const item: MediaItem = {
      type: "audio",
      url: cobaltRes.url,
      title,
      filename,
      sourceUrl: url,
      platform: "soundcloud",
      directDownloadUrl: cobaltRes.url,
    };

    return {
      success: true,
      media: [item],
      platform: "soundcloud",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
      platform: "soundcloud",
    };
  }
}
