# گزارش تکمیل Development Sprint 82

## عنوان

Native Push Delivery

## تغییرات

- delivery native با Expo Push Service اضافه شد.
- payload اعلان شامل `conversationId` و `url` است.
- Web Push و native push مستقل اجرا می‌شوند.
- وقتی VAPID تنظیم نیست، native delivery همچنان بررسی می‌شود.
- tokenهای دارای خطای `DeviceNotRegistered` revoke می‌شوند.
- نتیجه delivery فیلدهای `native_attempted`، `native_sent` و `native_revoked` دارد.

## Validation

- `npm run check` موفق.
- `npm run build -w @four-d/api` موفق.
- `npm test` موفق؛ ۴۱ تست API و ۱ تست shared پاس شدند.

## محدودیت

این فاز receipt polling، queue/worker و تست دستگاه واقعی را اضافه نکرده است. Expo Go یا token نامعتبر ممکن است delivery واقعی نداشته باشد.

## وضعیت

تکمیل‌شده.
