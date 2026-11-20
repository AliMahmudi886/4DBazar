# گزارش تکمیل Development Sprint 57

## جست‌وجوی هوشمند و آگهی‌های مشابه

- جست‌وجوی frontend اکنون حروف عربی/فارسی را normalize می‌کند.
- تطبیق عنوان وزن بیشتر از توضیحات دارد و دسته/شهر نیز در relevance اثر می‌گذارند.
- نتایج جست‌وجو با امتیاز relevance مرتب می‌شوند و sort قیمت/جدیدترین حفظ شده است.
- در جزئیات آگهی، تا سه آگهی مشابه بر اساس دسته، شهر، وضعیت و واژه‌های مشترک عنوان نمایش داده می‌شود.
- بخش مشابه‌ها روی موبایل نیز responsive است.
- embedding و semantic search واقعی برای مرحله analytics/backend بعدی deferred ماند تا داده pilot جمع شود.

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- `npm run qa:visual` موفق برای desktop/mobile market/admin

## مرحله بعد

گام بعدی: Business Profile و Trust Layer، سپس search backend/analytics و آماده‌سازی production media.
