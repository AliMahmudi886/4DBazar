# گزارش تکمیل Development Sprint 68

تاریخ: 2026-08-13

## هدف

رفع خطای ورود روی Expo Go و کامل‌کردن مسیرهای واقعی authentication در موبایل.

## خروجی

- ورود با رمز عبور از `/api/v1/auth/password-login`
- ورود پیامکی با challenge و proof امنیتی
- اصلاح verify payload از `code` به `otp`
- نمایش خطای API برای تشخیص سریع rate limit، captcha و credential اشتباه
- بارگذاری دوباره challenge بعد از انقضا یا مصرف

## اعتبارسنجی

- `npm run typecheck -w @four-d/mobile` موفق
- `npx expo export --platform android` موفق
- کل validation پروژه در Sprint 67 پس از pin کردن React روی `19.0.0` موفق باقی ماند.

## تست دستی

```powershell
cd D:\Projects\4D
npm run dev:mobile -- --clear
```

در emulator، برای API روی سیستم میزبان مقدار `EXPO_PUBLIC_API_BASE_URL` را روی IP سیستم مثل `http://10.8.0.93:4000` بگذار.

## گام بعد

تکمیل profile onboarding موبایل، ذخیره نام و نام خانوادگی و ساخت message thread واقعی.
