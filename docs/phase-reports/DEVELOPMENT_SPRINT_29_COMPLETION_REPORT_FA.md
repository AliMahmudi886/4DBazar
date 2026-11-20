# Completion Report - Development Sprint 29

## وضعیت

Development Sprint 29 تکمیل شد. هدف این sprint تبدیل کپچای پازلی از یک guard صرفاً client-side به proof سمت سرور برای مسیر OTP بود.

## انجام‌شده

- سرویس captcha proof در API اضافه شد.
- endpoint `GET /api/v1/auth/captcha-challenge` برای ساخت challenge کوتاه‌عمر اضافه شد.
- endpoint `POST /api/v1/auth/captcha-proof` برای ساخت proof امضاشده و یک‌بارمصرف اضافه شد.
- endpoint `POST /api/v1/auth/request-otp` بدون `captcha_proof` معتبر درخواست را رد می‌کند.
- frontend پازل را از challenge سمت سرور تغذیه می‌کند و قبل از درخواست OTP proof می‌گیرد.
- smoke test واقعی SMS با captcha proof جدید هماهنگ شد.
- shared error contract با `captcha_required` به‌روز شد.
- تست API الزام captcha proof اضافه شد.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- `npm run qa:visual`

## نتیجه

مسیر ارسال OTP حالا علاوه بر phone-based rate limit و persisted OTP challenge، یک مانع سمت سرور برای bot دارد. این هنوز anti-bot production-grade نیست، اما دیگر صرفاً به state ظاهری frontend متکی نیست.

## کارهای باقی‌مانده

- انتخاب provider ضد bot production-grade در صورت نیاز public release
- افزودن IP/device reputation و observability برای مسیر OTP
- hardening ورود با رمز شامل محدودیت تلاش و reset flow مستقل
- unread/notification برای چت
