# Completion Report - Development Sprint 8

## وضعیت

Development Sprint 8 تکمیل شد. هدف این sprint ساخت چرخه واقعی بررسی آگهی‌های تازه بود.

## انجام‌شده

- feed عمومی به محتوای `approved` محدود شد.
- repository خواندن آگهی‌های `submitted` اضافه شد.
- repository تصمیم approve/reject برای محتوا اضافه شد.
- تغییر وضعیت در `content_status_history` ثبت می‌شود.
- API `GET /api/v1/admin/moderation/contents` اضافه شد.
- API `POST /api/v1/admin/moderation/contents/:contentId/decisions` اضافه شد.
- پنل admin در web دو بخش شد: آگهی‌های در انتظار و گزارش‌های باز.
- actionهای تایید و رد آگهی در UI اضافه شدند.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- live create listing با status `submitted`
- live read pending content queue
- live approve content
- live feed contains approved content
- live web smoke check روی `http://127.0.0.1:5173`

## نتیجه smoke test دیتابیس

- `approved`: 4
- `submitted`: 1
- `content_status_history`: 1

## کارهای باقی‌مانده

- logout/revoke session
- visual QA خودکار
- review detail کامل‌تر برای moderator
- policy reasonهای ساختاری
- تفکیک admin route/app از marketplace عمومی
