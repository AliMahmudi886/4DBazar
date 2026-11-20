# گزارش پیشرفت Development Sprint 92 - Increment 1

تاریخ: ۱۴۰۵/۰۵/۲۹
وضعیت: In Progress

## خروجی این increment

- migration `0021_local_places_support_admin.sql` ستون‌های `is_village` و `parent_city_id` را به شهرها اضافه می‌کند و جدول‌های `listing_media` و `support_tickets` را می‌سازد.
- API فهرست شهرها نوع مکان و شهر مادر را برمی‌گرداند.
- API رسانه برای هر آگهی حداکثر ۶ عکس و ۱ ویدیو را با بررسی مالکیت asset می‌پذیرد؛ local storage همچنان رایگان است و سقف ویدیو ۱۲MB است.
- API پشتیبانی برای ایجاد/مشاهده تیکت کاربر و پاسخ moderator فراهم شد.
- API ادمین برای فهرست کاربران، تغییر وضعیت verification، دیدن creator آگهی و حذف soft آگهی اضافه شد.
- دکمه ثبت آگهی در bottom navigation وب دیگر anchor بی‌اثر نیست و به composer واقعی اسکرول می‌کند.
- فرم وب انتخاب چند رسانه و ارسال asset idها را انجام می‌دهد.
- بسته‌های cPanel نسخه‌دار ساخته شدند: `release/cpanel/4d-web-v0.1.4-2026-08-20.zip` و `release/cpanel/4d-api-v0.1.4-2026-08-20.zip`؛ manifest و SHA-256 در همان پوشه قرار دارد.

## اعتبارسنجی

- `npm run build --workspace=@four-d/api` موفق.
- `npm run build --workspace=@four-d/web` موفق.
- `RELEASE_VERSION=0.1.4 RELEASE_DATE=2026-08-20 npm run release:cpanel` موفق.

## موارد باقی‌مانده

- اجرای migration و smoke endpointهای جدید روی cPanel واقعی.
- تکمیل صفحه دیداری پشتیبانی و پنل کاربران/حذف ادمین در Web.
- اتصال انتخاب چند عکس و ویدیو در Mobile و تست Pixel 2 API 36.
- تطبیق نهایی نام همه روستاها با مرجع رسمی قبل از اعلام «کامل».
- تست واقعی media backup/restore بعد از افزایش حجم ویدیو.
