# گزارش تکمیل Development Sprint 89

## عنوان

Cross-client UX and Mobile Brand Readiness

## هدف

رفع رفتار وارونه پازل در RTL، جایگزینی کپچای عددی موبایل با تعامل drag واقعی، اتصال build موبایل به API production و ارتقای تجربه‌های اصلی auth، market، navigation و ثبت آگهی.

## خروجی‌های تکمیل‌شده

- همه اجزای افقی پازل وب با مختصات فیزیکی `left` رسم می‌شوند و متن همچنان RTL است.
- پازل native در `apps/mobile/components/PuzzleCaptcha.tsx` فقط بعد از drag واقعی و رسیدن به tolerance از API proof می‌گیرد.
- callback تایید پازل idempotent است و برای هر challenge فقط یک درخواست می‌فرستد.
- API پیش‌فرض موبایل `https://api.4dbazar.ir` است و با `EXPO_PUBLIC_API_BASE_URL` قابل override است.
- media URLهای نسبی برای آگهی و پیام تصویری با base URL API کامل می‌شوند.
- app icon، adaptive icon، splash و لوگوی افقی شفاف از asset رسمی برند ساخته و در Expo config ثبت شدند.
- صفحه ورود با mode selector آیکن‌دار، خطای قابل‌فهم، OTP شش‌رقمی و پازل تصویری بازطراحی شد.
- بازار موبایل header برند، وضعیت آنلاین، loading، retry، empty state و کارت‌های آگهی بهبودیافته دارد.
- bottom navigation دارای آیکن و selected state پایدار است.
- فرم ثبت آگهی شهر و دسته‌بندی را از API می‌گیرد و قیمت ثابت/توافقی، مبلغ، انتخاب/حذف عکس و validation کامل‌تری دارد.
- fetch پروفایل کسب‌وکار و trust در وب به `API_BASE_URL` متصل شد و دیگر به origin وب ارسال نمی‌شود.
- محدودسازی OTP در development/test هنگام قطع PostgreSQL fallback حافظه‌ای کنترل‌شده دارد و ورود با رمز نیز خطای دیتابیس را به رفتار قابل‌پیش‌بینی تبدیل می‌کند؛ production همچنان fail-closed و وابسته به persistence واقعی است.

## Validation

- `npm run typecheck -w @four-d/mobile` موفق.
- `npx expo config --type public` موفق و icon/splash/adaptive icon تایید شد.
- `npm run check` و `npm run build` موفق.
- `npm test` موفق؛ ۴۶ تست API و ۱ تست shared بدون خطا اجرا شدند.
- `npx expo export --platform android --output-dir dist-export --clear` موفق؛ ۷۸۵ module bundle شد.
- اجرای development build روی `Pixel_2_API_36` موفق.
- drag پازل در emulator با challenge API production آزمایش و حالت «تایید شد» مشاهده شد.
- `npm run build -w @four-d/web` موفق.
- `npm run bundle:check -w @four-d/web` موفق؛ مجموع JS حدود 508KB و زیر budget بود.
- `npm run qa:visual -w @four-d/web` موفق؛ viewport موبایل و دسکتاپ بدون overflow تایید شدند.

## تصمیم‌ها

- D-069: جداسازی جهت متن RTL از مختصات فیزیکی drag و production-first بودن endpoint موبایل.

## ریسک و Deferred

- R-034: captcha challenge فعلاً حافظه‌ای است؛ پیش از scale چند-worker باید store مشترک داشته باشد.
- preview/production APK هنوز به credential معتبر Android در EAS نیاز دارد.
- Push واقعی Android هنوز به FCM credential نیاز دارد و graceful fallback فعلی حفظ شده است.
- object storage پایدار برای media production همچنان باید جداگانه نهایی شود.

## Exit Criteria

- [x] پازل وب در RTL جهت صحیح دارد.
- [x] پازل موبایل drag واقعی و proof سمت API دارد.
- [x] اپ بدون وابستگی به IP کامپیوتر به API production وصل می‌شود.
- [x] برند native در launcher و داخل اپ درست استفاده می‌شود.
- [x] flow ثبت آگهی از city/category واقعی استفاده می‌کند.
- [x] build، export و visual QA موفق‌اند.
- [x] status، tracker، roadmap، decision log، risk register و handoff همگام شدند.

## فاز بعد

Development Sprint 90 - Cross-client Workspace Completion: تکمیل detail، inbox/chat و profile، اجرای E2E production و ساخت preview APK برای تست روی گوشی واقعی.
