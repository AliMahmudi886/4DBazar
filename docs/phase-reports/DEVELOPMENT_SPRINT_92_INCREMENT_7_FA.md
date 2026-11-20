# گزارش Development Sprint 92 - Increment 7

## انجام‌شده

- دکمه‌های «ثبت آگهی» و «ثبت خدمت» هم‌ظاهر و مستقل شدند؛ فرم هرکدام دیگر دکمه نوع دیگر را داخل خود نشان نمی‌دهد.
- پشتیبانی پس‌زمینه و کارت سفید مستقل، خوانا و responsive شد و جایگاه FAB پایین راست تثبیت شد.
- پنل ادمین در ستون‌های فشرده‌تر و قابل اسکن قرار گرفت.
- باگ نقش ادمین اصلاح شد: شماره‌های `ADMIN_PHONE_NUMBERS` هنگام OTP و ورود با رمز، نقش‌های `moderator` و `admin` می‌گیرند.

## آزمون و انتشار

- `npm run check` موفق
- `npm test`: ۵۱ تست موفق
- `release/cpanel/4d-web-v0.1.10-2026-08-21.zip`
- `release/cpanel/4d-api-v0.1.10-2026-08-21.zip`

## فعال‌سازی admin

در cPanel مقدار `ADMIN_PHONE_NUMBERS=[REDACTED_PHONE]` را قرار بده، API را restart کن، از حساب خارج شو و با OTP یا رمز دوباره وارد شو. سپس `/api/v1/me` را بررسی کن؛ باید `admin` و `moderator` در roles دیده شوند.
