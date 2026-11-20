# گزارش Development Sprint 95 - Support، Profile و Moderation Hardening

## هدف

رفع ریشه‌ای تجربه پشتیبانی شناور، حذف تکرار پروفایل کسب‌وکار و غرفه، و قابل‌تشخیص‌کردن خطای صف بررسی آگهی در محیط‌های cPanel.

## انجام‌شده

- دکمه پشتیبانی به viewport وابسته شد و با `position: fixed`، فاصله responsive، safe-area و فاصله بالای bottom navigation در موبایل کار می‌کند.
- لایه‌بندی پشتیبانی از محتوای عادی جدا شد و زیر modalهای انتشار قرار گرفت؛ popup اسکرول داخلی، backdrop، خروج با Escape و دکمه بستن واضح دارد.
- FAB برچسب tooltip، `aria-label`، focus قابل مشاهده و touch target ثابت دارد.
- وقتی کاربر غرفه دارد، فرم/خلاصه تکراری «پروفایل کسب‌وکار» نمایش داده نمی‌شود؛ غرفه به‌عنوان صفحه عمومی همان هویت کسب‌وکار معرفی می‌شود. اطلاعات ضروری حساب همچنان جدا و قابل ویرایش است.
- خطای صف moderation در صورت نبود relation/column مربوط به migration، پیام دقیق اجرای migrationهای `0021` و `0022` می‌دهد.

## اعتبارسنجی

- `npm run check` موفق.
- `npm test` موفق: ۵۱ تست API و ۱ تست shared.
- `npm run build` موفق.
- تست PostgreSQL مقصد در این محیط قابل اجرا نیست؛ روی cPanel باید `npm run db:migrate` اجرا و سپس API restart شود.

## اقدام لازم روی cPanel

```bash
source ~/nodevenv/4d-api/20/bin/activate
cd ~/4d-api
npm run db:migrate
```

سپس Node.js App را Restart کن و `health/live`، `health/ready` و صف پنل ادمین را بررسی کن.

## خروجی انتشار

بسته‌های نسخه `v0.1.15-2026-08-22` بعد از build نهایی در `release/cpanel` قرار می‌گیرند و نسخه‌های قبلی حذف نمی‌شوند.

## وضعیت

`READY WITH WARNINGS`؛ smoke واقعی دیتابیس مقصد و بررسی بصری روی گوشی/مرورگر واقعی بعد از deploy لازم است.
