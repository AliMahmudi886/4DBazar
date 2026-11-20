# گزارش تکمیل Development Sprint 80

## عنوان

Native Mobile Notifications Foundation

## هدف

ایجاد foundation اعلان native در اپ موبایل و اتصال tap اعلان به deep link گفتگوی داخلی.

## تغییرات انجام‌شده

- اضافه‌شدن `expo-notifications` به workspace موبایل.
- اضافه‌شدن plugin اعلان به `apps/mobile/app.json`.
- ایجاد `apps/mobile/notifications.ts` برای permission، کانال Android، foreground handler و دریافت Expo push token.
- ذخیره local token با AsyncStorage برای نمایش وضعیت در پروفایل.
- اضافه‌شدن پنل فعال‌سازی اعلان به حساب کاربر در `ProfileScreenV6`.
- اتصال `conversationId` در notification response به state deep link موجود در `App.tsx`.

## تست و validation

- `npm run check` موفق.
- `npm run build` موفق.
- `npm run typecheck -w @four-d/mobile` موفق.
- `npx expo config --json` موفق.
- `npx expo export --platform android` موفق.

## محدودیت و کار deferred

این فاز ارسال production push را فعال نمی‌کند. برای آن EAS development/production build، credentialهای FCM/APNs، migration و endpoint برای native token، و worker یا مسیر ارسال push در API لازم است. در Expo Go ممکن است remote push token یا delivery کامل در دسترس نباشد.

## وضعیت

تکمیل‌شده.
