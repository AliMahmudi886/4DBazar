# Completion Report - Development Sprint 5

## وضعیت

Development Sprint 5 تکمیل شد. هدف این sprint عبور از header-only auth و اضافه کردن session واقعی پایه بود.

## انجام‌شده

- API `POST /api/v1/auth/request-otp` اضافه شد.
- API `POST /api/v1/auth/verify-otp` اضافه شد.
- OTP provider فعلاً `stub` است و کد توسعه‌ای `123456` دارد.
- در verify موفق، کاربر verified می‌شود و session token ساخته می‌شود.
- hash نشست در جدول `sessions` ذخیره می‌شود.
- middleware auth از `Authorization: Bearer` پشتیبانی می‌کند.
- endpoint `GET /api/v1/me` اضافه شد.
- web در شروع برنامه نشست توسعه‌ای می‌گیرد و token را در localStorage نگه می‌دارد.
- web برای create listing، contact و report از Bearer token استفاده می‌کند.
- fallback header فقط برای dev/test باقی مانده است.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- live `POST /api/v1/auth/request-otp`
- live `POST /api/v1/auth/verify-otp`
- live `GET /api/v1/me` با Bearer token
- live `POST /api/v1/contact-intents` با Bearer token

## کارهای باقی‌مانده

- اتصال provider واقعی SMS
- logout/revoke session
- role model واقعی برای moderator/admin
- حذف header fallback در production
- UI/admin برای moderation queue
