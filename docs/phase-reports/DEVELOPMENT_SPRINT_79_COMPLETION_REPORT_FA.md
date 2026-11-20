# گزارش تکمیل Development Sprint 79

تاریخ: 2026-08-13

## خروجی

- ثبت listener برای deep link موبایل با React Native Linking
- خواندن initial URL در cold start
- پشتیبانی از `four-d://conversation/{id}`
- بازکردن conversation مرتبط در inbox
- کنترل اندازه data URL تصویر چت پیش از upload
- پیام فارسی برای تصویر بزرگ‌تر از ۲MB

## اعتبارسنجی

- `npm run check` موفق
- `npm run build` موفق
- `npm run typecheck -w @four-d/mobile` موفق
- `npx expo export --platform android` موفق

## محدودیت

ارسال push native کامل هنوز نیازمند ثبت device token و provider push موبایل است؛ deep link foundation آماده است و می‌تواند مقصد push آینده باشد.

## گام بعد

push واقعی موبایل، thumbnail و cleanup attachment.
