export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
  first_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  caption?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
    url?: string;
  }>;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export type MediaType = "video" | "audio" | "photo" | "document";

export interface MediaItem {
  type: MediaType;
  url: string;
  title?: string;
  filename?: string;
  thumbnailUrl?: string;
  duration?: number;
  filesize?: number;
  width?: number;
  height?: number;
  author?: string;
  sourceUrl: string;
  platform: "youtube" | "twitter" | "instagram" | "soundcloud" | "spotify" | "generic";
  directDownloadUrl?: string;
}

export interface ExtractionResult {
  success: boolean;
  media?: MediaItem[];
  error?: string;
  platform?: string;
}
