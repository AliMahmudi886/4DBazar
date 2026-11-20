# راه‌اندازی مرحله‌ای API روی هاست پایتونی cPanel

این سند مسیر استقرار API پروژه 4D روی `api.4dbazar.ir` را مشخص می‌کند. در این مرحله دیتابیس فعلی منتقل نمی‌شود؛ ابتدا API و یک دیتابیس آزمایشی را بالا می‌آوریم.

## 1. بررسی سرویس هاست

در cPanel باید این موارد وجود داشته باشد:

- `Setup Node.js App` یا `Application Manager`
- Node.js نسخه 20 یا بالاتر
- امکان اجرای `npm install` و Terminal/SSH
- امکان تعریف Environment Variables
- PostgreSQL روی خود هاست، یا اجازه اتصال خروجی API به PostgreSQL خارجی
- SSL برای دامنه و زیر‌دامنه

صفحه رسمی هاست پایتون ایران‌هاست وجود NodeJS، npm، Terminal و git را اعلام می‌کند؛ PostgreSQL را باید از پشتیبانی برای همین پلن به‌صورت دقیق تأیید کرد: [مشخصات هاست پایتون ایران‌هاست](https://iranhost.com/webhosting/python-hosting/).

متن پیشنهادی برای پشتیبانی:

> برای اجرای API با Fastify و Node.js 20 روی زیر‌دامنه `api.4dbazar.ir`، آیا `Setup Node.js App` با process پایدار/Passenger و تعریف Environment Variables فعال است؟ آیا PostgreSQL روی همین سرویس ارائه می‌شود یا اتصال به PostgreSQL خارجی مجاز است؟ لطفاً Host، Port، نام دیتابیس، نام کاربر و روش SSL اتصال را اعلام کنید.

## 2. ساخت زیر‌دامنه API

در cPanel:

1. از `Domains` یک زیر‌دامنه به نام `api` بسازید.
2. دامنه آن `4dbazar.ir` باشد.
3. SSL را برای `api.4dbazar.ir` فعال کنید.
4. API را داخل `public_html` نگذارید؛ برای آن یک Application Root جدا بسازید، مثلاً `/home/USERNAME/4d-api`.

## 3. ساخت نسخه قابل استقرار روی ویندوز

از ریشه پروژه اجرا کنید:

```powershell
npm install
npm run check
npm run release:cpanel
```

خروجی رسمی API فایل زیر است:

```text
release/cpanel/api-upload.zip
```

آن را داخل `/home/a4dbazarir/4d-api` Extract کنید. این artifact مستقل است و به workspaceهای monorepo وابسته نیست. پوشه `data/media` موجود را حذف نکنید. سپس در Terminal اجرا کنید:

```bash
source ~/nodevenv/4d-api/20/bin/activate
cd ~/4d-api
npm install --omit=dev
```

در تنظیمات Node App:

```text
Application root: 4d-api
Startup file: apps/api/dist/main.js
Node version: 20+
```

سازگاری LiteSpeed: loader هاست فایل startup را با `require()` بارگذاری می‌کند؛ بنابراین ورودی `apps/api/dist/main.js` نباید top-level await داشته باشد. bootstrap فعلی API با این محدودیت سازگار است.

از commandهای `npm install -w` و نصب دستی packageها استفاده نکنید. مقدار `PORT` را خود cPanel تعیین می‌کند و کد API آن را پشتیبانی می‌کند.

## 4. Environment Variables مرحله تست

این مقادیر را در Environment Variables اپلیکیشن ثبت کنید؛ secretها را در چت یا repository قرار ندهید:

```text
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
SESSION_SECRET=<long-random-secret>
CORS_ORIGINS=https://4dbazar.ir
OTP_PROVIDER=sms
SMS_VENDOR=kavenegar
SMS_API_KEY=<kavenegar-key>
SMS_SENDER=1000880660
MEDIA_STORAGE_PROVIDER=s3
VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
VAPID_SUBJECT=mailto:admin@4dbazar.ir
```

برای مرحله اول، `DATABASE_URL` باید به دیتابیس خالی/staging اشاره کند، نه دیتابیس فعلی توسعه.

## 5. تست با دیتابیس خالی

پس از ثبت متغیرها، در Terminal هاست از ریشه Application Root اجرا کنید:

```bash
node apps/api/dist/db/migrate.js
```

فعلاً `seed` و انتقال اطلاعات قبلی را اجرا نکنید. سپس Application را Restart کنید و این آدرس‌ها را تست کنید:

```text
https://api.4dbazar.ir/health/live
https://api.4dbazar.ir/health/ready
https://api.4dbazar.ir/api/v1/regions/4d/cities
```

اگر `live` موفق و `ready` ناموفق بود، مشکل از اتصال PostgreSQL یا SSL است. اگر هر دو موفق بود، API و دیتابیس staging آماده تست هستند.

## 6. ترتیب تست محصول

1. باز شدن API و وب با HTTPS
2. ثبت‌نام و ورود با OTP
3. `GET /api/v1/me`
4. ساخت آگهی آزمایشی با تصویر
5. نمایش آگهی در feed
6. پروفایل و آگهی‌های من
7. گفت‌وگو و اعلان
8. دسترسی ادمین و moderation
9. تست نسخه موبایل با `EXPO_PUBLIC_API_BASE_URL=https://api.4dbazar.ir`

## 7. انتقال دیتابیس واقعی، فقط بعد از قبولی تست

بعد از تأیید کامل staging:

1. از PostgreSQL فعلی backup بگیرید (`pg_dump`).
2. یک backup جداگانه خارج از هاست نگه دارید.
3. روی دیتابیس production migrationها را اجرا کنید.
4. داده‌ها را با `pg_restore` یا `psql` وارد کنید.
5. count جدول‌های مهم و ورود کاربر ادمین را مقایسه کنید.
6. `DATABASE_URL` API را به production تغییر دهید و Restart کنید.

هیچ دستور `DROP DATABASE` یا پاک‌سازی را بدون backup و تأیید نهایی اجرا نکنید.

## 8. نتیجه‌های ممکن

- اگر Node و PostgreSQL هر دو روی همین هاست قابل اجرا باشند، API و دیتابیس روی همان سرویس deploy می‌شوند.
- اگر Node فعال باشد ولی PostgreSQL نباشد، API روی هاست می‌ماند و فقط PostgreSQL را روی سرویس جدا مثل دیتابیس managed قرار می‌دهیم.
- اگر Node فقط به‌صورت محدود یا بدون process پایدار ارائه شود، این هاست برای API مناسب نیست و فقط وب استاتیک روی آن می‌ماند.

تا وقتی پاسخ پشتیبانی درباره `Setup Node.js App` و PostgreSQL مشخص نشده، خرید یا انتقال دیتابیس انجام ندهید.
