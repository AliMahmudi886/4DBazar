# Development Sprint 139 — Transport Card Overflow Fix

تاریخ: ۱۴۰۵/۰۶/۱۰

## Root Cause

کارت حمل‌ونقل هم‌زمان کلاس `market-launcher` را داشت و از ارتفاع ثابت ۲۷۰ پیکسل استفاده می‌کرد. وقتی جستجوی پیشرفته باز می‌شد، محتوای پایین کارت بریده می‌شد؛ در موبایل نیز کنترل‌ها باید با اولویت width کامل تک‌ستونه می‌شدند.

## Fix

- ارتفاع کارت حمل‌ونقل content-driven شد.
- فیلترهای مبدأ، مقصد و نوع مسیر در موبایل تک‌ستونه و width کامل شدند.
- کنترل‌های جستجو و Selectها `min-width: 0` و `width: 100%` دارند.

## Verification

- `npm run check`: PASS
- Web build: PASS
- Visual QA desktop/mobile: PASS
- Bundle budget: PASS
- Release استاندارد `v0.1.38-2026-09-01`: PASS
