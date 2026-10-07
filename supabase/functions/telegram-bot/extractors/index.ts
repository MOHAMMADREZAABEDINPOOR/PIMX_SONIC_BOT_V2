import { ExtractionResult } from "../types.ts";
import { detectPlatform } from "../utils/helpers.ts";
import { extractYouTube } from "./youtube.ts";
import { extractTwitter } from "./twitter.ts";
import { extractInstagram } from "./instagram.ts";
import { extractSoundCloud } from "./soundcloud.ts";
import { extractSpotify } from "./spotify.ts";
import { fetchFromCobalt } from "../utils/cobalt.ts";

export async function extractMedia(
  url: string,
  audioOnly = false,
): Promise<ExtractionResult> {
  const platform = detectPlatform(url);

  switch (platform) {
    case "youtube":
      return await extractYouTube(url, audioOnly);
    case "twitter":
      return await extractTwitter(url);
    case "instagram":
      return await extractInstagram(url);
    case "soundcloud":
      return await extractSoundCloud(url);
    case "spotify":
      return await extractSpotify(url);
    case "generic":
    default: {
      // Try Cobalt for any generic video/audio platform (TikTok, Reddit, Facebook, Vimeo, etc.)
      try {
        const cobaltRes = await fetchFromCobalt({
          url,
          downloadMode: audioOnly ? "audio" : "auto",
        });

        if (cobaltRes.status !== "error" && cobaltRes.url) {
          const filename = cobaltRes.filename || (audioOnly ? "audio.mp3" : "video.mp4");
          const isAudio = audioOnly || filename.endsWith(".mp3") || filename.endsWith(".m4a");

          return {
            success: true,
            media: [
              {
                type: isAudio ? "audio" : "video",
                url: cobaltRes.url,
                title: filename.replace(/\.[^/.]+$/, ""),
                filename,
                sourceUrl: url,
                platform: "generic",
                directDownloadUrl: cobaltRes.url,
              },
            ],
            platform: "generic",
          };
        }

        return {
          success: false,
          error: cobaltRes.error?.code || "Unsupported or invalid media link",
          platform: "generic",
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          error: msg,
          platform: "generic",
        };
      }
    }
  }
}
