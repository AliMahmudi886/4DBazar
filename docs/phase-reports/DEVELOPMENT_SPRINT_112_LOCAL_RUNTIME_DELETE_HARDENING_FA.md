# گزارش Development Sprint 112

## هدف

رفع ریشه‌ای خطای حذف آگهی در لوکال، حذف تداخل Processهای API و جلوگیری از اجرای bundle کهنه توسط Service Worker.

## علت‌های ریشه‌ای

- دو Process هم‌زمان روی آدرس‌های `0.0.0.0:4000` و `127.0.0.1:4000` اجرا شده بودند.
- Service Worker نسخه production روی origin توسعه باقی مانده و پاسخ‌های cache‌شده را مدیریت می‌کرد.
- درخواست تکراری DELETE بعد از حذف موفق اول، به خطای مالکیت/عدم وجود تبدیل می‌شد.

## تغییرات

- حذف مالک در repository به عملیات idempotent تبدیل شد.
- هنگام حذف، UI شناسه در حال پردازش را نگه می‌دارد و ارسال مجدد را مسدود می‌کند.
- در حالت DEV همه Service Workerها unregister و cacheهای `four-d-*` پاک می‌شوند.
- cache shell به نسخه ۶ ارتقا یافت.
- header نسخه API به `2026-08-25-delete-idempotency-sw-1` تغییر کرد.

## اعتبارسنجی

- `npm run check`: موفق
- `npm run build`: موفق
- تست workspace: ۵۵ تست موفق
- smoke دو DELETE متوالی روی یک آگهی متعلق به کاربر: هر دو HTTP 200
- health API و وب محلی: HTTP 200

## انتشار

نسخه مقصد این increment `0.1.30-2026-08-25` است. deploy وب و API باید جفت انجام شود و پس از Restart App، header نسخه و حذف یک آگهی تستی بررسی شود.
