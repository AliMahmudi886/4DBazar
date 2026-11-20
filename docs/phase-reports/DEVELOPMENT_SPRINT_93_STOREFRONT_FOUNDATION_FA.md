# گزارش Development Sprint 93 - Storefront Foundation

## وضعیت

تکمیل‌شده برای increment وب؛ این گزارش خروجی foundation و نخستین UI واقعی «غرفه 4D» را ثبت می‌کند.

## خروجی

- Gap Analysis و مرزبندی حساب، پروفایل کسب‌وکار و غرفه در `docs/STOREFRONT_GAP_ANALYSIS_FA.md` ثبت شد.
- تصمیم MVP: یک غرفه برای هر مالک، moderation پیش از active شدن و اتصال nullable آگهی‌ها.
- payment، subscription، follow، staff و commerce کامل deferred شدند.

## معیارهای خروج

- [x] migration و typeهای غرفه
- [x] repository و API مالک/public/admin
- [x] اتصال آگهی به غرفه
- [x] UI وب و تست responsive پایه
- [x] تست API و build production

## جزئیات پیاده‌سازی این increment

- migration `0022_storefronts.sql` جدول `storefronts`، slug/status و `market_contents.storefront_id` را اضافه می‌کند.
- repository در `apps/api/src/modules/storefront/repository.ts` مالکیت، public visibility، آگهی‌های approved و تصمیم moderation را پوشش می‌دهد.
- مسیرهای API در `apps/api/src/server.ts` اضافه شدند و assetهای لوگو/کاور دوباره با owner بررسی می‌شوند.
- تست unit نرمال‌سازی slug اضافه شد؛ UI و smoke دیتابیس در increment بعدی تکمیل می‌شوند.

## Increment 2 - UI مالک و صفحه عمومی

- پروفایل کاربر اکنون غرفه را در disclosure مستقل از پروفایل کسب‌وکار نشان می‌دهد.
- فرم ساخت/ویرایش غرفه شامل نام، slug، شهر، دسته، نوع فعالیت، معرفی، توضیحات، محدوده، تلفن و ساعات کاری است.
- آگهی‌ساز یک انتخاب اختیاری برای اتصال آگهی به غرفه دارد؛ اتصال بدون غرفه همچنان معتبر است.
- مسیر عمومی `/storefront/:slug` فقط داده‌های active و آگهی‌های approved را نمایش می‌دهد.
- `npm run check` و `npm run build` موفق هستند.

## ریسک‌های باز

- local media برای production بلندمدت مناسب نیست؛ تا object storage، backup اجباری است.
- مدل یک غرفه برای هر مالک محدودیت MVP است و پیش از multi-storefront باید migration طراحی شود.
