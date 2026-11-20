# گزارش Development Sprint 116

## عنوان

Hosted API Origin و Cache Hardening

## مسئله

پس از اجرای پاک‌سازی بازار، API محتوای بازار را حذف می‌کرد اما وب هنوز پیام قطع API و سه کارت نمونه را نشان می‌داد. در production، fallback وب ممکن بود به API محلی اشاره کند و Service Worker نیز bundle قبلی را نگه دارد.

## تغییرات

- fallback API در production به `https://api.4dbazar.ir` منتقل شد؛ development همچنان از `127.0.0.1:4000` استفاده می‌کند.
- داده‌های نمونه فقط در development فعال هستند و با feed واقعی production ادغام نمی‌شوند.
- cache key Service Worker به `four-d-shell-v9` افزایش یافت.
- release جفت cPanel نسخه `v0.1.34-2026-08-25` ساخته شد.

## اعتبارسنجی محلی

- `npm run check` موفق
- `npm run build` موفق
- `npm test` موفق: ۵۸ تست
- `npm run bundle:check` موفق
- build شامل آدرس production API و cache key v9 است.

## اقدام مقصد cPanel

1. ZIP وب را در `public_html` extract و فایل‌های build قبلی را overwrite کن.
2. ZIP API را در `/home/a4dbazarir/4d-api` extract کن و Node App را restart کن.
3. `https://api.4dbazar.ir/health/live` و `/health/ready` را بررسی کن.
4. در مرورگر Service Worker را Unregister و Site Data را پاک کن، سپس hard refresh بزن.
5. در Network مطمئن شو درخواست‌ها به `https://api.4dbazar.ir` می‌روند، نه localhost.
6. بعد از خالی بودن feed، یک آگهی آزمایشی ثبت و نمایش آن را بررسی کن.

## وضعیت

کد و release محلی تکمیل شده‌اند؛ deploy و smoke مقصد هنوز باید تأیید شوند.
