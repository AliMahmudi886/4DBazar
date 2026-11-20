# Development Sprint 124 — Admin / Support Audit و اصلاح خوانایی پشتیبانی

## هدف

اجرای اولین increment از مأموریت Admin/Support/User UX با scope محدود به فهرست پشتیبانی پنل ادمین.

## Root Cause

API فهرست ادمین تیکت را با `user_id` خام و `status` انگلیسی برمی‌گرداند و UI همان UUID و مقدار خام را نمایش می‌داد. اطلاعات کاربر در endpoint ادمین enrich نمی‌شد.

## تغییرات

- endpoint `GET /api/v1/admin/support` اطلاعات موجود نام نمایشی، نام و شماره کاربر را به‌صورت حداقلی اضافه می‌کند.
- UI کد پایدار قابل ارجاع `SUP-XXXXXX`، نام/شماره کاربر، وضعیت فارسی و زمان محلی نمایش می‌دهد.
- guard نقش moderator و منطق پاسخ تیکت بدون تغییر باقی ماند.
- سند audit اصلی در `ADMIN_SUPPORT_USER_UX_AUDIT_FA.md` ثبت شد.

## اعتبارسنجی

- `npm run check`: PASS
- `npm run test -w @four-d/api`: PASS — ۵۶ تست
- `npm run build -w @four-d/web`: PASS

## خارج از این increment

صفحه جزئیات کاربر، تفکیک کامل verification/auth، بازطراحی IA پنل، copy audit و E2E عملیاتی هنوز انجام نشده‌اند و باید در فازهای بعدی اجرا شوند.
