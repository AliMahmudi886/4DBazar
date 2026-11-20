# گزارش تکمیل Development Sprint 87

## عنوان

Provider Testability

## تغییرات

- `EXPO_PUSH_API_URL` به config اضافه شد.
- endpointهای send و getReceipts از URL قابل تنظیم استفاده می‌کنند.
- `parseExpoPushTickets` برای normalize پاسخ provider اضافه شد.
- پاسخ malformed بدون crash به آرایه خالی یا ticketهای معتبر تبدیل می‌شود.
- تست parser برای پاسخ‌های نامعتبر اضافه شد.

## Validation

- `npm run check` موفق.
- `npm run build -w @four-d/api` موفق.
- `npm test` موفق؛ ۴۳ تست API و ۱ تست shared پاس شدند.

## وضعیت

تکمیل‌شده.
