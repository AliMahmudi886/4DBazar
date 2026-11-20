# گزارش تکمیل Development Sprint 90

## عنوان

Cross-client Workspace Completion and Deterministic cPanel Release

## هدف

تکمیل workspaceهای اصلی کاربر در وب و موبایل، رفع رفتار معکوس پازل در RTL، حذف fallbackهای گمراه‌کننده production و تبدیل انتشار cPanel از مجموعه دستورهای دستی به بسته مستقل و قابل تکرار.

## خروجی‌های تکمیل‌شده

- پازل وب و موبایل جهت فیزیکی LTR دارد و متن فارسی آن RTL باقی مانده است؛ drag دیگر وارونه رسم نمی‌شود.
- جزئیات آگهی موبایل دارای تصویر، نشانه‌های اعتماد، وضعیت loading/error و ورود مستقیم به گفتگوی ساخته‌شده است.
- پروفایل موبایل از `/api/v1/me` و `/api/v1/me/contents` hydrate می‌شود و ویرایش نام، نام خانوادگی، شهر و رمز را ذخیره می‌کند.
- inbox و thread موبایل loading، retry، unread state، mute، block، report، تصویر و composer کامل‌تری دارند.
- چت وب dialog قابل دسترس، بستن با scrim/Escape، نمایش امن تصویر و report فقط برای پیام طرف مقابل دارد.
- داده demo و success preview ساختگی از build production وب حذف شد؛ شکست ثبت آگهی فرم کاربر را حفظ می‌کند.
- Service Worker به network-first navigation و cache version جدید منتقل شد تا نسخه قدیمی Chrome بعد از انتشار باقی نماند.
- CORS API با `CORS_ORIGINS` محدود شد و رفتار origin مجاز/غیرمجاز تست مستقل دارد.
- دستور `npm run release:cpanel` یک بسته مستقل وب و API با dependencyهای دقیق، startup ثابت و upload manifest تولید می‌کند.
- دو فایل آماده آپلود `release/cpanel/web-upload.zip` و `release/cpanel/api-upload.zip` ساخته شدند.

## Validation

- `npm run check` موفق.
- `npm test` موفق؛ ۴۷ تست API و ۱ تست shared بدون خطا اجرا شدند.
- `npm run bundle:check` موفق؛ مجموع JavaScript وب حدود 509KB و زیر budget است.
- `npm run release:check` موفق.
- `npm run qa:visual -w @four-d/web` موفق؛ چهار تصویر desktop/mobile بازار و ادمین بدون overflow تولید شد.
- `npx expo export --platform android --output-dir dist-export --clear` موفق؛ ۷۸۵ module bundle شد.
- نصب مستقل بسته API با ۱۱۳ dependency و import واقعی `config` و `server` موفق بود.
- `https://api.4dbazar.ir/health/live` و `health/ready` پاسخ 200 دادند؛ database برابر `ok` است.
- درخواست category با Origin وب production پاسخ 200 و header صحیح CORS دریافت کرد.
- `npm audit --omit=dev --workspace=@four-d/api` برای runtime تولیدی API صفر آسیب‌پذیری گزارش کرد؛ audit کل monorepo ۲۲ هشدار زنجیره Expo/Metro دارد که نیازمند upgrade کنترل‌شده است.

## تصمیم‌ها

- D-070: انتشار cPanel فقط از artifact مستقل و pin شده انجام می‌شود؛ install دستی dependency یا workspace روی هاست مسیر رسمی نیست.
- D-071: build production نباید داده demo یا success ساختگی نمایش دهد و navigation cache باید network-first باشد.

## ریسک و Deferred

- media هاست فعلی با `NODE_ENV=development` و storage محلی فقط راه‌حل کم‌هزینه beta است؛ backup پوشه `data/media` الزامی است.
- object storage و production guard کامل همچنان قبل از انتشار عمومی در مقیاس نیاز است.
- preview APK با EAS به credential Android و تست روی گوشی واقعی نیاز دارد و در این محیط ساخته نشد.
- Push واقعی Android همچنان به FCM credential نیاز دارد.
- زنجیره Expo/Metro دارای ۲۲ هشدار audit است؛ رفع با `--force` ممنوع و به migration نسخه Expo در فاز جدا نیاز دارد.

## Exit Criteria

- [x] detail، inbox/chat و profile موبایل به API واقعی متصل و دارای stateهای اصلی هستند.
- [x] پازل در وب و موبایل جهت صحیح دارد.
- [x] fixture و موفقیت ساختگی در production حذف شده است.
- [x] CORS production محدود و تست‌شده است.
- [x] بسته مستقل و ZIP دقیق برای وب و API تولید می‌شود.
- [x] build، test، Android export و visual QA موفق‌اند.
- [x] status، tracker، roadmap، decision log، risk register و handoff همگام شدند.

## فاز بعد

Development Sprint 91 - Release Candidate Hardening: انتشار بسته Sprint 90 روی cPanel، smoke واقعی ورود/OTP/ثبت آگهی/چت، backup media، EAS preview APK و تست گوشی واقعی.
