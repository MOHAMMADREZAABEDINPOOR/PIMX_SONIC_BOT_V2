import "@supabase/functions-js/edge-runtime.d.ts";
import { TelegramBot } from "./telegram.ts";
import { TelegramUpdate } from "./types.ts";
import { extractUrls } from "./utils/helpers.ts";
import { extractMedia } from "./extractors/index.ts";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

Deno.serve(async (req: Request) => {
  // Health check endpoint
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "active",
        bot: "PIMX_SAVE_BOT",
        description: "Universal Media Downloader (X, Instagram, YouTube, SoundCloud, Spotify)",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN environment variable is missing");
    return new Response("Bot token not configured", { status: 500 });
  }

  const bot = new TelegramBot(BOT_TOKEN);

  try {
    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (!message || !message.text) {
      return new Response("OK", { status: 200 });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // 1. Handle /start command
    if (text === "/start") {
      const welcomeText =
        `👋 <b>Welcome to PIMX Media Downloader!</b>\n\n` +
        `Send me any link from the supported platforms and I'll download it for you with <b>no size limits</b>:\n\n` +
        `🔹 <b>YouTube</b> (Videos, Shorts, Music)\n` +
        `🔹 <b>Instagram</b> (Reels, Posts, Carousels)\n` +
        `🔹 <b>X / Twitter</b> (HD Videos, GIFs, Photos)\n` +
        `🔹 <b>SoundCloud</b> (Full Audio Tracks)\n` +
        `🔹 <b>Spotify</b> (Tracks & High Quality Audio)\n\n` +
        `💡 <i>Just paste a link directly into the chat!</i>`;

      await bot.sendMessage(chatId, welcomeText, {
        parse_mode: "HTML",
        reply_to_message_id: message.message_id,
      });

      return new Response("OK", { status: 200 });
    }

    // 2. Handle /help command
    if (text === "/help") {
      const helpText =
        `📖 <b>How to Use PIMX Downloader Bot</b>\n\n` +
        `1️⃣ Copy the link of any video, photo, or audio from:\n` +
        `   • <b>YouTube</b>: <code>https://youtube.com/watch?v=...</code>\n` +
        `   • <b>Instagram</b>: <code>https://instagram.com/reel/...</code>\n` +
        `   • <b>X / Twitter</b>: <code>https://x.com/.../status/...</code>\n` +
        `   • <b>SoundCloud</b>: <code>https://soundcloud.com/...</code>\n` +
        `   • <b>Spotify</b>: <code>https://open.spotify.com/track/...</code>\n\n` +
        `2️⃣ Send the link here.\n` +
        `3️⃣ The bot will extract and deliver the media directly to your chat!\n\n` +
        `⚡ <i>Files exceeding Telegram player limits will include a direct high-speed download button so there are no file size restrictions.</i>`;

      await bot.sendMessage(chatId, helpText, {
        parse_mode: "HTML",
        reply_to_message_id: message.message_id,
      });

      return new Response("OK", { status: 200 });
    }

    // 3. Extract URLs
    const urls = extractUrls(text);
    if (urls.length === 0) {
      await bot.sendMessage(
        chatId,
        `⚠️ <b>No valid link detected.</b>\n\nPlease send a valid URL from YouTube, Instagram, X (Twitter), SoundCloud, or Spotify.`,
        {
          parse_mode: "HTML",
          reply_to_message_id: message.message_id,
        },
      );
      return new Response("OK", { status: 200 });
    }

    const targetUrl = urls[0];

    // Send "Processing" message
    const statusMsg = await bot.sendMessage(
      chatId,
      `⏳ <b>Fetching media...</b>\n<code>${targetUrl}</code>\n\n<i>Please wait a few seconds...</i>`,
      {
        parse_mode: "HTML",
        reply_to_message_id: message.message_id,
      },
    );

    const statusMsgId = statusMsg?.result?.message_id;

    // Send typing / upload action
    await bot.sendChatAction(chatId, "upload_video");

    // Perform extraction
    const result = await extractMedia(targetUrl);

    if (!result.success || !result.media || result.media.length === 0) {
      const errorMsg =
        `❌ <b>Download Failed</b>\n\n` +
        `Could not retrieve media from this link.\n` +
        `<b>Reason:</b> <code>${result.error || "Unknown extraction error"}</code>\n\n` +
        `💡 <i>Make sure the post/account is public and try again in a few moments.</i>`;

      if (statusMsgId) {
        await bot.editMessageText(chatId, statusMsgId, errorMsg, {
          parse_mode: "HTML",
        });
      } else {
        await bot.sendMessage(chatId, errorMsg, {
          parse_mode: "HTML",
          reply_to_message_id: message.message_id,
        });
      }

      return new Response("OK", { status: 200 });
    }

    // Deliver media items
    for (const item of result.media) {
      await bot.sendMedia(chatId, item, message.message_id);
    }

    // If status message was sent, update or delete it
    if (statusMsgId) {
      await bot.editMessageText(
        chatId,
        statusMsgId,
        `✨ <b>Download completed!</b> Enjoy your media.`,
        { parse_mode: "HTML" },
      );
    }

    return new Response("OK", { status: 200 });
  } catch (error: unknown) {
    const errText = error instanceof Error ? error.stack || error.message : String(error);
    console.error("Unhandled error in telegram-bot function:", errText);
    return new Response("Internal Server Error", { status: 200 });
  }
});
