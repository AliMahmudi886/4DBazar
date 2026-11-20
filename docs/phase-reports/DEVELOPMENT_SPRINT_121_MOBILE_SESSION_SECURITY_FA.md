# گزارش Development Sprint 121 — امنیت نشست موبایل

## هدف

کاهش ریسک نگهداری token نشست در storage عمومی موبایل و اطمینان از خروج کامل کاربر.

## تغییرات واقعی

- وابستگی رسمی `expo-secure-store` به اپ موبایل اضافه شد.
- token جدید در SecureStore ذخیره می‌شود و AsyncStorage فقط fallback سازگاری با کلاینت‌های قدیمی است.
- tokenهای موجود در AsyncStorage در اولین اجرا به SecureStore منتقل و از storage قدیمی حذف می‌شوند.
- خروج موبایل به‌صورت best-effort API logout را اجرا می‌کند و هر دو storage را پاک می‌کند.
- نسخه native به `0.1.13` و Android `versionCode=17` ارتقا یافت.

## اعتبارسنجی

- `npm run check`: PASS
- `npm run typecheck -w @four-d/mobile`: PASS
- `npx expo config --json`: PASS
- Gradle `assembleRelease`: PASS
- APK محلی: `release/mobile/4d-bazar-mobile-v0.1.13-build17-local.apk`
- SHA-256: `442A12898B7B50E2FD880DCE31928D9377ED0987EDB6B3B44AFE2D078F51BD56`

## موارد deferred

- refresh token و تمدید نشست بدون ورود مجدد هنوز قرارداد API و migration جدا می‌خواهد.
- تست نصب و logout روی گوشی واقعی بعد از نصب APK باید انجام شود.
