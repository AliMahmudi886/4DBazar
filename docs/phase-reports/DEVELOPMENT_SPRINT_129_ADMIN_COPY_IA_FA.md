# Development Sprint 129 — Admin Copy / IA Polish

## نتیجه

عنوان کلی پنل ادمین از «صف گزارش‌ها» به «مرکز بررسی و عملیات» تغییر کرد و وضعیت‌های خام آگهی، غرفه و priority گزارش‌ها در UI به برچسب‌های فارسی و قابل‌فهم تبدیل شدند.

## Scope

فقط متن و presentation پنل تغییر کرد؛ API، مجوزها، تصمیم moderation و داده‌ها بدون تغییر باقی ماندند.

## اعتبارسنجی

- `npm run check`: PASS
- `npm run test -w @four-d/api`: PASS — ۵۶ تست
- `npm run build -w @four-d/web`: PASS
