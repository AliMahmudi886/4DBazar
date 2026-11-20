# گزارش Development Sprint 103

## عنوان

هسته API حمل‌ونقل محلی و lifecycle سفر

## وضعیت

کدنویسی و اعتبارسنجی محلی تکمیل شد؛ UI و deploy مقصد در sprintهای بعدی است.

## خروجی

- migration `0025_transport_details.sql` و دسته حمل‌ونقل اضافه شد.
- repository حمل‌ونقل برای create، detail، فهرست سفرهای کاربر و cancel اضافه شد.
- endpointهای `POST /api/v1/transport/trips`، `GET /api/v1/transport/:contentId`، `GET /api/v1/me/transport` و `POST /api/v1/me/transport/:contentId/cancel` اضافه شدند.
- احراز هویت، تکمیل پروفایل، اعتبارسنجی تاریخ/زمان/ظرفیت/قیمت، audit و کنترل مالکیت اعمال شد.
- وضعیت سفر به `active` و `cancelled` مجهز شد؛ `expired` و `completed` برای lifecycle بعدی رزرو شده‌اند.

## بررسی محلی

- `npm run check` موفق.
- `npm run build -- --ignore-scripts` موفق.
- `npm test` موفق: ۵۳ تست API و ۱ تست shared.

## باقی‌مانده

- اجرای migration و smoke نوشتنی روی cPanel.
- جست‌وجوی server-side و تطبیق offer/request در Sprint 104.
- فرم‌های Web/Mobile و جزئیات UI در Sprintهای 105 و 106.

