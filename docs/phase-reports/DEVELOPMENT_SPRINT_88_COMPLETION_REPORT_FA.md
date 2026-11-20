# گزارش تکمیل Development Sprint 88

## عنوان

EAS Android Build Readiness

## تغییرات

- `eas.json` با profileهای development، preview و production اضافه شد.
- دستور `npm run mobile:build:android:development` اضافه شد.
- platform native token از `Platform.OS` ثبت می‌شود.
- plugin `expo-notifications` و extra EAS در config موبایل ثبت شدند.

## Validation

- `npm run check` موفق.
- `npm run typecheck -w @four-d/mobile` موفق.
- `npx expo config --json` موفق.
- `npx expo export --platform android` موفق.

## Deferred / Blocker

cloud build واقعی نیازمند `eas init`، projectId واقعی، login EAS و credentials Android است. این اطلاعات در repository یا مستندات commit نمی‌شوند.

## وضعیت

تکمیل‌شده با cloud build deferred.

## Hotfix 88.1

خطای `UnableToResolveError` برای `NotificationsEmitter` بررسی شد. dependency نصب‌شده فایل `NotificationsEmitter.js` را دارد و پس از `npx expo start --clear`، `npx expo export --platform android` با bundle موفق اجرا شد. placeholder `REPLACE_WITH_EAS_PROJECT_ID` از `app.json` حذف شد؛ برای build واقعی ابتدا `npx eas login` و سپس `npx eas init` در `apps/mobile` لازم است.

### Hotfix 88.2

- خطای خام Firebase/FCM در فعال‌سازی اعلان به پیام graceful تبدیل شد.
- دریافت token بدون projectId معتبر EAS انجام نمی‌شود.
- کپچای موبایل input واقعی پاسخ و ارسال مقدار به API دارد.
- mobile typecheck و Android export پس از اصلاح موفق شدند.
