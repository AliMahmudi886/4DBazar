# اجرای محلی پروژه 4D

## پیش‌نیازها

- Node.js 22
- npm
- Docker Desktop روشن باشد

## نصب

```powershell
npm install
```

## اجرای دیتابیس

```powershell
npm run docker:up
npm run db:migrate
npm run db:seed
```

PostgreSQL پروژه روی پورت host `55432` بالا می‌آید تا با PostgreSQL/WSL محلی روی `5432` تداخل نداشته باشد.

اگر Docker خطای اتصال به `dockerDesktopLinuxEngine` داد، Docker Desktop را باز کن و صبر کن تا Engine کامل روشن شود.

## اجرای API و Web

در دو ترمینال جدا:

```powershell
npm run dev:api
```

```powershell
npm run dev:web
```

آدرس‌ها:

- API health: http://127.0.0.1:4000/health/live
- API ready: http://127.0.0.1:4000/health/ready
- Web shell: http://127.0.0.1:5173

## فعال‌سازی Push واقعی

برای ساخت کلیدهای VAPID از ابزار داخلی پروژه استفاده کن:

```powershell
npm run push:vapid
```

خروجی را داخل `D:\Projects\4D\.env` بگذار:

```env
VITE_VAPID_PUBLIC_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@4d.local
```

بعد API و Web را restart کن. در پروفایل کاربر دکمه «آماده‌سازی Push واقعی» subscription مرورگر را ثبت می‌کند. `VAPID_PRIVATE_KEY` secret است و نباید داخل repo یا `.env.example` با مقدار واقعی ذخیره شود.

بعد از ثبت دستگاه، دکمه «ارسال تست Push» در همان بخش پروفایل یک اعلان تستی واقعی برای همان حساب ارسال می‌کند.

Web app از طریق تنظیم `envDir` در Vite همین `.env` ریشه پروژه را می‌خواند؛ بنابراین لازم نیست `VITE_VAPID_PUBLIC_KEY` را در `apps/web/.env` جداگانه تکرار کنی. بعد از تغییر `.env`، هر دو dev server را restart کن.

## تست endpointهای پایه

```powershell
Invoke-RestMethod http://127.0.0.1:4000/api/v1/regions/4d/cities
Invoke-RestMethod http://127.0.0.1:4000/api/v1/categories
```

ثبت آگهی توسعه‌ای با کاربر seed شده:

```powershell
$body = @{
  title = "گوشی تست"
  description = "آگهی تست برای توسعه"
  city_id = "00000000-0000-4000-8000-000000000102"
  category_id = "00000000-0000-4000-8000-000000000202"
  price_amount = 8500000
  price_type = "fixed"
  item_condition = "used"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://127.0.0.1:4000/api/v1/listings `
  -Method Post `
  -ContentType "application/json" `
  -Headers @{
    "x-4d-user-id" = "00000000-0000-4000-8000-000000000301"
    "x-4d-mobile-verified" = "true"
  } `
  -Body $body
```

## Validation

```powershell
npm run check
npm run build
npm test
```
