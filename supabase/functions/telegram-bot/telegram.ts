import { escapeHtml, formatBytes, formatDuration } from "./utils/helpers.ts";
import { MediaItem } from "./types.ts";

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export class TelegramBot {
  private token: string;
  private baseUrl: string;

  constructor(token: string) {
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
  }

  private async callApi(method: string, body: Record<string, unknown>): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      return await res.json();
    } catch (err) {
      console.error(`Error calling ${method}:`, err);
      return { ok: false, error: String(err) };
    }
  }

  async sendMessage(
    chatId: number,
    text: string,
    options?: {
      parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
      reply_to_message_id?: number;
      reply_markup?: InlineKeyboardMarkup;
    },
  ) {
    return await this.callApi("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode ?? "HTML",
      reply_to_message_id: options?.reply_to_message_id,
      reply_markup: options?.reply_markup,
    });
  }

  async editMessageText(
    chatId: number,
    messageId: number,
    text: string,
    options?: {
      parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
      reply_markup?: InlineKeyboardMarkup;
    },
  ) {
    return await this.callApi("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: options?.parse_mode ?? "HTML",
      reply_markup: options?.reply_markup,
    });
  }

  async sendChatAction(
    chatId: number,
    action:
      | "typing"
      | "upload_video"
      | "upload_voice"
      | "upload_document"
      | "upload_photo",
  ) {
    return await this.callApi("sendChatAction", {
      chat_id: chatId,
      action,
    });
  }

  async sendVideoUpload(
    chatId: number,
    fileBlob: Blob,
    filename: string,
    caption: string,
    options?: {
      reply_to_message_id?: number;
      reply_markup?: InlineKeyboardMarkup;
      supports_streaming?: boolean;
    },
  ) {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("video", fileBlob, filename);
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    if (options?.supports_streaming) form.append("supports_streaming", "true");
    if (options?.reply_to_message_id) {
      form.append("reply_to_message_id", String(options.reply_to_message_id));
    }
    if (options?.reply_markup) {
      form.append("reply_markup", JSON.stringify(options.reply_markup));
    }

    const res = await fetch(`${this.baseUrl}/sendVideo`, {
      method: "POST",
      body: form,
    });
    return await res.json();
  }

  async sendAudioUpload(
    chatId: number,
    fileBlob: Blob,
    filename: string,
    caption: string,
    options?: {
      title?: string;
      performer?: string;
      reply_to_message_id?: number;
      reply_markup?: InlineKeyboardMarkup;
    },
  ) {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("audio", fileBlob, filename);
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    if (options?.title) form.append("title", options.title);
    if (options?.performer) form.append("performer", options.performer);
    if (options?.reply_to_message_id) {
      form.append("reply_to_message_id", String(options.reply_to_message_id));
    }
    if (options?.reply_markup) {
      form.append("reply_markup", JSON.stringify(options.reply_markup));
    }

    const res = await fetch(`${this.baseUrl}/sendAudio`, {
      method: "POST",
      body: form,
    });
    return await res.json();
  }

  async sendPhotoUpload(
    chatId: number,
    fileBlob: Blob,
    filename: string,
    caption: string,
    options?: {
      reply_to_message_id?: number;
      reply_markup?: InlineKeyboardMarkup;
    },
  ) {
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("photo", fileBlob, filename);
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    if (options?.reply_to_message_id) {
      form.append("reply_to_message_id", String(options.reply_to_message_id));
    }
    if (options?.reply_markup) {
      form.append("reply_markup", JSON.stringify(options.reply_markup));
    }

    const res = await fetch(`${this.baseUrl}/sendPhoto`, {
      method: "POST",
      body: form,
    });
    return await res.json();
  }

  /**
   * Delivers the downloaded media directly into Telegram chat,
   * AND provides a direct high-speed download link & button.
   */
  async sendMedia(
    chatId: number,
    item: MediaItem,
    replyToMessageId?: number,
  ): Promise<boolean> {
    const directUrl = item.directDownloadUrl || item.url;
    const title = item.title ? escapeHtml(item.title) : "Media Content";
    const author = item.author ? `\n👤 <b>By:</b> ${escapeHtml(item.author)}` : "";
    const size = item.filesize ? `\n📦 <b>Size:</b> ${formatBytes(item.filesize)}` : "";
    const duration = item.duration
      ? `\n⏱ <b>Duration:</b> ${formatDuration(item.duration)}`
      : "";
    const platform = item.platform.toUpperCase();

    // Caption includes media info AND clickable direct download link
    const caption = `🎬 <b>${title}</b>${author}${size}${duration}\n` +
      `🌐 <b>Platform:</b> #${platform}\n\n` +
      `📥 <b>Download Link:</b> <a href="${directUrl}">Click to Download</a>\n\n` +
      `🤖 <i>Downloaded via @PIMX_SAVE_BOT</i>`;

    const downloadKeyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: "⬇️ Download with Link (Direct File)",
            url: directUrl,
          },
        ],
        [
          {
            text: "🔗 Source Link",
            url: item.sourceUrl,
          },
        ],
      ],
    };

    // Step 1: Attempt to download the binary blob to upload directly to Telegram
    let fileBlob: Blob | null = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const fileRes = await fetch(item.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (fileRes.ok) {
        const contentLength = fileRes.headers.get("content-length");
        const numBytes = contentLength ? parseInt(contentLength, 10) : 0;

        // Telegram Bot API allows uploads up to 50MB (52,428,800 bytes)
        if (!numBytes || numBytes <= 50 * 1024 * 1024) {
          const blob = await fileRes.blob();
          if (blob.size <= 50 * 1024 * 1024) {
            fileBlob = blob;
          }
        }
      }
    } catch (e) {
      console.log("Direct blob fetch error, falling back to URL streaming:", e);
    }

    // Step 2: Send actual media content to Telegram
    // 1. Photo
    if (item.type === "photo") {
      await this.sendChatAction(chatId, "upload_photo");
      if (fileBlob) {
        const uploadRes = await this.sendPhotoUpload(
          chatId,
          fileBlob,
          item.filename || "photo.jpg",
          caption,
          { reply_to_message_id: replyToMessageId, reply_markup: downloadKeyboard },
        );
        if (uploadRes.ok) return true;
      }

      // Fallback: send via URL
      const res = await this.callApi("sendPhoto", {
        chat_id: chatId,
        photo: item.url,
        caption,
        parse_mode: "HTML",
        reply_to_message_id: replyToMessageId,
        reply_markup: downloadKeyboard,
      });
      if (res.ok) return true;
    }

    // 2. Audio
    if (item.type === "audio") {
      await this.sendChatAction(chatId, "upload_voice");
      if (fileBlob) {
        const uploadRes = await this.sendAudioUpload(
          chatId,
          fileBlob,
          item.filename || "audio.mp3",
          caption,
          {
            title: item.title,
            performer: item.author,
            reply_to_message_id: replyToMessageId,
            reply_markup: downloadKeyboard,
          },
        );
        if (uploadRes.ok) return true;
      }

      // Fallback: send via URL
      const res = await this.callApi("sendAudio", {
        chat_id: chatId,
        audio: item.url,
        title: item.title,
        performer: item.author,
        caption,
        parse_mode: "HTML",
        reply_to_message_id: replyToMessageId,
        reply_markup: downloadKeyboard,
      });
      if (res.ok) return true;
    }

    // 3. Video
    if (item.type === "video") {
      await this.sendChatAction(chatId, "upload_video");
      if (fileBlob) {
        const uploadRes = await this.sendVideoUpload(
          chatId,
          fileBlob,
          item.filename || "video.mp4",
          caption,
          {
            supports_streaming: true,
            reply_to_message_id: replyToMessageId,
            reply_markup: downloadKeyboard,
          },
        );
        if (uploadRes.ok) return true;
      }

      // Fallback: send via URL
      const res = await this.callApi("sendVideo", {
        chat_id: chatId,
        video: item.url,
        caption,
        parse_mode: "HTML",
        supports_streaming: true,
        reply_to_message_id: replyToMessageId,
        reply_markup: downloadKeyboard,
      });
      if (res.ok) return true;
    }

    // Step 3: If direct video/audio upload was rejected (e.g. file > 50MB),
    // deliver the rich download card with the direct high-speed download link
    const fallbackText = `✅ <b>Media Ready for Download!</b>\n\n` +
      `📌 <b>Title:</b> ${title}${author}${size}${duration}\n` +
      `🌐 <b>Platform:</b> #${platform}\n\n` +
      `📥 <b>Direct Download Link:</b>\n<a href="${directUrl}">${directUrl}</a>\n\n` +
      `⚡ <i>Note: This media file exceeds Telegram's 50MB in-chat upload limit. Use the direct download button or link above to stream or download without size limits!</i>`;

    await this.sendMessage(chatId, fallbackText, {
      parse_mode: "HTML",
      reply_to_message_id: replyToMessageId,
      reply_markup: downloadKeyboard,
    });

    return true;
  }
}
