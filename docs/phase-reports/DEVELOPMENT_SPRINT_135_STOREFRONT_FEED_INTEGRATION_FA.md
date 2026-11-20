# Development Sprint 135 — Storefront Feed Integration

تاریخ: ۱۴۰۵/۰۶/۰۹

## Root Cause

در `listFeedContents` شرط صریح `market_contents.storefront_id IS NULL` وجود داشت؛ به همین دلیل هر آگهی متصل به غرفه، حتی در وضعیت `approved` و بدون حذف، از بازار عمومی حذف می‌شد.

## Changes

- شرط حذف آگهی‌های دارای غرفه از public feed حذف شد.
- وضعیت انتشار مرکزی همچنان `approved` و حذف‌نشدن (`deleted_at IS NULL`) است و انقضا نیز کنترل می‌شود.
- Storefront listing projection با داده‌های لازم‌تر شامل metadata، وضعیت، storefront context، condition و view count کامل‌تر شد.
- کارت‌های وب غرفه لینک واقعی `/listing/{id}`، تاریخ و بازدید دارند.
- کارت‌های موبایل غرفه قابل لمس شده و به Detail کامل می‌روند.
- empty state و copy غرفه خواناتر شد.

## Verification

- `npm run check`: PASS
- API build: PASS
- Web build: PASS
- Mobile typecheck: PASS
- API tests: ۶۰ از ۶۰ PASS
- Shared tests: ۳ از ۳ PASS
- Bundle budget: PASS
- Mobile release preflight: PASS

## محدودیت باقی‌مانده

تست end-to-end با دادهٔ واقعی غرفه، smoke مقصد cPanel و تست بصری روی دستگاه واقعی در این محیط قابل تأیید نیست؛ باید پس از deploy با حساب دارای غرفهٔ active انجام شود.
