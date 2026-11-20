# گزارش Development Sprint 111

## هدف

رفع ریشه‌ای خطای ۵۰۰ حذف آگهی، خطای clone در Service Worker و نمایش نادرست تصویر/شمارنده چندرسانه‌ای کارت بازار.

## تغییرات

- migration idempotent `0026_market_contents_soft_delete_repair.sql` ستون‌های `updated_at` و `deleted_at` و index محتوای فعال مالک را تضمین می‌کند.
- هدر نسخه API به `2026-08-24-delete-media-cache-1` تغییر کرد تا تشخیص deploy واقعی ممکن باشد.
- Service Worker پاسخ شبکه را پیش از تحویل به مصرف‌کننده clone می‌کند و cache shell به نسخه ۵ ارتقا یافت.
- لینک و تصویر کارت تمام قاب رسانه را با `object-fit: cover` پر می‌کنند؛ شمارنده چندعکس به badge لایه‌ای مستقل تبدیل شد.
- فایل رسانه قدیمی که از دیسک حذف شده باشد پاسخ کنترل‌شده `404 not_found` می‌دهد و دیگر خطای داخلی `500` تولید نمی‌کند.

## اعتبارسنجی

- حذف آگهی موقت روی PostgreSQL واقعی محلی: HTTP 200 و `deleted_at` غیرتهی.
- `npm run check`: موفق.
- `npm run build`: موفق.
- `npm test`: ۵۵ تست workspace موفق؛ شامل regression رسانه گمشده.
- `npm run bundle:check`: موفق.
- `npm run qa:visual`: موفق.

## کار باز

- آپلود جفت release وب/API روی cPanel.
- اجرای `npm run db:migrate`، Restart App و کنترل هدر نسخه.
- Hard refresh یا Unregister یک‌باره Service Worker و smoke حذف/رسانه روی مقصد.
