export interface CobaltRequestOptions {
  url: string;
  videoQuality?: "max" | "1080" | "720" | "480" | "360";
  audioFormat?: "best" | "mp3" | "ogg" | "wav" | "opus";
  downloadMode?: "auto" | "audio" | "mute";
  youtubeVideoCodec?: "h264" | "av1" | "vp9";
}

export interface CobaltPickerItem {
  type?: "video" | "photo" | "gif";
  url: string;
  thumb?: string;
}

export interface CobaltResponse {
  status: "tunnel" | "redirect" | "picker" | "error";
  url?: string;
  filename?: string;
  picker?: CobaltPickerItem[];
  error?: {
    code: string;
    context?: Record<string, unknown>;
  };
}

const DEFAULT_COBALT_INSTANCES = [
  "https://rue-cobalt.xenon.zone/",
  "https://cobaltapi.cjs.nz/",
];

export async function fetchFromCobalt(
  options: CobaltRequestOptions,
): Promise<CobaltResponse> {
  const envInstance = Deno.env.get("COBALT_API_URL");
  const instances = envInstance
    ? [envInstance, ...DEFAULT_COBALT_INSTANCES]
    : DEFAULT_COBALT_INSTANCES;

  let lastError = "No response from extraction servers";

  for (const baseUrl of instances) {
    try {
      const endpoint = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; TelegramDownloaderBot/1.0)",
        },
        body: JSON.stringify({
          url: options.url,
          videoQuality: options.videoQuality ?? "1080",
          audioFormat: options.audioFormat ?? "mp3",
          downloadMode: options.downloadMode ?? "auto",
          youtubeVideoCodec: options.youtubeVideoCodec ?? "h264",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        lastError = errorData?.error?.code || `HTTP ${res.status}`;
        continue;
      }

      const data: CobaltResponse = await res.json();
      if (data.status === "error") {
        lastError = data.error?.code || "Extraction failed";
        continue;
      }

      return data;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    status: "error",
    error: {
      code: lastError,
    },
  };
}
