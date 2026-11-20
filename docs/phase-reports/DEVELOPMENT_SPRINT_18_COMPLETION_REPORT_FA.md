# Completion Report - Development Sprint 18

## وضعیت

Development Sprint 18 تکمیل شد. هدف این sprint رفع مشکل خوانده نشدن `.env` ریشه در اجرای workspace script بود.

## انجام‌شده

- `sms:smoke` اکنون `.env` ریشه پروژه را از مسیر `../../.env` می‌خواند.
- اگر `apps/api/.env` هم وجود داشته باشد، آن را هم می‌خواند.
- خروجی noisy dotenv خاموش شد.
- برای محیط‌های noninteractive پیام خطای واضح اضافه شد.
- `OTP_CODE` برای verify بدون prompt اضافه شد.
- secret واقعی دوباره از `.env.example` پاک شد.

## Validation

موفق:

- `npm run check`
- `npm run build -w @four-d/api`
- `npm test`
- اجرای smoke تا مرحله ارسال SMS و prompt کد
- secret hygiene check روی source/docs/config

## نتیجه

خطای `TEST_PHONE_NUMBER is required` برطرف شد. در PowerShell کاربر، `npm run sms:smoke` باید `.env` ریشه را بخواند، SMS را ارسال کند و منتظر ورود کد بماند.

## کارهای باقی‌مانده

- full E2E verify با کد دریافتی در PowerShell تعاملی
- persisted OTP challenge برای production
- hardening دسترسی ادمین
