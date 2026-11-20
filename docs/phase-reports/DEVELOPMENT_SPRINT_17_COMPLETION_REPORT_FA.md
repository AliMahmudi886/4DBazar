# Completion Report - Development Sprint 17

## وضعیت

Development Sprint 17 تکمیل شد. هدف این sprint تست ارسال واقعی Kavenegar و پاک‌سازی secret از فایل نمونه بود.

## انجام‌شده

- کلید واقعی از `.env.example` پاک شد.
- `TEST_PHONE_NUMBER` به `.env.example` اضافه شد.
- ارسال واقعی OTP با Kavenegar برای شماره تست انجام شد.
- API برای `POST /api/v1/auth/request-otp` پاسخ `202` داد.
- response حالت SMS شامل `dev_code` نبود.

## نتیجه Smoke

خروجی smoke:

- `statusCode=202`
- `delivery=sms`
- `expires_in_seconds=300`

## نکته Verify

کدی که در delivery smoke فرستاده شد قابل verify بعدی نیست، چون process بعد از تست بسته شد و challenge فعلاً in-memory است. برای full E2E باید `npm run sms:smoke` اجرا شود تا ارسال و verify در همان process انجام شوند.

## کارهای باقی‌مانده

- اجرای full E2E verify با کد دریافتی
- persisted OTP challenge برای production
- hardening دسترسی ادمین
