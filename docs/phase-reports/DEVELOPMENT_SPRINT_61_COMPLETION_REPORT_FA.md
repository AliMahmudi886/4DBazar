# گزارش تکمیل Development Sprint 61

## موضوع

Trust Signals مبتنی بر شواهد و Analytics پایه، همراه با سند انتقال کامل پروژه.

## خروجی‌های انجام‌شده

- migration `0015_analytics_events.sql` اضافه و روی PostgreSQL محلی اعمال شد.
- repository ثبت eventهای `listing_view`، `favorite_added` و `contact_started` اضافه شد.
- endpoint `GET /api/v1/business-profiles/:userId/trust` با شرط public بودن business profile اضافه شد.
- trust summary از داده‌های users، user_profiles و market_contents ساخته می‌شود.
- در جزئیات آگهی، mobile verification، کامل بودن پروفایل و تعداد آگهی‌های approved به‌صورت کنترل‌شده نمایش داده می‌شود.
- سند `docs/NEW_ACCOUNT_START_HERE_FA.md` برای انتقال پروژه به اکانت جدید اضافه شد.

## Validation

- `npm run check` موفق
- `npm run build` موفق
- `npm run db:migrate` موفق
- API tests: 40 passed, 0 failed
- `npm run bundle:check` موفق
- `npm run qa:visual` موفق؛ system Chrome استفاده شد چون browser bundled موجود نبود
- `npm run release:check` موفق

## تصمیم‌ها و ریسک‌ها

- تصمیم `D-061`: analytics فقط eventهای قابل اثبات را ذخیره می‌کند.
- ریسک `R-017`: retention و privacy analytics باید قبل از production تکمیل شود.

## فاز بعد

Analytics dashboard محدود به صاحب آگهی، retention/privacy controls و سپس evidence-backed trust signals پیشرفته.
