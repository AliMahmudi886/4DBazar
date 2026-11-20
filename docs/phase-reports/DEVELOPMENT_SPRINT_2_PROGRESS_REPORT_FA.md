# Progress Report - Development Sprint 2

## وضعیت

Development Sprint 2 برای ارتقای تجربه کاربری و نمای marketplace شروع شده و بخش اول آن تکمیل شده است.

## انجام‌شده

- صفحه ساده قبلی با تجربه کامل‌تر marketplace جایگزین شد.
- نمای RTL فارسی با layout واکنش‌گرا، topbar، نوار جستجو، فیلتر شهر/دسته، وضعیت API/DB، کارت‌های آگهی و فرم ثبت آگهی ساخته شد.
- micro-interactionها و animationهای سبک برای ورود محتوا، hover، focus و submit اضافه شد.
- کارت‌های نمایشی و fallback محلی اضافه شدند تا حتی بدون Docker/PostgreSQL هم محصول قابل مشاهده باشد.
- endpoint `GET /api/v1/me/contents` برای خواندن محتوای کاربر اضافه شد.
- endpoint `GET /api/v1/feed` به repository محتوای persisted وصل شد و در نبود DB fallback قابل کنترل برمی‌گرداند.
- API برای شهرها و دسته‌ها در حالت نبود database fallback توسعه‌ای برمی‌گرداند.
- پنل جزئیات آگهی اضافه شد تا کاربر بدون خروج از فید، توضیح، قیمت، شهر، دسته و وضعیت را ببیند.
- شروع تماس امن MVP اضافه شد؛ شماره عمومی نمایش داده نمی‌شود و intent تماس به کاربر feedback می‌دهد.
- report flow نمایشی اضافه شد تا رفتار moderation در UI قابل لمس باشد.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- live API smoke check روی `http://127.0.0.1:4000/api/v1/regions/4d/cities`
- live API smoke check روی `http://127.0.0.1:4000/api/v1/feed`
- live web smoke check روی `http://127.0.0.1:5173`

## کارهای باقی‌مانده

- اجرای Docker Desktop و validation واقعی migration/seed روی PostgreSQL
- validation فید persisted روی PostgreSQL واقعی پس از روشن شدن Docker Desktop
- persistence واقعی برای contact intent و report moderation queue
- اضافه کردن visual QA برای viewportهای موبایل و دسکتاپ
