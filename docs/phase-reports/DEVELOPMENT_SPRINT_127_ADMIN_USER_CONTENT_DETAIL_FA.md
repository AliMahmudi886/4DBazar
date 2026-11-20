# Development Sprint 127 — Admin User Content Detail

## نتیجه

آگهی‌های نمایش‌داده‌شده در User Detail اکنون به endpoint واقعی جزئیات ادمین متصل‌اند و با دکمه «جزئیات» در همان dialog جزئیات کامل، رسانه و آگهی‌دهنده را باز می‌کنند. وضعیت‌ها نیز به فارسی نمایش داده می‌شوند.

## دسترسی و Scope

از مسیر موجود `getAdminContentDetail` استفاده شد؛ عملیات moderation جدید، تغییر داده یا migration اضافه نشد.

## اعتبارسنجی

- `npm run check`: PASS
- `npm run test -w @four-d/api`: PASS — ۵۶ تست
- `npm run build -w @four-d/web`: PASS

## موارد باز

کنترل moderation مستقیم از User Detail و E2E با حساب admin مقصد cPanel هنوز باز است.
