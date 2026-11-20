# Completion Report - Development Sprint 9

## وضعیت

Development Sprint 9 تکمیل شد. هدف این sprint اضافه کردن خروج کاربر و revoke واقعی نشست بود.

## انجام‌شده

- repository revoke session اضافه شد.
- API `POST /api/v1/auth/logout` اضافه شد.
- logout فقط با Bearer token معتبر انجام می‌شود.
- نشست فعلی با مقداردهی `sessions.revoked_at` باطل می‌شود.
- action خروج در audit با `auth.logout` ثبت می‌شود.
- UI دکمه خروج دارد.
- web بعد از خروج token را از `localStorage` پاک می‌کند و queueهای admin را خالی می‌کند.
- درخواست logout در UI با JSON خالی ارسال می‌شود تا live server مسیر را پایدار parse کند.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- live logout smoke test
- live web smoke check روی `http://127.0.0.1:5173`

## نتیجه smoke test

- قبل از logout: `/api/v1/me = 200`
- logout: `204`
- بعد از logout با همان token: `/api/v1/me = 401`
- نشست‌های revoked در DB: 2

## کارهای باقی‌مانده

- visual QA خودکار برای viewportهای موبایل و دسکتاپ
- SMS provider واقعی
- guard محیط production برای حذف header fallback
- cleanup job برای نشست‌های منقضی و revoked
