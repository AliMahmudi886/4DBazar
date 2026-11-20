# گزارش تکمیل Development Sprint 83

## عنوان

Native Push Receipt Reliability

## تغییرات

- ticketهای Expo بعد از ارسال نگهداری و receipt آن‌ها polling می‌شود.
- خطاهای receipt در `native_failed` گزارش می‌شوند.
- tokenهای `DeviceNotRegistered` از receipt revoke می‌شوند.
- polling با تأخیر کوتاه و به‌صورت best-effort اجرا می‌شود.

## Validation

- `npm run check` موفق.
- `npm run build -w @four-d/api` موفق.
- `npm test` موفق؛ ۴۱ تست API و ۱ تست shared پاس شدند.

## Deferred

queue/worker durable، retry با backoff، batching و integration test provider در فاز بعد باقی مانده‌اند.

## وضعیت

تکمیل‌شده.
