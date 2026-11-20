# گزارش Development Sprint 94 - Listing Experience Foundation

## هدف

بستن exit criteria باقی‌مانده Sprint 93 و شروع کنترل‌شده Epic «Listing Experience & Marketplace UX Refinement».

## انجام‌شده

- quality gate TypeScript، build وب و تست workspaceها اجرا شد.
- ۵۱ تست API و ۱ تست shared موفق شد.
- release نسخه‌دار cPanel ساخته شد: `v0.1.13-2026-08-22`.
- Gap Analysis پیوست در `docs/LISTING_EXPERIENCE_GAP_ANALYSIS_FA.md` ثبت شد.
- کارت آگهی در Web با click روی محتوای کارت و keyboard Enter/Space جزئیات را باز می‌کند.
- Favorite، تماس و CTAهای مستقل با stop propagation از بازشدن ناخواسته detail جدا شدند.
- متن عمومی و خارج از context «اعتماد مرحله‌ای» حذف و «شروع تماس امن» به «تماس» اصلاح شد.

## خروجی انتشار

- `release/cpanel/4d-web-v0.1.14-2026-08-22.zip`
- `release/cpanel/4d-api-v0.1.14-2026-08-22.zip`
- `release/cpanel/4d-release-manifest-v0.1.14-2026-08-22.txt`

## هشدارها و موارد باز

- Docker daemon در محیط توسعه در دسترس نبود؛ migration و smoke واقعی PostgreSQL/moderation اجرا نشد.
- FCM واقعی و E2E دستگاهی هنوز deferred است.
- Dynamic category schema، view count قابل نمایش و push chat در sliceهای بعدی هستند.

## وضعیت

`READY WITH WARNINGS` برای foundation و release artifact؛ برای انتشار production نهایی، smoke دیتابیس و دستگاه واقعی باقی است.
