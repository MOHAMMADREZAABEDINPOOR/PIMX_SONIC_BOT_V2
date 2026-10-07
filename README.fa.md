<div align="center">

<img src="assets/readme/hero.gif" width="1200" alt="PIMX SONIC · V2: a media-download hub with a vinyl record, video and cloud" />

**[English](README.md) · [فارسی](README.fa.md)**

</div>

<div dir="rtl">

# 🎵 PIMX SONIC · V2

ربات رسانه تلگرام با TypeScript/Deno روی Supabase Edge Function؛ استخراج‌گرهای مستقل لینک YouTube، Instagram، X، SoundCloud و Spotify را پردازش می‌کنند.

[GitHub](https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_SONIC_BOT_V2) · [PIMX / Profile](https://github.com/MOHAMMADREZAABEDINPOOR) · [بنر ثابت](assets/readme/hero.png)

| نمای کلی | جزئیات |
|:---|:---|
| 🎵 تجربه | ربات تلگرام و ابزارهای همراه آن |
| 🧰 فناوری | `TypeScript / Deno` · `Telegram` |
| 🌐 زبان راهنما | [English](README.md) · [فارسی](README.fa.md) |

[✨ امکانات](#امکانات) · [🚀 شروع کار](#شروع-کار) · [⚙️ تنظیمات](#تنظیمات) · [🌍 استقرار](#استقرار)

---

<a id="امکانات"></a>

## ✨ امکانات

| بخش | قابلیت موجود |
|:---|:---|
| 📥 دریافت | استخراج‌گر هر پلتفرم و لایه مسیریابی مشترک |
| 📥 دریافت | ارسال رسانه به تلگرام و لینک مستقیم جایگزین |
| ⚡ روند کار | ابزار جایگزین Cobalt و دریافت فراداده Spotify |
| 🔌 اتصال | وب‌هوک serverless و مسیر GET بررسی سلامت |

<a id="پشته-فنی"></a>

## 🧰 پشته فنی

| ابزار | نسخه یا منبع |
|---|---|
| TypeScript / Deno | `Supabase Edge Runtime` |
| Telegram | `Bot API` |

<a id="شروع-کار"></a>

## 🚀 شروع کار

Node.js برای CLI Supabase، پروژه Supabase و توکن ربات تلگرام. Deno برای بررسی کد Edge مفید است.

<div dir="ltr">

```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_SONIC_BOT_V2.git
cd PIMX_SONIC_BOT_V2

npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
# Create supabase/secrets.local.env with TELEGRAM_BOT_TOKEN (never commit it)
npx supabase secrets set --env-file supabase/secrets.local.env
npx supabase functions deploy telegram-bot --no-verify-jwt
```

</div>

<a id="تنظیمات"></a>

## ⚙️ تنظیمات

کلیدهای زیر از فایل نمونه یا کد استخراج شده‌اند؛ همه الزاماً اجباری نیستند. مقدار و پیش‌فرض را در همان فایل بررسی و اسرار را فقط در محیط محلی یا هاست تنظیم کنید.

| نام | کاربرد |
|---|---|
| `COBALT_API_URL` | تنظیم برنامه؛ تعریف را در منبع بررسی کنید |
| `TELEGRAM_BOT_TOKEN` | اعتبارنامه یا اتصال؛ خصوصی نگه دارید |

<a id="استفاده"></a>

## 🎯 استفاده

پروژه Supabase خود را لینک و TELEGRAM_BOT_TOKEN را به‌عنوان secret تنظیم کنید؛ سپس telegram-bot را مستقر کنید. آدرس HTTPS تابع را در setWebhook تلگرام ثبت و لینک پشتیبانی‌شده ارسال کنید.

<a id="ساختار-پروژه"></a>

## 🗂️ ساختار پروژه

| مسیر | نقش |
|---|---|
| [`assets/`](assets/) | فایل برند، رسانه و README |
| [`supabase/`](supabase/) | کد و تنظیم تابع Edge |

<a id="فرمان‌ها-و-بررسی"></a>

## 🧪 فرمان‌ها و بررسی

فرمان آزمون خودکار در manifest تعریف نشده است. اجرای محلی و بررسی رفتار نمونه را انجام دهید.

<a id="استقرار"></a>

## 🌍 استقرار

دستورهای بالا تابع Edge را مستقر می‌کنند. سپس URL خودتان را با API رسمی `setWebhook` ثبت کنید. فایل secrets.local.env و پوشه supabase/.temp/ منتشر نشوند.

<a id="محدودیت‌ها"></a>

## 📌 محدودیت‌ها

محدودیت تلگرام، سرویس منبع و Edge برقرار است. لینک مستقیم به معنی ارسال نامحدود در تلگرام نیست. Spotify ممکن است فقط فراداده یا پیش‌نمایش بدهد. JWT برای وب‌هوک خاموش است؛ پیش از استفاده عمومی واقعی، احراز وب‌هوک اضافه کنید.

<a id="رفع-مشکل"></a>

## 🛠️ رفع مشکل

- خطای سرویس یا ورود: اعتبارنامه و مدل و سرویس انتخابی را بررسی کنید.
- پیام تلگرام نمی‌رسد: حالت polling و وب‌هوک و نمونه همزمان را بررسی کنید.
- وابستگی غایب: از manifest استفاده یا در نبود آن importها را بررسی کنید.

<a id="مشارکت"></a>

## 🤝 مشارکت

برای تغییر، شاخه مستقل بسازید، رفتار فعلی را بررسی کنید و توضیح روشن همراه تغییر بفرستید. اطلاعات خصوصی، خروجی build و دیتابیس محلی را commit نکنید.

<a id="مجوز"></a>

## 📄 مجوز

فایل مجوز در این نسخه موجود نیست. نمایش عمومی کد به‌تنهایی مجوز استفاده مجدد نیست؛ برای شرایط استفاده با مالک مخزن هماهنگ کنید.

---

ساخته‌شده در مجموعه **PIMX** · مستندات فارسی و انگلیسی.

---

<div align="center">

🎵 **PIMX SONIC · V2** · [English](README.md) · [فارسی](README.fa.md)

</div>

</div>
