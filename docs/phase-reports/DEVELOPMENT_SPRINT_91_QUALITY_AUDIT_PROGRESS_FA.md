# گزارش پیشرفت Development Sprint 91

## عنوان

Release Candidate Quality Audit and Hardening

## خروجی این مرحله

- ممیزی طراحی، UX، responsive، عملکرد، accessibility، SEO، امنیت، performance و release readiness انجام شد.
- hardening وب/API و تنظیمات native موبایل پیاده‌سازی شد.
- quality gate چندمرورگری ۲۷ سناریو با Axe و overflow detection اضافه و پاس شد.
- ۵۰ تست، build، typecheck، bundle budget، visual QA، release preflight و Expo Doctor 18/18 پاس شدند.
- artifact تازه cPanel در `release/cpanel` تولید شد.
- OTP موبایل با hint رسمی `sms-otp/one-time-code` و verify خودکار پس از تکمیل ۶ رقم بهبود یافت؛ هیچ مجوز عمومی خواندن پیامک اضافه نشد.
- طراحی اجرایی Sprint 92 بازار خدمات و تعرفه، بدون ورود زودهنگام منطق مالی به RC، در `docs/SERVICE_MARKETPLACE_TARIFFS_FA.md` ثبت شد.
- سیستم طراحی اجرایی مشترک در `docs/DESIGN_SYSTEM_FA.md` ثبت و روی پوسته بازار Web/Mobile اعمال شد.
- Web بازار hero فشرده، کارت تصویری بزرگ‌تر، فیلتر responsive و navigation پایین موبایل دریافت کرد.
- Mobile بازار به search، category strip، grid تصویری و navigation برجسته ارتقا یافت؛ جهت drag پازل RTL و حباب‌های chat اصلاح شد.
- ذخیره پروفایل برای شناسه شهر نامعتبر مقاوم شد و خطای واقعی API در رابط وب نمایش داده می‌شود؛ موبایل نیز شناسه شهر قدیمی را به شهر معتبر fallback می‌کند.
- taxonomy بازار با الهام از الگوهای رایج دسته‌بندی بازارهای نیازمندی، بدون کپی رابط یا متن، از پنج دسته پایه به دسته‌های وسیله نقلیه، املاک، پوشاک، ورزش، کسب‌وکار، استخدام، آموزش، زیبایی و کشاورزی گسترش یافت.
- banner تصویری برندمحور در `apps/web/public/brand/4d-market-banner.png` تولید و به hero وب متصل شد؛ برای حفظ خوانایی، متن فارسی خارج از تصویر رندر می‌شود.
- نسخه کم‌کنتراست همین banner در `apps/mobile/assets/4d-market-banner.png` به header بازار موبایل اضافه و Android export دوباره با موفقیت اجرا شد.
- برای رفع blocker ذخیره پروفایل، preflight CORS اکنون `PUT` و headerهای لازم را می‌پذیرد؛ فهرست شهر نیز در ذخیره‌سازی سمت API اعتبارسنجی می‌شود.
- پایه اجرایی انتشار خدمت اضافه شد: `service_listing`، جزئیات حوزه/مدل قیمت/زمان ارائه، فیلتر دسته‌های خدماتی و جست‌وجوی شهر و دسته در وب و موبایل. تعرفه و پرداخت عمداً در این تغییر وارد نشده‌اند.
- فرم ثبت آگهی از نظر تراکم responsive اصلاح شد؛ قیمت ثابت/توافقی اکنون انتخاب صریح دارد، مبلغ ثابت با جداکننده هزارگان نمایش داده می‌شود و API مقدار نامعتبر را رد می‌کند.
- ریشه باگ تصویر بعد از refresh رفع شد: URL نسبی media در همه نقاط Web با origin API resolve می‌شود و پاسخ upload نیز قبل از ذخیره اعتبارسنجی می‌شود.
- خروجی cPanel از این پس با label نسخه/تاریخ تولید می‌شود؛ خروجی قبلی `v0.1.2` بود و بعد از smoke runner با نسخه بعدی بازسازی می‌شود.
- برای جلوگیری از هزینه جدید، backup رایگان local media با checksum و verify در `scripts/backup-local-media.mjs` و راهنمای `docs/MEDIA_BACKUP_FREE_FA.md` اضافه شد؛ Object Storage همچنان deferred است.
- smoke runner مستقل `npm run smoke:hosted` برای health، readiness، feed، شهرها، دسته‌ها، captcha و CORS preflight اضافه شد؛ این ابزار هیچ OTP یا secretی را خودکار نمی‌کند.
- اجرای smoke روی `https://api.4dbazar.ir` در 2026-08-18 موفق بود: هر ۷ بررسی عمومی شامل `health/live`، `health/ready`، categories، cities، feed، captcha و CORS preflight پاس شدند.
- smoke حساب‌محور read-only با `npm run smoke:hosted:auth` اضافه شد؛ token فقط از `HOSTED_AUTH_TOKEN` خوانده می‌شود و هرگز در خروجی چاپ نمی‌شود.
- restore کنترل‌شده local media با `MEDIA_BACKUP_PATH` و `MEDIA_RESTORE_CONFIRM=YES` اضافه شد؛ فایل‌ها قبل و بعد از کپی با manifest checksum می‌شوند.
- preflight موبایل با `npm run mobile:release:check` اضافه شد؛ شناسه Expo، assetهای برند، نسخه Android و HTTPS بودن API همه profileهای EAS را بررسی می‌کند.
- preview APK جدید با EAS و `versionCode=3` موفق ساخته شد؛ روی emulator `Pixel_2_API_36` نصب و اجرا شد و صفحه ورود، لوگو و پازل به‌صورت بصری بررسی شدند؛ سناریوهای authenticated باقی است.

## وضعیت فاز

Sprint 91 هنوز **In Progress** است. smoke عمومی production پاس شده و artifact نسخه‌دار آماده است؛ backup/verify/restore واقعی روی cPanel نیز انجام شد: ۷ فایل، ۲۳۶۶۳۳ بایت و checksum موفق. smoke حساب‌محور و سناریوهای authenticated موبایل هنوز باید با حساب واقعی ثبت شوند.

## اعتبارسنجی پس از Design Hardening

- `npm run check`، build production وب، ۵۰ تست و bundle budget پاس شدند.
- Chromium و WebKit هرکدام ۹ سناریوی market/profile/admin روی mobile/tablet/desktop را با Axe و overflow detection پاس کردند.
- Android typecheck و `expo export --platform android --clear` پاس شدند.
- اجرای مجدد Firefox در این محیط قبل از load صفحه با خطای داخلی Playwright در `browserContext.newPage` متوقف شد. baseline قبلی Firefox پاس بوده، اما rerun پس از تغییر طراحی باید روی CI یا سیستم دارای browser binary سالم تکرار شود.
- بسته‌های نسخه‌دار `release/cpanel/4d-web-v0.1.1-YYYY-MM-DD.zip`، `4d-api-v0.1.1-YYYY-MM-DD.zip` و manifest هم‌نام با build تازه تولید می‌شوند.

## گام بعد

1. آپلود بسته‌های v0.1.3 وب و API و restart برنامه Node.
2. اجرای smoke ورود/OTP/آگهی/چت با حساب آزمایشی واقعی.
3. تنظیم backup روزانه media و آزمون restore.
4. اجرای smoke ورود/OTP، ثبت آگهی، پروفایل و چت داخل APK روی emulator و ثبت نتیجه.
5. تست Autofill واقعی OTP روی گوشی یا emulator و ثبت رفتار کیبورد/سیستم‌عامل.

اجرای smoke روی محیط واقعی:

```powershell
$env:HOSTED_API_BASE_URL="https://api.4dbazar.ir"
$env:HOSTED_WEB_ORIGIN="https://4dbazar.ir"
npm run smoke:hosted
```
