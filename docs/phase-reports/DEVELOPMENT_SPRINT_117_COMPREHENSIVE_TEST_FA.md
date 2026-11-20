# Development Sprint 117 — Comprehensive Test and Regression Report

تاریخ: ۱۴۰۵/۰۶/۰۷

## هدف

اجرای کامل تست‌های قابل‌اجرا برای نسخه‌ی فعلی وب، API، shared و اپ موبایل، همراه با smoke روی Pixel Emulator و endpointهای عمومی API.

## نتایج خودکار

- `npm run check`: موفق
- `npm run build`: موفق
- `npm run bundle:check`: موفق
- `npm test`: موفق؛ ۵۵ تست API و ۳ تست shared
- `npm run qa:visual`: موفق
- `npm run typecheck -w @four-d/mobile`: موفق
- `npm run mobile:release:check`: موفق؛ نسخه ۰.۱.۸، build ۱۲
- `./gradlew assembleRelease --console=plain --no-daemon`: موفق

## نتایج hosted smoke

با دسترسی شبکه، همه‌ی ۷ بررسی مقصد موفق شدند:

- live health: HTTP 200
- ready health: HTTP 200
- categories: HTTP 200
- cities: HTTP 200
- feed: HTTP 200
- captcha challenge: HTTP 200
- CORS preflight: HTTP 204 برای `https://4dbazar.ir`

## نتایج Pixel Emulator

- دستگاه: `emulator-5554`، Pixel Emulator
- نصب و اجرای APK: موفق
- Activity اصلی: در وضعیت resumed
- اسکرول بازار: موفق
- فرم ثبت آگهی: باز شد
- انتخاب‌گر جست‌وجوپذیر شهر: باز شد
- انتخاب‌گر جست‌وجوپذیر دسته: باز شد
- لاگ runtime: بدون crash، `Invariant Violation`، `VirtualizedList` یا خطای fatal

## خروجی انتشار موبایل

- فایل: `release/mobile/4d-bazar-mobile-v0.1.8-build12-local.apk`
- SHA-256: `2D063249DF2034490B6B79C920A4A4DC54B811496E7319DEC3A7C70ECFCFEF83`

## محدودیت‌های باقی‌مانده

- تست دستگاه فیزیکی در این محیط در دسترس نیست.
- تست مسیرهای اختصاصی نقش admin نیازمند حساب admin/moderator واقعی است و با حساب عادی اجرا نشد.
- deploy/overwrite روی cPanel خارج از دسترسی این workspace است.

## وضعیت

تست‌های محلی، hosted smoke و emulator regression موفق هستند. موارد محدودشده به دستگاه فیزیکی، نقش admin و deploy مقصد برای مرحله‌ی عملیاتی باقی می‌مانند.
