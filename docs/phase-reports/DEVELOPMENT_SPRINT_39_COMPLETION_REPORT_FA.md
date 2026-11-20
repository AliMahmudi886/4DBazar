# گزارش تکمیل Development Sprint 39

## عنوان

VAPID Tooling and Push Setup Guide

## وضعیت

Done

## خروجی‌ها

- دستور ریشه پروژه `npm run push:vapid` اضافه شد.
- اسکریپت API برای ساخت VAPID keys با `web-push.generateVAPIDKeys()` اضافه شد.
- خروجی اسکریپت دقیقاً متغیرهای لازم `.env` را نشان می‌دهد:
  - `VITE_VAPID_PUBLIC_KEY`
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`
- راهنمای اجرای محلی با بخش فعال‌سازی Push واقعی به‌روز شد.

## تصمیم‌ها

- برای جلوگیری از وابستگی به وب‌سایت‌های خارجی یا نصب global، تولید VAPID داخل npm script پروژه انجام می‌شود.
- کلید واقعی تولیدشده در repo ذخیره نمی‌شود و فقط در `.env` واقعی قرار می‌گیرد.

## اعتبارسنجی

- `npm run push:vapid` به‌صورت smoke بدون نمایش کلیدها اجرا شد.
- `npm run check`
- `npm run build`
- `npm test`
