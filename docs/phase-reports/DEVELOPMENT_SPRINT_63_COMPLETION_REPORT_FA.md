# گزارش تکمیل Development Sprint 63

## موضوع

Retention واقعی، privacy policy قابل مشاهده و trust signal سابقه پاسخ‌گویی.

## خروجی‌های انجام‌شده

- تنظیم `ANALYTICS_RETENTION_DAYS` با مقدار پیش‌فرض ۹۰ روز اضافه شد.
- repository پاک‌سازی eventهای قدیمی و script مستقل `npm run db:cleanup:analytics` اضافه شد.
- endpoint `GET /api/v1/privacy-policy` اطلاعات retention، نوع داده و کنترل کاربر را برمی‌گرداند.
- متن privacy در Profile Workspace نمایش داده می‌شود.
- response rate فروشنده از تعداد conversationهای دریافت‌شده و conversationهای دارای پیام seller محاسبه می‌شود.
- برای فروشنده بدون conversation مقدار `null` حفظ می‌شود.
- handoff و اسناد phase به‌روزرسانی شدند.

## Validation

- `npm run check` موفق
- `npm run build` موفق
- `npm run bundle:check` موفق
- `npm run qa:visual` موفق؛ system Chrome استفاده شد چون browser bundled موجود نبود
- `npm run release:check` موفق
- اجرای migration و تست کامل DB در این turn به Docker Desktop وابسته و همچنان deferred است.

## تصمیم‌ها و ریسک‌ها

- `D-063`: response rate فقط از پیام واقعی seller محاسبه می‌شود.
- `R-019`: response rate نباید به‌عنوان verification یا تضمین کیفیت تفسیر شود.

## فاز بعد

Production media pipeline و تثبیت قرارداد API برای شروع اپ موبایل.
