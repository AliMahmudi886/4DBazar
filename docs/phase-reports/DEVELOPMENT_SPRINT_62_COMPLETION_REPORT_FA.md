# گزارش تکمیل Development Sprint 62

## موضوع

Analytics Dashboard محدود به صاحب آگهی و کنترل‌های privacy/retention.

## خروجی‌های انجام‌شده

- migration `0016_analytics_preferences.sql` برای نگهداری انتخاب analytics کاربر اضافه شد.
- aggregate summary در `GET /api/v1/me/analytics` فقط روی آگهی‌های متعلق به کاربر ساخته می‌شود.
- endpoint خواندن و تغییر preference در `/api/v1/me/analytics/preferences` اضافه شد.
- endpoint `DELETE /api/v1/me/analytics/events` برای حذف eventهای actor کاربر اضافه شد.
- ثبت event برای کاربری که opt-out کرده است متوقف می‌شود.
- در Profile Workspace، مجموع بازدید، ذخیره و تماس و breakdown آگهی‌ها نمایش داده می‌شود.
- کنترل opt-out و حذف داده رفتاری داخل همان workspace قرار گرفت.
- handoff، status، tracker، roadmap، decision log و risk register به‌روز شدند.

## Validation

- `npm run check` موفق
- `npm run build` موفق
- `npm run bundle:check` موفق
- `npm run qa:visual` موفق؛ system Chrome استفاده شد چون browser bundled موجود نبود
- `npm run release:check` موفق
- `npm run db:migrate` و تست کامل API در این turn اجرا نشدند؛ Docker Desktop در دسترس نبود و PostgreSQL روی `127.0.0.1:55432` اتصال نداشت.

## تصمیم‌ها و ریسک‌ها

- تصمیم `D-062`: dashboard فقط aggregate آگهی‌های مالک و کنترل privacy صریح کاربر را نشان می‌دهد.
- ریسک `R-018`: migration و تست DB باید در محیط Docker فعال تکرار شوند.

## فاز بعد

Retention job، privacy policy قابل نمایش و سپس trust signals پیشرفته مبتنی بر evidence معتبر.
