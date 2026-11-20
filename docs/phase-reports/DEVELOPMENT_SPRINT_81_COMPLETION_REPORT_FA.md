# گزارش تکمیل Development Sprint 81

## عنوان

Native Push Token Persistence and API Contract

## تغییرات

- migration `0018_native_push_tokens.sql` اضافه شد.
- جدول token با user ownership، platform، provider، status و timestamp ساخته شد.
- repositoryهای upsert و revoke native token اضافه شدند.
- endpointهای `POST` و `DELETE /api/v1/me/native-push-tokens` با احراز هویت و mobile verification اضافه شدند.
- validation برای platform، provider و طول token اضافه شد.
- اپ موبایل token Expo را پس از فعال‌سازی، به‌صورت best-effort در API ثبت می‌کند.

## Validation

- `npm run check` موفق.
- `npm run typecheck -w @four-d/mobile` موفق.
- `npm run build` موفق.
- `npm test` موفق؛ ۴۱ تست API و ۱ تست shared پاس شدند.

## Deferred

ارسال واقعی push، queue/worker، EAS credentials و revoke خودکار tokenهای منقضی در Sprint بعد انجام می‌شود.

## وضعیت

تکمیل‌شده.
