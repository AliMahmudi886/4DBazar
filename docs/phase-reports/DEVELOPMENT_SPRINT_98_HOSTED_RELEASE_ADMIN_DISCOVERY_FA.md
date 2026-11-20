# گزارش Development Sprint 98

تاریخ: ۱۴۰۵/۰۶/۳۱  
وضعیت: تکمیل محلی و smoke عمومی مقصد

## هدف

تثبیت انتشار cPanel و برطرف کردن ابهام صف غرفه در پنل ادمین، بدون قرار دادن secret یا انجام mutation روی مقصد.

## تغییرات

- صف غرفه ادمین در API اطلاعات مالک را از `users` و `user_profiles` دریافت می‌کند.
- صف غرفه در UI ادمین داخل disclosure جمع‌شونده قرار گرفت تا صفحه با کارت‌های بلند اشغال نشود.
- smoke مقصد علاوه بر status code، شکل JSON پاسخ‌های health، feed، شهرها، دسته‌ها و کپچا را بررسی می‌کند.
- پاسخ کپچا مطابق قرارداد واقعی (`challenge_id`، `target`، `y`) assert می‌شود.
- release جفت وب و API با برچسب `v0.1.18-2026-08-22` ساخته شد.

## اعتبارسنجی

- `npm run check` موفق.
- `npm test` موفق: ۵۱ تست API و ۱ تست shared.
- `npm run release:check` موفق.
- `npm run smoke:hosted` با دسترسی شبکه موفق: ۷ check شامل CORS.
- `npm run release:cpanel` موفق و ZIPها ساخته شدند.

## موارد deferred

- `npm run smoke:hosted:auth` به `HOSTED_AUTH_TOKEN` معتبر نیاز دارد و بدون secret اجرا نشد.
- تست تصمیم واقعی ادمین، ثبت غرفه و گالری روی مقصد نیازمند حساب/fixture مجاز است.
- تست کیفیت تعاملی harness محلی همچنان به مشکل موجود `browserContext.newPage` وابسته است.

## انتشار

- [بسته وب](../../release/cpanel/4d-web-v0.1.18-2026-08-22.zip)
- [بسته API](../../release/cpanel/4d-api-v0.1.18-2026-08-22.zip)
- [manifest](../../release/cpanel/4d-release-manifest-v0.1.18-2026-08-22.txt)

## گام بعد

Development Sprint 99: performance، security hardening و load test کنترل‌شده ۳۰۰ کاربر.
