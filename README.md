<div align="center">

<img src="assets/readme/hero.gif" width="1200" alt="PIMX SONIC · V2: a media-download hub with a vinyl record, video and cloud" />

**[English](README.md) · [فارسی](README.fa.md)**

</div>

# 🎵 PIMX SONIC · V2

A TypeScript/Deno Telegram media bot deployed as a Supabase Edge Function. Platform extractors handle YouTube, Instagram, X, SoundCloud and Spotify links.

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_SONIC_BOT_V2) · [PIMX / Profile](https://github.com/MOHAMMADREZAABEDINPOOR) · [Static artwork](assets/readme/hero.png)

| At a glance | Details |
|:---|:---|
| 🎵 Experience | Telegram bot and its supporting tools |
| 🧰 Built with | `TypeScript / Deno` · `Telegram` |
| 🌐 Documentation | [English](README.md) · [فارسی](README.fa.md) |

[✨ Features](#features) · [🚀 Getting started](#getting-started) · [⚙️ Configuration](#configuration) · [🌍 Deployment](#deployment)

---

<a id="features"></a>

## ✨ Features

| Area | Included capability |
|:---|:---|
| 📥 Delivery | Platform-specific extractors and a shared routing layer |
| 📥 Delivery | Telegram media delivery with direct-link fallback |
| ⚡ Workflow | Cobalt fallback helpers and Spotify metadata resolution |
| 🔌 Integration | Serverless webhook and GET health endpoint |

<a id="stack"></a>

## 🧰 Stack

| Tool | Version / source |
|---|---|
| TypeScript / Deno | `Supabase Edge Runtime` |
| Telegram | `Bot API` |

<a id="getting-started"></a>

## 🚀 Getting started

Node.js for the Supabase CLI, a Supabase project and a Telegram bot token. Deno is useful for checking Edge code.

```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_SONIC_BOT_V2.git
cd PIMX_SONIC_BOT_V2

npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
# Create supabase/secrets.local.env with TELEGRAM_BOT_TOKEN (never commit it)
npx supabase secrets set --env-file supabase/secrets.local.env
npx supabase functions deploy telegram-bot --no-verify-jwt
```

<a id="configuration"></a>

## ⚙️ Configuration

These names are found in the example configuration or source; not all are required. Check their defaults/usage in those files and supply secrets only in your local or hosting environment.

| Name | Role |
|---|---|
| `COBALT_API_URL` | Application setting; inspect its definition |
| `TELEGRAM_BOT_TOKEN` | Credential/connection setting; keep private |

<a id="usage"></a>

## 🎯 Usage

Link your own Supabase project, set TELEGRAM_BOT_TOKEN as an Edge Function secret and deploy telegram-bot. Register its HTTPS function URL with Telegram setWebhook, then send a supported media link.

<a id="project-structure"></a>

## 🗂️ Project structure

| Path | Role |
|---|---|
| [`assets/`](assets/) | Brand/media/README assets |
| [`supabase/`](supabase/) | Edge function source/configuration |

<a id="commands-and-checks"></a>

## 🧪 Commands and checks

No automated test command is declared in a manifest. Verify behavior through a local example run.

<a id="deployment"></a>

## 🌍 Deployment

The setup commands deploy the Edge Function. Register your own function URL with the Telegram `setWebhook` API. Keep secrets.local.env and supabase/.temp/ out of Git.

<a id="limitations"></a>

## 📌 Limitations

Telegram upload limits, provider availability and Edge runtime limits still apply. A direct download link is not unlimited Telegram delivery. Spotify can fall back to metadata/preview. JWT verification is disabled for Telegram webhooks; add webhook authentication before public production use.

<a id="troubleshooting"></a>

## 🛠️ Troubleshooting

- Authentication/provider errors: verify credentials and selected model/provider.
- No Telegram updates: check polling/webhook mode and concurrent bot instances.
- Missing dependencies: use the declared manifest or inspect imports if no manifest is provided.

<a id="contributing"></a>

## 🤝 Contributing

Create a focused branch, verify the affected behavior and explain the change clearly. Keep private data, build outputs and local databases out of commits.

<a id="license"></a>

## 📄 License

No repository-level license file is included in this snapshot. Public visibility alone does not grant reuse rights; contact the repository owner for terms.

---

Part of **PIMX** · Documentation in English and Persian.

---

<div align="center">

🎵 **PIMX SONIC · V2** · [English](README.md) · [فارسی](README.fa.md)

</div>
