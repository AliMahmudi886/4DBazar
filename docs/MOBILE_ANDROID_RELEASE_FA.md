# راهنمای خروجی Android بازار 4D

## آخرین خروجی آماده تست

### Build جدید

- نسخه: `0.1.0`، Android `versionCode=3`
- نوع خروجی: APK مستقل با profile `preview`
- لینک نصب EAS: `https://expo.dev/accounts/haj-ali/projects/four-d/builds/8dd015c5-b0de-4c5a-91cc-1802ff6625cd`
- وضعیت: Build موفق؛ روی `Pixel_2_API_36` نصب و اجرا شد. صفحه ورود، لوگو و پازل بررسی شدند؛ تست authenticated باقی است.

- نسخه: `0.1.0`، Android `versionCode=2`
- نوع خروجی: APK مستقل با profile `preview`
- فایل محلی: `release/mobile/4d-bazar-preview-v0.1.0-build2.apk`
- اندازه: حدود `61.2 MB`
- SHA-256: `4BEE8404BA784FDF0AE1F384026667267280E97A57549BF910F711FAC276534B`
- صفحه build: `https://expo.dev/accounts/haj-ali/projects/four-d/builds/620e9fd1-fa89-4d1c-95a2-b4ee1a0eecf6`

این APK در تاریخ 2026-08-17 روی emulator نصب و بدون Metro اجرا شد. لوگوی launcher، صفحه ورود و پازل mobile نیز بررسی بصری شدند. لینک artifact خود EAS ممکن است منقضی شود؛ فایل محلی بالا مرجع ارسال است.

کد جاری repository روی Android `versionCode=3` و iOS `buildNumber=3` است. این Build 3 شامل بهبود OTP Autofill/verify خودکار است؛ برای تست کامل باید ورود واقعی و دریافت OTP روی دستگاه اجرا شود.

## تفاوت خروجی‌ها

- `development`: فقط برای برنامه‌نویسی؛ به Metro نیاز دارد و برای ارسال به تست‌کننده مناسب نیست.
- `preview`: فایل APK مستقل و قابل نصب مستقیم؛ گزینه مناسب برای تست محدود دوستان و کاربران نزدیک.
- `production`: فایل AAB برای انتشار در فروشگاه؛ مستقیماً مثل APK نصب نمی‌شود.

## آماده‌سازی یک‌باره EAS

از ریشه پروژه در PowerShell:

```powershell
cd D:\Projects\4D
npm install
npx eas-cli login
npx eas-cli whoami
```

حساب EAS باید مالک یا عضو project ثبت‌شده در `apps/mobile/app.json` باشد.

## ساخت APK قابل ارسال

```powershell
cd D:\Projects\4D
npm run mobile:build:android:preview
```

در اولین build، اگر EAS درباره Android Keystore پرسید، گزینه ساخت خودکار credential توسط Expo را انتخاب کن. build روی cloud انجام می‌شود و در پایان یک لینک دانلود APK می‌دهد.

لینک EAS را می‌توان مستقیم برای تست‌کننده فرستاد، یا APK را دانلود و از طریق پیام‌رسان/فضای ابری ارسال کرد. تست‌کننده باید اجازه `Install unknown apps` را برای برنامه‌ای که APK را باز می‌کند فعال کند.

## نکته آیکن

آیکن launcher داخل APK ساخته می‌شود و با Reload یا Metro تغییر نمی‌کند. قبل از نصب APK جدید، نسخه Development Build قدیمی با package `ir.fourd.market` را از گوشی/emulator حذف کن؛ سپس APK preview را نصب کن. آیکن رسمی از این فایل‌ها ساخته می‌شود:

- `apps/mobile/assets/4d-app-icon.png`
- `apps/mobile/assets/4d-adaptive-foreground.png`

## ساخت نسخه فروشگاه

```powershell
npm run mobile:build:android:production
```

این دستور AAB می‌سازد. قبل از انتشار عمومی باید privacy policy، نام و توضیح فروشگاه، screenshot، content rating، data safety، FCM و تست دستگاه واقعی تکمیل شوند.

## چک‌لیست تست محدود

- نصب و نمایش صحیح لوگوی 4D در launcher
- باز شدن اپ بدون Metro و کامپیوتر
- اتصال به `https://api.4dbazar.ir`
- ورود با رمز و پیامک
- نمایش پیشنهاد OTP سیستم‌عامل، پرشدن کد و verify خودکار پس از ۶ رقم بدون درخواست مجوز کامل SMS
- تکمیل پروفایل و خروج/ورود مجدد
- نمایش بازار و جزئیات آگهی
- ثبت آگهی همراه تصویر
- ورود مستقیم از آگهی به گفتگو و ارسال پیام
- تست اینترنت ضعیف، قطع اینترنت و retry

در shared hosting فعلی، پوشه `data/media` باید backup شود؛ حذف آن تصاویر آگهی‌ها را از بین می‌برد.

## سیاست دسترسی پیامک

فیلد OTP از `sms-otp` در Android و `one-time-code` در iOS استفاده می‌کند. این hint به سیستم‌عامل اجازه می‌دهد کد را به‌صورت پیشنهاد Autofill نشان دهد و پس از کامل شدن شش رقم، اپ verify را یک‌بار اجرا می‌کند. `READ_SMS` و `RECEIVE_SMS` نباید برای این قابلیت اضافه شوند.

اگر محصول بعداً پنجره اجازه یک‌باره Android را بخواهد، باید SMS User Consent یا SMS Retriever در یک Development Build بومی پیاده، قالب SMS هماهنگ و سپس EAS preview تازه ساخته شود. Expo Go برای تایید نهایی آن کافی نیست.
