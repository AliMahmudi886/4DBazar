# گزارش تکمیل Development Sprint 41

## عنوان

Web Root Env Loading Fix

## وضعیت

Done

## خروجی‌ها

- تنظیم `envDir: "../.."` به `apps/web/vite.config.ts` اضافه شد.
- web app اکنون هنگام dev/build فایل `.env` ریشه پروژه را می‌خواند.
- نیاز به تکرار `VITE_VAPID_PUBLIC_KEY` در `apps/web/.env` حذف شد.
- build وب تایید کرد public key در bundle تزریق می‌شود.
- بررسی امن تایید کرد private key داخل bundle وب leak نشده است.
- راهنمای اجرای محلی با توضیح restart بعد از تغییر env به‌روز شد.

## علت

Vite در workspace وب اجرا می‌شد و به صورت پیش‌فرض فقط env همان app را می‌خواند. کلیدها در `.env` ریشه درست بودند، اما `import.meta.env.VITE_VAPID_PUBLIC_KEY` در وب خالی می‌ماند.

## اعتبارسنجی

- VAPID env بدون چاپ secret بررسی شد.
- `npm run build -w @four-d/web`
- بررسی تزریق public key و عدم leak private key در bundle
- `npm run check`
- `npm run build`
- `npm test`
- `npm run qa:visual`
