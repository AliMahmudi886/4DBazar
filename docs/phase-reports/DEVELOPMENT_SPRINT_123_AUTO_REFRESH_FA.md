# گزارش Development Sprint 123 — تمدید خودکار نشست

## هدف

استفاده عملی از refresh token برای جلوگیری از خطای ناگهانی نشست منقضی‌شده در وب و موبایل.

## تغییرات واقعی

- موبایل در پاسخ 401، در صورت وجود refresh token، فقط یک بار session را rotate و درخواست اصلی را با access token جدید تکرار می‌کند.
- درخواست‌های refresh هم‌زمان با یک promise مشترک coalesce می‌شوند تا چند rotation موازی یا loop ایجاد نشود.
- وب برای درخواست‌های authenticated همین رفتار را با `refreshWebSession` انجام می‌دهد.
- در صورت شکست refresh، پاسخ 401 اصلی حفظ می‌شود و کاربر باید دوباره وارد شود.
- refresh endpoint خودش وارد مسیر retry نمی‌شود.

## اعتبارسنجی

- `npm run check`: PASS
- تست API: PASS — ۵۶ تست
- `npm run typecheck -w @four-d/mobile`: PASS
- `npm run build -w @four-d/web`: PASS
- Gradle `assembleRelease`: PASS
- APK: `release/mobile/4d-bazar-mobile-v0.1.13-auto-refresh-build17-local.apk`
- SHA-256: `23D2F5D71FAE9862B8F28107B6D53B503F48A0B4B9A0DCB46F3C8292B2E27DC9`

## نکته انتشار

ابتدا migration `0027_session_refresh_tokens.sql` را روی دیتابیس مقصد اجرا کن، سپس API و بعد وب/موبایل را منتشر کن. نسخه API قدیمی بدون جدول refresh نمی‌تواند login جدید را کامل کند.
