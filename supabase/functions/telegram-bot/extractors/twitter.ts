import { ExtractionResult, MediaItem } from "../types.ts";
import { fetchFromCobalt } from "../utils/cobalt.ts";

export async function extractTwitter(url: string): Promise<ExtractionResult> {
  const tweetIdMatch = url.match(/status\/(\d+)/i);
  const tweetId = tweetIdMatch ? tweetIdMatch[1] : null;

  if (tweetId) {
    try {
      const endpoints = [
        `https://api.fxtwitter.com/2/status/${tweetId}`,
        `https://api.fxtwitter.com/Twitter/status/${tweetId}`,
      ];

      for (const endpoint of endpoints) {
        const res = await fetch(endpoint, {
          headers: {
            "User-Agent": "TelegramBot/1.0",
            Accept: "application/json",
          },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const tweet = data.status || data.tweet;

        if (tweet) {
          const mediaItems: MediaItem[] = [];
          const textCaption = tweet.text || "";
          const author = tweet.author?.name || tweet.author?.screen_name || "X/Twitter";

          // Check videos
          const videos = tweet.media?.videos || [];
          if (videos.length > 0) {
            for (const v of videos) {
              const bestFormat = v.formats?.reduce(
                (prev: { bitrate?: number }, curr: { bitrate?: number }) =>
                  (curr.bitrate || 0) > (prev.bitrate || 0) ? curr : prev,
                v.formats[0],
              );

              const videoUrl = bestFormat?.url || v.url;
              if (videoUrl) {
                mediaItems.push({
                  type: "video",
                  url: videoUrl,
                  title: textCaption.slice(0, 100) || "X Video",
                  thumbnailUrl: v.thumbnail_url,
                  duration: v.duration,
                  filesize: v.filesize,
                  width: v.width,
                  height: v.height,
                  author,
                  sourceUrl: url,
                  platform: "twitter",
                  directDownloadUrl: videoUrl,
                });
              }
            }
          }

          // Check photos if no videos
          const photos = tweet.media?.photos || [];
          if (mediaItems.length === 0 && photos.length > 0) {
            for (const p of photos) {
              if (p.url) {
                mediaItems.push({
                  type: "photo",
                  url: p.url,
                  title: textCaption.slice(0, 100) || "X Photo",
                  width: p.width,
                  height: p.height,
                  author,
                  sourceUrl: url,
                  platform: "twitter",
                  directDownloadUrl: p.url,
                });
              }
            }
          }

          if (mediaItems.length > 0) {
            return {
              success: true,
              media: mediaItems,
              platform: "twitter",
            };
          }
        }
      }
    } catch {
      // Fallback to Cobalt
    }
  }

  // Fallback to Cobalt
  try {
    const cobaltRes = await fetchFromCobalt({
      url,
      downloadMode: "auto",
      videoQuality: "1080",
    });

    if (cobaltRes.status === "error" || !cobaltRes.url) {
      return {
        success: false,
        error: cobaltRes.error?.code || "Failed to download from X/Twitter",
        platform: "twitter",
      };
    }

    return {
      success: true,
      media: [
        {
          type: "video",
          url: cobaltRes.url,
          title: cobaltRes.filename || "X Video",
          filename: cobaltRes.filename || "twitter_video.mp4",
          sourceUrl: url,
          platform: "twitter",
          directDownloadUrl: cobaltRes.url,
        },
      ],
      platform: "twitter",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: msg,
      platform: "twitter",
    };
  }
}
