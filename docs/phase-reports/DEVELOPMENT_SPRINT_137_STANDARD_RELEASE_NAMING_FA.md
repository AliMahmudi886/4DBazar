# Development Sprint 137 — Standard Release Naming

تاریخ: ۱۴۰۵/۰۶/۰۹

## تغییر

پیش‌فرض اسکریپت release cPanel از `0.1.1` به نسخهٔ release train فعلی `0.1.36` اصلاح شد تا اجرای معمولی اسکریپت artifact قدیمی تولید نکند. نام استاندارد artifactها:

- `4d-web-v0.1.36-2026-08-31.zip`
- `4d-api-v0.1.36-2026-08-31.zip`
- `4d-release-manifest-v0.1.36-2026-08-31.txt`

## Verification

- build مشترک، API و وب: PASS
- release preflight: PASS
- bundle budget: PASS
- SHA-256 هر دو ZIP در manifest ثبت شد.
- releaseهای قبلی حذف نشدند.

## نکته

نسخهٔ اپ موبایل مستقل از بستهٔ cPanel است و در Expo با `0.1.14` و Android `versionCode=18` تعریف شده؛ این فاز APK جدید تولید یا نام‌گذاری مجدد نکرد.
