# Completion Report - Development Sprint 28

## وضعیت

Development Sprint 28 تکمیل شد. هدف این sprint حذف مسیر ذخیره base64 عکس در رکورد آگهی و ساخت baseline واقعی‌تر برای media بود.

## انجام‌شده

- local media store در API اضافه شد.
- endpoint `POST /api/v1/media/listing-images` برای آپلود عکس آگهی ساخته شد.
- مسیر عمومی `/media/...` برای نمایش عکس‌های ذخیره‌شده اضافه شد.
- اعتبارسنجی نوع فایل و حجم عکس برای JPG، PNG و WEBP اضافه شد.
- frontend بعد از انتخاب عکس، فایل را فشرده و آپلود می‌کند و فقط URL برگشتی را همراه آگهی ذخیره می‌کند.
- تنظیمات `MEDIA_STORAGE_DIR` و `MEDIA_PUBLIC_PATH` به config و `.env.example` اضافه شد.
- پوشه `data/` از versioning خارج شد.
- تست API برای upload و read media اضافه شد.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- `npm run qa:visual`

## نتیجه

آگهی عکس‌دار دیگر مجبور نیست کل تصویر base64 را داخل payload نهایی آگهی و رکورد آگهی نگه دارد. مسیر فعلی هنوز object storage production نیست، اما contract آپلود و URL عمومی را آماده کرده و مهاجرت به provider واقعی را ساده‌تر می‌کند.

## کارهای باقی‌مانده

- انتخاب provider object storage مثل S3/MinIO/R2
- افزودن resize و metadata extraction سمت سرور
- افزودن moderation/scan برای media
- افزودن cleanup فایل‌های orphan بعد از حذف یا رد آگهی
