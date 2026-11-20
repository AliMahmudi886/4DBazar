# گزارش Development Sprint 97 - گالری رسانه، غرفه عمومی و پشتیبانی

تاریخ: ۱۴۰۵/۰۶/۳۱
وضعیت: تکمیل محلی؛ انتشار cPanel آماده

## تغییرات

- گالری جزئیات آگهی با تصویر قبلی/بعدی، شمارنده و thumbnail اضافه شد.
- کارت بازار و صفحه عمومی غرفه چند تصویر را قابل مشاهده و انتخاب می‌کنند.
- لینک «مشاهده غرفه» از کارت و جزئیات آگهی با slug فعال اضافه شد.
- API جزئیات آگهی مقدار `view_count` را از eventهای `listing_view` برمی‌گرداند و در drawer نمایش داده می‌شود.
- کارت «حریم خصوصی تحلیل‌ها» از پروفایل حذف شد؛ endpointهای analytics برای telemetry داخلی حذف نشدند.
- Support FAB و panel با Portal زیر `document.body` mount می‌شوند و لایه آن‌ها زیر modal است.
- state گالری public storefront از شرط loading/empty خارج شد تا قانون Hookها نقض نشود.

## اعتبارسنجی

- `npm run check`: موفق
- `npm test`: موفق، ۵۱ تست API و ۱ تست shared
- `npm run build`: موفق، ۱۸۱۳ ماژول وب
- release: `release/cpanel/4d-web-v0.1.17-2026-08-22.zip` و `release/cpanel/4d-api-v0.1.17-2026-08-22.zip`

## باقی‌مانده

- smoke واقعی cPanel برای health/ready، auth، گالری، غرفه و admin queue.
- تست scroll و safe-area در Chrome/Edge و Pixel 2 API 36 بعد از deploy.
- تست بار write/auth فقط روی محیط تست ایزوله؛ روی production ممنوع است.
