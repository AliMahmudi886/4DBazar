# گزارش تکمیل Development Sprint 38

## عنوان

Push Delivery MVP

## وضعیت

Done

## خروجی‌ها

- dependency استاندارد `web-push` به API اضافه شد.
- تنظیمات API برای `VAPID_PUBLIC_KEY`، `VAPID_PRIVATE_KEY` و `VAPID_SUBJECT` اضافه شد.
- سرویس `push-delivery` برای ارسال Web Push به subscriptionهای فعال ساخته شد.
- ارسال پیام چت به delivery best-effort وصل شد؛ خطای Push ارسال پیام را خراب نمی‌کند.
- گفتگوهای mute شده برای گیرنده Push نمی‌سازند.
- subscriptionهایی که provider با 404 یا 410 رد کند revoke می‌شوند.
- `.env.example` با کلیدهای VAPID سمت API تکمیل شد.

## تصمیم‌ها

- D-035 ثبت شد: Push Delivery به صورت best-effort داخل API.

## بدهی‌ها و موارد باقی‌مانده

- delivery در رشد ترافیک باید به job queue/worker جدا منتقل شود.
- retry/backoff، analytics delivery و تنظیمات granular notification هنوز کامل نیستند.
- read receipt نمایشی، block سراسری کاربر و realtime کامل همچنان باقی مانده‌اند.

## اعتبارسنجی

- `npm run check`
- `npm run build`
- `npm test`
- `npm run db:migrate`
- `npm run qa:visual`
