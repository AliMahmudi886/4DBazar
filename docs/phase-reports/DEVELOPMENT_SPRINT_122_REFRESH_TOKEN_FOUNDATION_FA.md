# گزارش Development Sprint 122 — پایه Refresh Token

## هدف

افزودن قرارداد تمدید نشست چرخشی بدون نگهداری refresh token به‌صورت خام در دیتابیس.

## تغییرات واقعی

- migration `0027_session_refresh_tokens.sql` جدول مستقل refresh token را ایجاد می‌کند.
- ورود با OTP و رمز، علاوه بر access token، refresh token و زمان انقضای آن را برمی‌گرداند.
- endpoint `POST /api/v1/auth/refresh` refresh token را بررسی و به‌صورت چرخشی access/refresh جدید صادر می‌کند.
- refresh token قبلی و session قبلی پس از rotation revoke می‌شوند؛ token revokeشده یا متصل به session revokeشده قابل استفاده نیست.
- کدهای API و تست missing-token اضافه شد.

## اعتبارسنجی

- `npm run check`: PASS
- تست API: PASS — ۵۶ تست
- mobile typecheck: PASS

## محدودیت این increment

- اتصال خودکار retry در همه‌ی درخواست‌های وب/موبایل و اجرای migration روی cPanel باید در deploy بعدی انجام شود؛ تا آن زمان API قبلی باید همراه migration جدید deploy شود.
