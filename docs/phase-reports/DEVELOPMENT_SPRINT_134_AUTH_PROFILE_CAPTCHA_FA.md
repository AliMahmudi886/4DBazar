# Development Sprint 134 — Auth/Profile/Captcha Recovery

تاریخ: ۱۴۰۵/۰۶/۰۹

## هدف

بازیابی مسیر Registration/Auth تا تکمیل پروفایل و تشخیص دقیق خطاهای CAPTCHA، با حفظ قرارداد مشترک Web و Mobile.

## Root Causeهای قطعی

- تکمیل پروفایل در API به وجود password و مقدار `verification_status` وابسته بود؛ این دو شرط بخشی از تعریف تکمیل پروفایل نیستند.
- فرم پروفایل وب در نبود password، ذخیره را اجباری می‌کرد و کاربر نمی‌توانست فقط هویت و شهر اصلی را تکمیل کند.
- پاسخ‌های CAPTCHA بین «لازم است»، «نامعتبر است» و «منقضی شده است» تفکیک نمی‌شدند؛ در نتیجه کلاینت پیام عمومی اتصال/API نشان می‌داد.

## تغییرات

- تعریف مشترک missing fields برای `first_name`، `last_name` و `primary_city_id` اضافه شد.
- `profile_complete` فقط بر اساس فیلدهای هویتی لازم محاسبه می‌شود؛ `can_create_listing` همچنان به تأیید شماره موبایل و تکمیل پروفایل وابسته است.
- password در ذخیره پروفایل اختیاری شد و فقط برای ورود با رمز لازم است.
- کدهای `captcha_required`، `captcha_invalid` و `captcha_expired` در shared/API/حالت خطای Web و Mobile همسان شدند.
- تست replay برای proof کپچا اضافه شد تا proof یک‌بارمصرف باقی بماند.

## Verification

- `npm run check`: PASS
- API tests: ۶۰ از ۶۰ PASS
- Shared tests: ۳ از ۳ PASS
- Web build: PASS
- Mobile typecheck: PASS
- Bundle budget: PASS
- Release preflight: PASS
- Mobile release preflight: PASS

## موارد خارج از این increment

- smoke مقصد cPanel و ارسال build واقعی EAS هنوز باید جداگانه انجام شود.
- موفقیت SMS واقعی به اعتبار و تنظیمات Kavenegar مقصد وابسته است و در تست محلی ادعا نمی‌شود.

## Release وضعیت

- release وب/API برای cPanel در `release/cpanel/4d-web-v0.1.1-2026-08-31.zip` و `release/cpanel/4d-api-v0.1.1-2026-08-31.zip` آماده شد.
- `.easignore` برای جلوگیری از ارسال `node_modules` و خروجی‌های محلی اضافه شد؛ با این حال دو تلاش EAS در محیط فعلی قبل از ثبت build روی archive upload متوقف شدند.
- build محلی Gradle نیز به علت نبودن distribution در cache و کامل نشدن دانلود اجرا نشد؛ APK جدید در این increment صادر نشده است.
