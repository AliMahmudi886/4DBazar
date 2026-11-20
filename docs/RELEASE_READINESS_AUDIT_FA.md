# ممیزی آمادگی انتشار 4D

تاریخ: 2026-08-17  
دامنه: Web، API و Mobile Release Candidate  
نتیجه: **آماده برای انتشار کنترل‌شده RC؛ هنوز آماده اعلام انتشار عمومی نهایی نیست.**

## نتیجه حوزه‌ها

| حوزه | نتیجه | شواهد و تغییر اصلی |
|---|---|---|
| طراحی و یکپارچگی | Pass | رنگ و لوگوی رسمی، focus state، contrast کنترل‌های فعال و breakpoint تبلت اصلاح شد |
| UI/UX و stateها | Pass با ریسک عملیاتی | loading/error/empty/retry، فرم‌های ورود و workspaceها بررسی شدند؛ smoke production باقی است |
| Responsive و مرورگر | Pass | ۲۷ حالت: ۳ مرورگر × ۳ viewport × ۳ route، بدون overflow یا runtime error |
| Accessibility | Pass پایه | semantic nav/tab/main، skip link، labelها، focus-visible و صفر violation جدی/بحرانی Axe |
| Performance | Pass بودجه | مجموع JS وب 510KB؛ chunk اصلی 412KB raw و حدود 119.9KB gzip؛ routeهای سنگین lazy هستند |
| SEO/PWA | Pass پایه | title/description/canonical/OG، robots، sitemap، manifest معتبر، iconهای 192/512 و cache strategy جدید |
| امنیت API/Web | Pass کد | CORS محدود، security headers، HSTS production، CSP، no-store auth، body limit، log redaction، magic-byte تصویر و path containment |
| کیفیت کد و تست | Pass با بدهی موبایل | build/typecheck و ۵۰ تست موفق؛ `App.tsx` موبایل همچنان بزرگ و دارای `@ts-nocheck` است |
| وابستگی‌ها | Pass وب/API؛ Monitoring موبایل | runtime وب/API صفر vulnerability؛ Expo/Metro دارای ۲۲ هشدار transitive و نیازمند migration major کنترل‌شده است |
| انتشار | RC آماده | preflight و بسته cPanel موفق؛ deploy smoke، backup media، FCM و device QA واقعی باز هستند |

## Validation اجراشده

```powershell
npm run check
npm run build
npm test
npm run bundle:check
npm run qa:visual
npm run qa:quality
npm run release:check
npm run release:cpanel
cd apps/mobile
npm run typecheck
npx expo-doctor --verbose
```

- ۴۹ تست API و ۱ تست shared پاس شدند.
- Expo Doctor هر ۱۸ بررسی را پاس کرد.
- quality QA روی Chromium، Firefox و WebKit در `390x844`، `768x1024` و `1440x1000` پاس شد.
- runtime dependency audit وب/API صفر مورد گزارش کرد.

## تغییرهای مهم

- metadata و assetهای SEO/PWA، robots/sitemap، caching و headerهای Apache تکمیل شدند.
- دسترس‌پذیری navigation، tabها، فرم‌ها، dialogها، تصاویر و کنترل‌های موبایل بهبود یافت.
- API در برابر body بزرگ، log داده حساس، path traversal، MIME spoofing و body malformed سخت‌تر شد.
- quality gate خودکار `npm run qa:quality` به پروژه اضافه شد.
- dependencyهای Expo با SDK 53 هم‌نسخه شدند، typeهای React یکدست شدند و مجوز میکروفون image picker حذف شد.

## Exit Criteria باز

- آپلود بسته تازه `release/cpanel/web` و `release/cpanel/api` و اجرای hosted smoke.
- backup زمان‌بندی‌شده و آزمون restore برای `data/media` تا زمان object storage.
- آزمون OTP، ورود با رمز، ثبت آگهی با تصویر، پروفایل و چت روی production.
- نصب APK روی حداقل یک گوشی Android واقعی و آزمون شبکه موبایل، deep link و permission اعلان.
- تصمیم صریح برای FCM credential؛ در غیر این صورت Push در RC باید deferred اعلام شود.
- migration کنترل‌شده Expo پیش از انتشار عمومی اپ؛ اجرای `npm audit fix --force` ممنوع است.
