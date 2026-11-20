# گزارش Development Sprint 113

## هدف

رفع نهایی خطای غیرمنتظره حذف آگهی و مقاوم‌سازی قرارداد درخواست‌های بدون body در وب و API.

## علت ریشه‌ای

کلاینت روی DELETE بدون body هدر `Content-Type: application/json` می‌فرستاد. Fastify پیش از اجرای route درخواست را با خطای empty JSON body رد می‌کرد و error handler آن خطای parser را به HTTP 500 عمومی تبدیل می‌کرد. در نتیجه منطق سالم repository اصلاً اجرا نمی‌شد.

## تغییرات

- helper هدر وب امکان حذف هدر JSON برای درخواست بدون body را دارد و مسیرهای GET/DELETE مرتبط اصلاح شدند.
- UI حذف درخواست تکراری را قفل و در صورت خطای نامشخص، وضعیت آگهی را از سرور دوباره بررسی می‌کند.
- repository حذف مالک idempotent است و حذف هم‌زمان را با خواندن وضعیت نهایی reconcile می‌کند.
- error handler خطاهای 4xx خود Fastify را به پاسخ validation کنترل‌شده نگاشت می‌کند.
- Service Worker پاسخ‌ها را پیش از مصرف body clone می‌کند و cache توسعه پاک می‌شود.

## اعتبارسنجی

- `npm run check`: موفق
- `npm run build`: موفق
- `npm test`: موفق؛ ۵۶ تست workspace
- حذف HTTP واقعی آگهی آزمایشی: HTTP 200
- تکرار همان DELETE: HTTP 200
- نبودن آگهی حذف‌شده در فهرست مالک: تأیید شد
- درخواست قدیمی با JSON header و body خالی: HTTP 400 کنترل‌شده، بدون 500

## انتشار

نسخه این increment `0.1.31-2026-08-25` است. وب و API باید هم‌زمان deploy شوند و پس از Restart App، حذف یک آگهی تستی در مقصد بررسی شود. migration، seed یا reset دیتابیس برای این increment لازم نیست.
