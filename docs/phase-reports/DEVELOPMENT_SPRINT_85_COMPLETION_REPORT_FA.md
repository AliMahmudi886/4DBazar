# گزارش تکمیل Development Sprint 85

## عنوان

Worker Recovery and Retry Backoff

## تغییرات

- recovery jobهای stuck در وضعیت `processing` پس از ۵ دقیقه اضافه شد.
- retry delay بر اساس تعداد تلاش‌ها به‌صورت نمایی محاسبه می‌شود.
- سقف retry delay برابر ۱۵ دقیقه است.
- خروجی worker تعداد jobهای recovered را گزارش می‌کند.

## Validation

- `npm run check` موفق.
- `npm run build` موفق.
- `npm test` موفق؛ ۴۱ تست API و ۱ تست shared پاس شدند.
- `npm run notifications:worker` موفق.

## وضعیت

تکمیل‌شده.
