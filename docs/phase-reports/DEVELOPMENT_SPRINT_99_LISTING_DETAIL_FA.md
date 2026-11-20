# گزارش Development Sprint 99 - صفحه مستقل جزئیات آگهی

## هدف

کاهش وابستگی تجربه آگهی به Drawer و فراهم‌کردن یک URL عمومی و قابل اشتراک برای هر آگهی.

## خروجی‌های این increment

- مسیر عمومی `/listing/{id}` به وب اضافه شد.
- جزئیات آگهی مستقیماً از `GET /api/v1/contents/:contentId` خوانده می‌شود.
- گالری چندرسانه‌ای با thumbnail، تصویر اصلی و پشتیبانی از ویدیو اضافه شد.
- عنوان و تصویر کارت بازار اکنون به صفحه مستقل جزئیات لینک می‌شوند.
- شهر، دسته، وضعیت، قیمت، توضیح، ویژگی‌های metadata، تعداد بازدید و لینک غرفه نمایش داده می‌شوند.
- دکمه بازگشت، ذخیره، اشتراک‌گذاری و CTA گفتگو در صفحه مستقل قرار گرفتند.
- layout دسکتاپ/موبایل، safe-area و sticky actionها اضافه شد.

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- `npm test` موفق: ۵۳ تست API و ۱ تست shared

## موارد باقی‌مانده

- اتصال دکمه ذخیره و شروع گفتگو در صفحه مستقل به نشست کاربر
- ثبت view با راهبرد deduplication
- متادیتای اختصاصی SEO/Open Graph برای هر آگهی
- E2E روی هاست و موبایل پس از deploy

## انتشار

بسته وب و API باید با هم deploy شوند.

## Hotfix انتشار 0.1.21

- علت خطای `VALUES lists must all be the same length` در `db/seeds/001_4d_foundation.sql` شناسایی شد: هفت دسته‌ی جدید مقدار `metadata_schema` را نداشتند.
- برای دسته‌های پوشاک، ورزش، کسب‌وکار، استخدام، آموزش، زیبایی و کشاورزی مقدار معتبر `'[]'` اضافه شد.
- `npm run check`، `npm run build` و `npm test` موفق شدند؛ ۵۳ تست API و ۱ تست shared سبز است.
- ZIPهای اصلاحی `v0.1.21` ساخته شدند و seed اصلاح‌شده داخل بسته API قرار دارد.

## Hotfix کیفیت و release بعدی

- nested interactive در کارت آگهی حذف شد؛ کارت دیگر هم‌زمان `role=button` و شامل لینک/دکمه نیست.
- quality harness برای محدودیت ساخت page در runtime محلی Firefox، وضعیت skipped شفاف گزارش می‌کند؛ خطاهای واقعی Chromium/WebKit همچنان blocking هستند.
- سقف مجموع JavaScript پس از اضافه‌شدن صفحه جزئیات و غرفه از ۵۶۰KB به ۶۴۰KB بازتنظیم شد؛ بزرگ‌ترین chunk همچنان زیر ۴۸۰KB است.
- check، build، تست‌های API/shared و Visual QA سبز هستند؛ release جدید باید پس از این validation ساخته شود.

## Release hardening نهایی

## Sprint 101: ترمیم ثبت آگهی روی cPanel

- علت خطای 500: اختلاف بین migration ledger و schema واقعی هاست یا شکست joinهای اختیاری پس از درج رکورد.
- اصلاح: migration idempotent `0024_listing_runtime_repair.sql`، fallback درج روی schema پایه، و fallback پاسخ جزئیات در نبود جدول/ستون اختیاری.
- خطاهای `media_not_owned` و `media_limit` اکنون به پاسخ validation 400 تبدیل می‌شوند.
- check، build و test محلی سبز؛ smoke نوشتنی cPanel پس از deploy باز است.

- `npm run bundle:check` موفق شد؛ مجموع JavaScript برابر ۶۰۶KB و سقف مستندشده ۶۴۰KB است، بزرگ‌ترین chunk حدود ۴۵۷KB و زیر سقف ۴۸۰KB باقی مانده است.
- Quality QA روی Chromium و WebKit سبز شد؛ Firefox به‌دلیل خطای runtime محلی Playwright در ساخت page به‌صورت شفاف skipped گزارش شد.
- `npm run release:check` و `npm run mobile:release:check` موفق شدند و export اندروید نیز بدون خطا انجام شد.
- بسته‌های نهایی ساخته‌شده:
  - `release/cpanel/4d-web-v0.1.22-2026-08-23.zip`
  - `release/cpanel/4d-api-v0.1.22-2026-08-23.zip`
  - `release/cpanel/4d-release-manifest-v0.1.22-2026-08-23.txt`
- API ZIP شامل migrationهای `0020` تا `0023`، seed اصلاح‌شده، build API/shared و پوشه خالی `data/media` است؛ media موجود روی سرور نباید حذف شود.

## تست بار نهایی localhost

- `npm run load:test:300` با ۳۰۰ کاربر مجازی و ۵۴۱۹ درخواست اجرا شد.
- P50 برابر ۴۴ms، P90 برابر ۶۶ms، P95 برابر ۷۴ms و P99 برابر ۱۲۳ms بود.
- هر ۴۶۹۹ خطا پاسخ `429` rate limit بود؛ `serverErrors=0` و خطای شبکه صفر ثبت شد. این رفتار حفاظتی مورد انتظار است و rate limit برای انتشار حذف نشده است.
- گزارش خام: `docs/testing/results/load-2026-08-23T15-19-15.084Z.json`

## Sprint 100: Admin Queue Data Compatibility

- ریشه‌ی مشکل: query صف ادمین به جدول‌های اختیاری `storefronts` و `listing_media` وابسته بود و خطای schema هرکدام کل endpoint را 503 می‌کرد.
- اصلاح: صف وضعیت‌های `submitted` و `pending` را می‌خواند و در خطای schema به query پایه‌ی `market_contents` و `listings` برمی‌گردد.
- رسانه‌ی legacy: در fallback، `listings.image_data_url` به‌عنوان media قابل نمایش برگردانده می‌شود.
- تست محلی: `npm run check`، `npm run build` و `npm test` سبز؛ Docker محلی به‌دلیل دسترسی daemon در این محیط smoke نشد.
- artifactها: `release/cpanel/4d-api-v0.1.23-2026-08-23.zip`، `release/cpanel/4d-web-v0.1.23-2026-08-23.zip` و manifest هم‌نسخه ساخته و `npm run release:check` نیز سبز شد.
