# گزارش تکمیل Development Sprint 40

## عنوان

Push Self-Test and Diagnostics

## وضعیت

Done

## خروجی‌ها

- endpoint جدید `POST /api/v1/me/push-test` برای ارسال اعلان تستی به حساب واردشده اضافه شد.
- سرویس push از مسیر عمومی `sendUserPushNotification` برای payload تست و پیام چت استفاده می‌کند.
- پروفایل وب دکمه «ارسال تست Push» را بعد از ثبت حداقل یک دستگاه Push نمایش می‌دهد.
- UI نتیجه تست را برای حالت‌های sent، skipped، no subscription و failure توضیح می‌دهد.
- راهنمای اجرای محلی با مرحله تست Push تکمیل شد.

## بدهی‌ها و موارد باقی‌مانده

- تست push واقعی هنوز به مرورگر با permission فعال و subscription ثبت‌شده نیاز دارد.
- delivery analytics و retry/backoff پیشرفته هنوز باقی مانده‌اند.

## اعتبارسنجی

- VAPID env بدون چاپ secret بررسی شد.
- `npm run check`
- `npm run build`
- `npm test`
- `npm run db:migrate`
- `npm run qa:visual`
