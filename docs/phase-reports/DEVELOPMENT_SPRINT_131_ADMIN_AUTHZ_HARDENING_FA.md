# Development Sprint 131 — Admin Authorization Hardening

## نتیجه

برای قراردادهای Admin، تست‌های دسترسی به فهرست کاربران و آگهی‌های کاربر اضافه شد. نقش `moderator` برای این مسیرهای حساس `403` می‌گیرد و تفکیک آن از `admin` حفظ شد.

## اعتبارسنجی

- `npm run check`: PASS
- `npm run test -w @four-d/api`: PASS — ۵۶ تست workspace
- `npm run build -w @four-d/web`: PASS

## موارد باز

تست E2E با نشست واقعی admin روی cPanel، smoke نسخه مقصد و ساخت release نهایی بعد از تکمیل همه فازها باقی است.
