# گزارش تکمیل Development Sprint 67

تاریخ: 2026-08-13

## هدف

تبدیل shell اولیه موبایل به تجربه قابل استفاده marketplace و حذف blocker مربوط به Android export.

## خروجی‌های انجام‌شده

- router محدود برای بازار، ثبت آگهی، گفتگو و پروفایل
- جزئیات آگهی و ثبت contact intent واقعی
- ورود OTP با نگهداری session در AsyncStorage
- انتخاب تصویر با `expo-image-picker`
- upload تصویر به `/api/v1/media/listing-images`
- ثبت آگهی در `/api/v1/listings`
- دریافت گفتگوها از `/api/v1/me/conversations`
- logout و پاک‌سازی session محلی
- حذف dependencyهای React Navigation و `react-native-screens` از bundle موبایل پس از خطای Fabric codegen

## اعتبارسنجی

- `npm run typecheck -w @four-d/mobile` موفق
- `npx expo export --platform android` موفق و bundle اندروید تولید شد
- `npm run check` موفق
- `npm run build` موفق
- `npm run qa:visual` اجرا شد؛ چون browser bundled موجود نبود از system Chrome استفاده شد
- command صحیح بررسی bundle در ریشه `npm run bundle:check` است؛ `npm run bundle` وجود ندارد

## موارد باز

- تست Android و iOS روی دستگاه واقعی هنوز انجام نشده است.
- onboarding پروفایل هنوز native نشده است.
- inbox وجود دارد، اما thread کامل و ارسال پیام native در sprint بعدی است.
- npm تعداد 17 آسیب‌پذیری زنجیره Expo گزارش می‌کند؛ در R-024 ثبت شد.

## دستور ادامه

```powershell
npm run dev:mobile
npx expo export --platform android
```

پیش از phase بعدی این گزارش و اسناد status، tracker، decision log و risk register را بخوان.
