# راهنمای اتصال SMS Provider

## وضعیت فعلی

Backend اکنون با `OTP_PROVIDER=sms` مسیر واقعی request/verify دارد و vendor اختصاصی Kavenegar را پشتیبانی می‌کند. در development/test اگر credential خالی باشد، ارسال پیامک dry-run می‌شود تا توسعه محلی متوقف نشود. در production، secretهای لازم اجباری هستند.

## Envهای لازم

```env
OTP_PROVIDER=sms
SMS_VENDOR=kavenegar
SMS_API_KEY=put-real-key-in-local-env-only
SMS_SENDER=20006535
```

برای provider عمومی:

```env
OTP_PROVIDER=sms
SMS_VENDOR=generic
SMS_API_URL=https://provider.example/send
SMS_API_KEY=put-real-key-in-local-env-only
SMS_SENDER=
SMS_TEMPLATE_ID=
```

کلید واقعی نباید داخل repository، issue، chat یا مستندات ثبت شود. فقط در `.env` محلی یا secret manager production قرار می‌گیرد.

## چیزی که از provider لازم داریم

- endpoint ارسال پیامک
- روش authentication، مثل Bearer token، `x-api-key` یا query string
- نمونه payload ارسال کد
- نمونه response موفق و نام فیلد status/message id
- نمونه response خطا و status codeها
- محدودیت rate limit و قالب شماره موبایل ایران
- اگر سرویس template دارد، شناسه template و نام متغیر کد

## نمونه مناسب برای دادن به Codex

API key واقعی را حذف کن و چیزی شبیه این بده:

```ts
await fetch("https://sms-provider.example/api/send", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": "REDACTED"
  },
  body: JSON.stringify({
    receptor: "[REDACTED_PHONE]",
    template: "otp",
    token: "123456"
  })
});
```

چون backend پروژه Node/TypeScript است، نمونه Node/JavaScript یا مستند REST بهترین گزینه است. نمونه C# هم قابل استفاده است، اما باید به fetch/TypeScript تبدیل شود.

## تنظیم Kavenegar

برای کاوه‌نگار نیازی به نصب package جدا نیست. API از مسیر REST استفاده می‌کند:

```env
OTP_PROVIDER=sms
SMS_VENDOR=kavenegar
SMS_API_KEY=REDACTED
SMS_SENDER=20006535
```

شماره ورودی API پروژه با فرمت `+98...` پذیرفته می‌شود و قبل از ارسال به Kavenegar به فرمت `09...` تبدیل می‌شود.

اگر DNS هاست به‌صورت موقت `api.kavenegar.com` را resolve نمی‌کند، IP تاییدشده با `curl --resolve` را می‌توان در env زیر قرار داد:

```env
SMS_API_IP=46.102.138.125
```

این گزینه فقط lookup همان درخواست کاوه‌نگار را دور می‌زند؛ hostname اصلی برای SNI و اعتبارسنجی TLS حفظ می‌شود. IP نباید داخل source hardcode شود و بعد از اصلاح DNS هاست باید `SMS_API_IP` حذف شود، چون IP سرویس‌دهنده ممکن است تغییر کند.

adapter علاوه بر HTTP status، مقدار `return.status` پاسخ کاوه‌نگار و وجود `entries[0].messageid` را بررسی می‌کند. فقط `return.status=200` همراه با شناسه پیام به‌عنوان پذیرش ارسال محسوب می‌شود؛ خطای provider با کد امن به کاربر برمی‌گردد و جزئیات فاقد secret در log ثبت می‌شود.

## تست واقعی پیامک

ابتدا PostgreSQL را بالا بیاور و migration/seed را اجرا کن:

```powershell
npm run docker:up
npm run db:migrate
npm run db:seed
```

بعد envها را در `.env` محلی قرار بده. API key واقعی را داخل فایل‌های مستند یا source ننویس.

```env
OTP_PROVIDER=sms
SMS_VENDOR=kavenegar
SMS_API_KEY=REDACTED
SMS_SENDER=20006535
TEST_PHONE_NUMBER=[REDACTED_PHONE]
```

حالا smoke test را اجرا کن:

```powershell
npm run sms:smoke
```

اسکریپت پیامک را می‌فرستد، کد دریافتی را از ترمینال می‌پرسد، سپس `/api/v1/auth/verify-otp` را صدا می‌زند. اگر موفق باشد، user id و ابتدای session token را نشان می‌دهد.

در محیط متصل به PostgreSQL، challenge کد تایید به‌صورت persisted ذخیره می‌شود و restart عادی API آن را از بین نمی‌برد. `npm run sms:smoke` همچنان مسیر کامل ارسال، دریافت کد و verify را یکجا آزمایش می‌کند.

برای تست‌های کنترل‌شده یا حالت stub می‌توانی کد را با env بدهی:

```powershell
$env:OTP_CODE="123456"; npm run sms:smoke
```

در حالت عادی نیازی به این نیست؛ `npm run sms:smoke` در PowerShell باید بعد از ارسال SMS منتظر ورود کد بماند. این script فایل `.env` ریشه پروژه را می‌خواند، حتی اگر npm workspace اجرای داخلی را از مسیر `apps/api` انجام دهد.

برای Kavenegar واقعی، روش prompt بهتر است؛ چون هر اجرای script یک OTP تازه می‌سازد و همان کد تازه باید در همان process وارد شود.

برای تست از طریق UI، API را با همین envها اجرا کن:

```powershell
npm run dev:api
npm run dev:web
```

سپس در وب، ورود/OTP را با شماره‌ای که به آن دسترسی داری تست کن. در حالت SMS دیگر `dev_code` در response نمایش داده نمی‌شود و کد فقط از پیامک می‌آید.
