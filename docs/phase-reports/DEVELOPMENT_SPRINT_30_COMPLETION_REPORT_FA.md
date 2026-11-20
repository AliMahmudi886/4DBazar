# Completion Report - Development Sprint 30

## وضعیت

Development Sprint 30 تکمیل شد. هدف این sprint سخت‌تر کردن مسیر ورود با رمز در برابر تلاش‌های تکراری ناموفق بود.

## انجام‌شده

- bucket اختصاصی برای شکست‌های `POST /api/v1/auth/password-login` اضافه شد.
- بعد از ۸ تلاش ناموفق در ۱۰ دقیقه، endpoint خطای `rate_limited` برمی‌گرداند.
- بعد از ورود موفق، bucket شکست‌های همان IP/شماره پاک می‌شود.
- UI ورود با رمز برای خطای 429 پیام صبر نشان می‌دهد و کاربر را بی‌دلیل به مسیر SMS نمی‌برد.
- تست API برای rate limit ورود با رمز اضافه شد.

## Validation

موفق:

- `npm run check`
- `npm run build`
- `npm test`
- `npm run qa:visual`

## نتیجه

مسیر auth اکنون سه guard مهم دارد: captcha proof برای ارسال OTP، phone-based OTP rate limit و password-login failure rate limit. این برای beta محلی بهتر است، هرچند برای production باید rate limit مشترک و پایدار اضافه شود.

## کارهای باقی‌مانده

- reset password flow مستقل
- policy کامل‌تر رمز عبور
- rate limit پایدار با Redis/provider خارجی
- observability و alert برای abuse مسیر auth
