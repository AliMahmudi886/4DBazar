# راهنمای استقرار 4D روی cPanel

## معماری پیشنهادی

- `https://4dbazar.ir`: فایل‌های build وب
- `https://api.4dbazar.ir`: API Fastify/Node.js
- PostgreSQL: دیتابیس production جدا یا PostgreSQL قابل دسترس از هاست
- Object Storage: ذخیره عکس‌ها؛ `MEDIA_STORAGE_PROVIDER=local` برای production مناسب نیست

## ابتدا قابلیت هاست را بررسی کن

در cPanel دنبال `Setup Node.js App` یا `Application Manager` بگرد. از پشتیبانی این متن را بپرس:

> آیا این سرویس امکان اجرای دائمی Node.js 20 یا بالاتر، نصب npm، اجرای Fastify، تنظیم Environment Variables، اجرای SSH/Terminal، Cron Job و اتصال به PostgreSQL خارجی را دارد؟

اگر پاسخ Node.js یا PostgreSQL منفی است، این هاست فقط برای وب است و API باید روی سرویس جدا اجرا شود.

## انتشار وب استاتیک روی 4dbazar.ir

در ریشه پروژه بسته نهایی را بساز:

```powershell
npm run release:cpanel
```

فایل نسخه‌دار `release/cpanel/4d-web-v0.1.4-2026-08-20.zip` را داخل `public_html` هاست وب آپلود و همان‌جا Extract کن. این ZIP شامل `index.html`، assetهای hash شده، brand، icon، manifest، Service Worker و فایل مخفی `.htaccess` است. بعد از Extract مطمئن شو `index.html` مستقیماً داخل `public_html` است، نه داخل یک پوشه اضافه.

## اگر cPanel Node.js داشت

1. زیردامنه `api.4dbazar.ir` را بساز.
2. در `Setup Node.js App` نسخه Node 20+، Application Root برابر `4d-api` و startup برابر `apps/api/dist/main.js` را تعیین کن.
3. فایل نسخه‌دار `release/cpanel/4d-api-v0.1.4-2026-08-20.zip` را داخل `/home/a4dbazarir/4d-api` آپلود و Extract کن. پوشه موجود `data/media` را حذف نکن.
4. Environment Variables production را وارد کن؛ secretها هرگز داخل repository یا فایل `.env.example` قرار نگیرند.
5. virtual environment را فعال و dependencyهای package مستقل را نصب کن:

```bash
source ~/nodevenv/4d-api/20/bin/activate
cd ~/4d-api
npm install --omit=dev
```

6. فقط وقتی پوشه `db/migrations` تغییر کرده migration را اجرا کن:

```bash
npm run db:migrate
```

7. در cPanel روی `Restart App` بزن و health endpointها را بررسی کن.
8. برای worker اعلان یک Cron Job با `npm run notifications:worker` بساز.

روی هاست از `npm install -w ...`، install دستی packageها یا کپی `node_modules` ویندوز استفاده نکن. artifact مستقل dependencyهای دقیق مورد نیاز را در `package.json` خود دارد.

## Environmentهای ضروری API

```text
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=<port assigned by cPanel>
DATABASE_URL=<production PostgreSQL URL>
SESSION_SECRET=<long random secret>
CORS_ORIGINS=https://4dbazar.ir
OTP_PROVIDER=sms
SMS_VENDOR=kavenegar
SMS_API_KEY=<secret>
SMS_SENDER=<sender>
# Temporary only when the host DNS cannot resolve api.kavenegar.com:
SMS_API_IP=<verified provider IPv4>
MEDIA_STORAGE_PROVIDER=s3
MEDIA_S3_BUCKET=<bucket>
MEDIA_S3_ACCESS_KEY_ID=<secret>
MEDIA_S3_SECRET_ACCESS_KEY=<secret>
MEDIA_S3_PUBLIC_BASE_URL=<public media URL>
VAPID_PUBLIC_KEY=<public key>
VAPID_PRIVATE_KEY=<secret>
VAPID_SUBJECT=mailto:admin@4dbazar.ir
EXPO_PUSH_API_URL=https://exp.host/--/api/v2/push
```

### وضعیت موقت کم‌هزینه هاست فعلی

تا زمانی که object storage تهیه نشده، beta فعلی با این دو مقدار اجرا می‌شود:

```text
NODE_ENV=development
MEDIA_STORAGE_PROVIDER=local
MEDIA_STORAGE_DIR=data/media
MEDIA_PUBLIC_PATH=/media
```

این حالت release production واقعی نیست. از `/home/a4dbazarir/4d-api/data/media` backup بگیر و هنگام deploy آن را حذف نکن. پس از تهیه storage باید به `NODE_ENV=production` و `MEDIA_STORAGE_PROVIDER=s3` برگردد.

## موبایل

بعد از عمومی‌شدن API، در build موبایل مقدار زیر را تنظیم کن:

```text
EXPO_PUBLIC_API_BASE_URL=https://api.4dbazar.ir
```

سپس از `apps/mobile` نسخه preview یا production بساز. Development Build به Metro محلی نیاز دارد و برای انتشار نهایی مناسب نیست.

## تست بعد از انتشار

```powershell
curl.exe -i https://api.4dbazar.ir/health/live
curl.exe -i https://api.4dbazar.ir/health/ready
curl.exe -i -H "Origin: https://4dbazar.ir" https://api.4dbazar.ir/api/v1/categories
```

`live` و `ready` باید 200 باشند و درخواست سوم باید `access-control-allow-origin: https://4dbazar.ir` داشته باشد. در اولین انتشار Service Worker جدید، یک‌بار Chrome DevTools > Application > Service Workers > Update را بزن و سپس Hard Reload کن.

## نتیجه

اگر cPanel فقط PHP/LiteSpeed ارائه می‌کند، خرید فعلی برای وب کافی است اما API، ورود، SMS، چت و ثبت آگهی روی آن اجرا نمی‌شوند. در این حالت یک سرویس Node.js و PostgreSQL جدا لازم است.

## دستور آپدیت نسخه 0.1.4

1. از پوشه `/home/a4dbazarir/4d-api/data/media` backup بگیر و آن را حذف نکن.
2. ZIP API را در ریشه‌ی `/home/a4dbazarir/4d-api` Extract کن و جایگزینی فایل‌ها را تأیید کن.
3. داخل Terminal هاست اجرا کن:

```bash
source ~/nodevenv/4d-api/20/bin/activate
cd ~/4d-api
npm install --omit=dev
npm run db:migrate
```

4. در Node.js App روی `Restart App` بزن.
5. ZIP وب را در `public_html` Extract کن و مطمئن شو `.htaccess` و `index.html` در ریشه هستند.
6. این دو آدرس را بررسی کن:

```text
https://api.4dbazar.ir/health/live
https://api.4dbazar.ir/health/ready
```

7. اگر وب نسخه قبلی را نشان داد، در مرورگر Hard Reload و در Service Worker گزینه‌ی Update را اجرا کن.
