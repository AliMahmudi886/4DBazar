# گزارش Development Sprint 114

## هدف

حذف فیلدهای نامرتبط از فرم آگهی بر اساس دسته و نوع محتوا، enforce همان قرارداد در API و بازطراحی صفحه جزئیات آگهی.

## خروجی

- policy مشترک `getListingFieldPolicy` در پکیج shared برای قیمت، وضعیت کالا و جزئیات خدمت
- نمایش وضعیت فقط برای دسته‌های کالای فیزیکی و حذف قیمت از استخدام و حمل‌ونقل
- پاک‌سازی server-side مقادیر نامرتبط در create/update برای جلوگیری از داده stale یا payload دست‌کاری‌شده
- اصلاح state مستقل فرم خدمت برای محدوده، ساعت کاری و سابقه
- بازطراحی جزئیات آگهی با گالری ۴:۳، thumbnail، شمارنده رسانه، metadata پویا، غرفه و CTAهای responsive
- افزودن سناریوی QA تصویری جزئیات در desktop و mobile

## اعتبارسنجی

- `npm run check`: موفق
- `npm test`: ۵۵ تست API و ۳ تست shared موفق
- `npm run build`: موفق، ۱۸۱۵ ماژول وب
- `npm run bundle:check`: موفق، مجموع JavaScript حدود ۶۳۹KB
- `npm run qa:visual`: موفق
- `npm run qa:quality`: Chromium و WebKit موفق؛ Firefox به علت ایراد runtime محلی Playwright اجرا نشد

## موارد باز

- انتشار هم‌زمان ZIP وب و API روی cPanel
- smoke ایجاد/ویرایش آگهی کالای فیزیکی، املاک و خدمت روی مقصد
- تکمیل schemaهای metadata اختصاصی زیر‌دسته‌ها در increment بعدی
