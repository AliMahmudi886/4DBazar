# Production Readiness Checklist

## وضعیت

این چک‌لیست برای آماده‌سازی beta/deploy پروژه 4D است. قبل از deploy واقعی باید هر مورد یا انجام شود یا آگاهانه defer شود.

## Envهای ضروری API

```env
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=4000
DATABASE_URL=postgresql://...
SESSION_SECRET=long-random-secret
OTP_PROVIDER=sms
SMS_VENDOR=kavenegar
SMS_API_KEY=secret-manager-only
SMS_SENDER=1000880660
```

قواعد:

- `SESSION_SECRET=development-secret` در production ممنوع است.
- `OTP_PROVIDER=stub` در production ممنوع است.
- `SMS_API_KEY` نباید در repository، docs، screenshot یا issue ثبت شود.
- `AVALAI_API_KEY` و `AI_API_KEY` نباید در repository، frontend، bundle یا log ثبت شوند؛ این کلید فقط در secret manager محیط backend قرار می‌گیرد.
- برای فعال‌سازی AI واقعی: `AI_PROVIDER=avalai`، `AI_API_URL=https://api.avalai.ir/v1` و `AI_MODEL=gpt-5.6-luna` تنظیم شوند.
- برای Kavenegar، `SMS_SENDER` اجباری است.
- migrationها باید قبل از بالا آمدن API اجرا شوند.

## Commands

Validation محلی قبل از deploy:

```powershell
npm run ci:local
```

راه‌اندازی دیتابیس محلی:

```powershell
npm run docker:up
npm run db:migrate
npm run db:seed
```

نگهداری OTP:

```powershell
npm run db:cleanup:otp
```

Preflight انتشار:

```powershell
npm run release:check
$env:RELEASE_PREFLIGHT_STRICT="1"
$env:NODE_ENV="production"
npm run release:check
```

در production واقعی، `MEDIA_STORAGE_DIR` نباید روی filesystem موقت کانتینر باشد؛ یا volume پایدار برای آن تعریف شود یا media به object storage منتقل شود. برای beta داخلی local media با backup صریح قابل قبول است.

## Deploy Sequence

1. نصب dependencies با `npm ci`
2. اجرای `npm run check`
3. اجرای `npm run build`
4. اجرای `npm test`
5. اجرای migrationها با `npm run db:migrate`
6. تنظیم secretها در secret manager محیط deploy
7. اجرای API از `apps/api/dist/main.js`
8. سرو کردن خروجی web از `apps/web/dist`
9. اجرای smokeهای health، auth و مسیر `/admin`

## Smoke Checks

- `GET /health/live` باید `ok` باشد.
- `GET /health/ready` باید database را `ok` گزارش کند.
- `POST /api/v1/auth/request-otp` با شماره تست باید `202` بدهد.
- `POST /api/v1/auth/verify-otp` با کد دریافتی باید `201` بدهد.
- `/admin` باید بدون role moderator حالت دسترسی محدود نشان دهد.
- با role moderator، queue moderation باید load شود.

## موارد باقی‌مانده

- زمان‌بندی cleanup OTP در محیط deploy
- secret rotation برای SMS provider
- baseline visual snapshots در CI
- alerting برای خطای audit/SMS/database
- volume پایدار یا object storage برای media در production واقعی
- تنظیم domain/HTTPS و origin محدود برای CORS
- اجرای strict release preflight با secret manager محیط deploy

وضعیت Sprint 51:

- `npm run release:check` موفق شد.
- strict preflight با envهای production موفق شد.
- `check`، `build`، `bundle:check` و `qa:visual` موفق شدند.
- دو تست rate-limit به‌دلیل خاموش بودن Docker/PostgreSQL نیازمند اجرای مجدد هستند.
## Media production gate

- `media_assets` باید با migration `0017` در PostgreSQL ایجاد شود.
- `MEDIA_STORAGE_DIR` در production نباید filesystem موقت باشد؛ object storage یا volume پایدار لازم است.
- `asset_id` و `checksum_sha256` باید در upload smoke بررسی شوند.
## Object storage production gate

- `MEDIA_STORAGE_PROVIDER=s3`
- `MEDIA_S3_BUCKET`، `MEDIA_S3_REGION`، `MEDIA_S3_ACCESS_KEY_ID` و `MEDIA_S3_SECRET_ACCESS_KEY` از secret manager
- `MEDIA_S3_PUBLIC_BASE_URL` با CDN یا public object endpoint
- اجرای upload smoke و بررسی `asset_id` و `checksum_sha256`
