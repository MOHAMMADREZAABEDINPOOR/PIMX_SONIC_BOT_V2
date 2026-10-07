import { ExtractionResult, MediaItem } from "../types.ts";
import { fetchFromCobalt } from "../utils/cobalt.ts";

export async function extractYouTube(
  url: string,
  audioOnly = false,
): Promise<ExtractionResult> {
  try {
    const cobaltRes = await fetchFromCobalt({
      url,
      downloadMode: audioOnly ? "audio" : "auto",
      videoQuality: "1080",
      audioFormat: "mp3",
      youtubeVideoCodec: "h264",
    });

    if (cobaltRes.status === "error" || !cobaltRes.url) {
      return {
        success: false,
        error: cobaltRes.error?.code || "Failed to download YouTube video",
        platform: "youtube",
      };
    }

    const filename = cobaltRes.filename || (audioOnly ? "audio.mp3" : "video.mp4");
    const isAudio = audioOnly || filename.endsWith(".mp3") || filename.endsWith(".m4a");

    const item: MediaItem = {
      type: isAudio ? "audio" : "video",
      url: cobaltRes.url,
      title: filename.replace(/\.[^/.]+$/, ""),
      filename,
      sourceUrl: url,
      platform: "youtube",
      directDownloadUrl: cobaltRes.url,
    };

    return {
      success: true,
      media: [item],
      platform: "youtube",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
      platform: "youtube",
    };
  }
}
