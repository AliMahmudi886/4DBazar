# گزارش تکمیل Development Sprint 37

## عنوان

Push Subscription Baseline

## وضعیت

Done

## خروجی‌ها

- migration جدید `0012_push_subscriptions.sql` برای ذخیره subscription دستگاه‌های کاربر اضافه شد.
- ماژول notifications در API برای list/upsert/revoke subscription ساخته شد.
- مسیرهای protected زیر اضافه شدند:
  - `GET /api/v1/me/push-subscriptions`
  - `POST /api/v1/me/push-subscriptions`
  - `DELETE /api/v1/me/push-subscriptions`
- web profile دکمه آماده‌سازی Push واقعی دارد و نبود `VITE_VAPID_PUBLIC_KEY` را شفاف اعلام می‌کند.
- service worker اکنون `push` و `notificationclick` را مدیریت می‌کند.
- `.env.example` با `VITE_VAPID_PUBLIC_KEY` به‌روز شد.

## تصمیم‌ها

- D-034 ثبت شد: ذخیره Push Subscription قبل از ساخت delivery worker.

## بدهی‌ها و موارد باقی‌مانده

- ارسال سروری Push هنوز اضافه نشده است.
- مدیریت endpointهای منقضی یا invalid پس از ارسال واقعی باقی مانده است.
- policy payload، احترام سمت سرور به mute/block و retry/backoff باید در فاز بعدی تکمیل شود.

## اعتبارسنجی

- `npm run check`
- `npm run build`
- `npm test`
- `npm run db:migrate`
- `npm run qa:visual`
