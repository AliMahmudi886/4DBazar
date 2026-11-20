# گزارش تکمیل Development Sprint 86

## عنوان

Notification Diagnostics

## تغییرات

- endpoint مدیریتی `GET /api/v1/admin/notifications/outbox-summary` اضافه شد.
- وضعیت jobها بر اساس status شمارش می‌شود.
- ۱۰ خطای آخر برای debugging برگردانده می‌شود.
- دسترسی با `requireRole("moderator")` محدود شده است.
- تست عدم دسترسی user عادی اضافه شد.

## Validation

- `npm run check` موفق.
- `npm run build -w @four-d/api` موفق.
- `npm test` موفق؛ ۴۲ تست API و ۱ تست shared پاس شدند.

## وضعیت

تکمیل‌شده.
