# استراتژی اپ موبایل 4D

## تصمیم فعلی

اپ موبایل native هنوز وارد فاز ساخت کامل نمی‌شود. مسیر درست برای 4D این است:

1. ابتدا web MVP و API به beta پایدار برسند.
2. نسخه وب به شکل PWA/installable روی موبایل آماده شود.
3. بعد از اعتبارسنجی جریان‌های اصلی، scaffold اپ موبایل native ساخته شود.

در Sprint 27، پروژه وارد مرحله Mobile Readiness شد: وب‌اپ اکنون manifest، آیکن، theme color و service worker پایه دارد و می‌تواند پایه نصب‌پذیری موبایل باشد.

## چرا هنوز native app کامل شروع نمی‌شود؟

- هنوز storage عکس production-ready نیست و تصویرها فعلا در PostgreSQL به شکل base64 ذخیره می‌شوند.
- کپچای فعلی client-side است و برای production باید bot protection سمت سرور اضافه شود.
- چت هنوز unread، notification و real-time/polling منظم ندارد.
- beta با چند کاربر واقعی و چند آگهی عکس‌دار هنوز باید تست شود.

شروع native app قبل از حل این موارد باعث می‌شود همان مشکلات در دو کلاینت تکرار شوند.

## زمان پیشنهادی شروع ساخت اپ موبایل

شروع واقعی اپ موبایل بعد از این milestoneها مناسب است:

- Deploy target و secret manager انتخاب و مسیر production مشخص شده باشد.
- object storage برای عکس آگهی فعال شده باشد.
- server-side bot protection برای OTP/signup اضافه شده باشد.
- چت حداقل unread state و refresh/polling قابل قبول داشته باشد.
- یک تست beta کوچک با چند شماره واقعی و چند آگهی عکس‌دار انجام شده باشد.

با وضعیت فعلی، اگر همین مسیر ادامه پیدا کند، native mobile می‌تواند بعد از ۲ تا ۴ sprint دیگر شروع شود. تا آن زمان PWA موبایل برای تست واقعی کاربران محلی کافی‌تر و سریع‌تر است.

## Stack پیشنهادی

پیشنهاد فعلی برای native app:

- React Native + Expo
- TypeScript
- استفاده از API فعلی Fastify
- اشتراک contractها و helperهای سبک از `packages/shared`
- شروع با Android-first برای تست محلی، سپس iOS

## Scope نسخه اول موبایل

نسخه اول موبایل نباید همه قابلیت‌های admin را داشته باشد. تمرکز:

- مشاهده بازار و جستجو/فیلتر
- ثبت‌نام/ورود با SMS و رمز
- تکمیل پروفایل
- ثبت آگهی با عکس
- آگهی‌های من
- جزئیات آگهی
- چت داخل برنامه
- گزارش آگهی

پنل ادمین در نسخه اول موبایل native لازم نیست و می‌تواند روی web/admin بماند.

## کارهای بعدی

## زمان شروع Native Mobile

در وضعیت فعلی، ساخت native app هنوز شروع نشده است. فاز درست برای شروع آن بعد از تکمیل Sprintهای 55 تا 58 است؛ یعنی پس از تثبیت business profile/trust، search backend، عملیات media و یک pilot واقعی. بعد از آن، Sprint موبایل شامل scaffold `apps/mobile` با React Native + Expo، ورود مشترک، feed، ثبت آگهی، پروفایل، favorites و chat خواهد بود. پنل admin در web باقی می‌ماند.

- تکمیل PWA smoke روی موبایل واقعی
- افزودن object storage
- افزودن bot protection سمت سرور
- افزودن unread/notification پایه برای چت
- تصمیم نهایی درباره Expo و ساخت `apps/mobile`
