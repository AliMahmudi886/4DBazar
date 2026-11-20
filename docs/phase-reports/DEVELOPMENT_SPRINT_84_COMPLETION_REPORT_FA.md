# گزارش تکمیل Development Sprint 84

## عنوان

Notification Outbox Foundation

## تغییرات

- migration `0019_notification_outbox.sql` اضافه شد.
- jobهای اعلان با status، attempts، available_at و last_error ذخیره می‌شوند.
- مسیر پیام به‌جای delivery مستقیم، outbox job ثبت می‌کند.
- worker با claim، ارسال، mark sent و retry delay ساخته شد.
- command `npm run notifications:worker` به root و API اضافه شد.

## Validation

- `npm run db:migrate` موفق.
- `npm run check` موفق.
- `npm run build` موفق.
- `npm test` موفق؛ ۴۱ تست API و ۱ تست shared پاس شدند.

## Deferred

worker دائمی، recovery پردازش‌های stuck، backoff پیشرفته، metrics و provider mock integration test در فازهای بعدی هستند.

## وضعیت

تکمیل‌شده.
